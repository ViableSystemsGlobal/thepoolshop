import { prisma } from '@/lib/prisma';

export interface CommissionCalculation {
  agentId: string;
  agentCode: string;
  agentName: string;
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  role: 'PRIMARY' | 'SUPPORT' | 'CONSULTANT';
}

export interface CommissionSettings {
  enabled: boolean;
  systemRate: number;
  calculationType: 'REVENUE' | 'PROFIT';
  minInvoiceAmount: number;
}

/**
 * Commission Service
 * Handles all commission calculation and creation logic
 */
export class CommissionService {
  
  /**
   * Get commission settings from system settings
   */
  static async getSettings(): Promise<CommissionSettings> {
    const settings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: [
            'commission_enabled',
            'commission_system_rate',
            'commission_calculation_type',
            'commission_min_invoice_amount'
          ]
        }
      }
    });

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      enabled: settingsMap.commission_enabled !== 'false',
      systemRate: parseFloat(settingsMap.commission_system_rate || '10'),
      calculationType: (settingsMap.commission_calculation_type || 'REVENUE') as 'REVENUE' | 'PROFIT',
      minInvoiceAmount: parseFloat(settingsMap.commission_min_invoice_amount || '0')
    };
  }

  /**
   * Detect agents from invoice
   * Returns list of agents associated with the invoice
   */
  static async detectAgentsFromInvoice(invoiceId: string): Promise<CommissionCalculation[]> {
    // Get invoice with owner and related data
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        owner: true,
        agentInvoices: {
          include: {
            agent: {
              include: {
                user: true
              }
            }
          }
        },
        lines: {
          include: {
            product: {
              select: { cost: true }
            }
          }
        }
      }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const settings = await this.getSettings();
    
    // Check if commission is enabled
    if (!settings.enabled) {
      return [];
    }

    // Check minimum invoice amount
    if (invoice.total < settings.minInvoiceAmount) {
      return [];
    }

    const calculations: CommissionCalculation[] = [];

    // Check if there are explicitly assigned agents via AgentInvoice
    if (invoice.agentInvoices && invoice.agentInvoices.length > 0) {
      // Multiple agents scenario - use system rate and split
      const agentCount = invoice.agentInvoices.length;
      const baseAmount = await this.calculateBaseAmount(invoice, settings.calculationType);
      
      for (const agentInvoice of invoice.agentInvoices) {
        const agent = agentInvoice.agent;
        
        // If custom split percentage is defined, use it; otherwise split equally
        const splitPercent = agentInvoice.splitPercent || (settings.systemRate / agentCount);
        const commissionAmount = baseAmount * (splitPercent / 100);

        calculations.push({
          agentId: agent.id,
          agentCode: agent.agentCode,
          agentName: agent.user.name || agent.user.email,
          baseAmount,
          commissionRate: splitPercent,
          commissionAmount,
          role: agentInvoice.role
        });
      }
    } else {
      // No explicitly assigned agents - check if invoice owner is an agent
      const ownerAgent = await prisma.agent.findUnique({
        where: { userId: invoice.ownerId },
        include: {
          user: true
        }
      });

      if (ownerAgent && ownerAgent.status === 'ACTIVE') {
        // Single agent scenario - use their personal commission rate
        const baseAmount = await this.calculateBaseAmount(invoice, settings.calculationType);
        const commissionAmount = baseAmount * (ownerAgent.commissionRate / 100);

        calculations.push({
          agentId: ownerAgent.id,
          agentCode: ownerAgent.agentCode,
          agentName: ownerAgent.user.name || ownerAgent.user.email,
          baseAmount,
          commissionRate: ownerAgent.commissionRate,
          commissionAmount,
          role: 'PRIMARY'
        });
      }
    }

    return calculations;
  }

  /**
   * Calculate base amount for commission
   * Either revenue (invoice total) or profit (invoice total - costs)
   */
  private static async calculateBaseAmount(
    invoice: any,
    calculationType: 'REVENUE' | 'PROFIT'
  ): Promise<number> {
    if (calculationType === 'REVENUE') {
      return invoice.total;
    }

    // Calculate profit: total revenue - total costs
    let totalCost = 0;
    for (const line of invoice.lines) {
      const cost = line.product?.cost || 0;
      totalCost += cost * line.quantity;
    }

    return Math.max(0, invoice.total - totalCost);
  }

  /**
   * Create commissions for an invoice
   * Called when invoice is paid
   */
  static async createCommissionsForInvoice(
    invoiceId: string,
    performedBy?: string
  ): Promise<any[]> {
    const calculations = await this.detectAgentsFromInvoice(invoiceId);
    
    if (calculations.length === 0) {
      return [];
    }

    const createdCommissions = [];

    for (const calc of calculations) {
      // Check if commission already exists for this agent and invoice
      const existing = await prisma.commission.findFirst({
        where: {
          agentId: calc.agentId,
          invoiceId: invoiceId
        }
      });

      if (existing) {
        console.log(`Commission already exists for agent ${calc.agentCode} on invoice`);
        continue;
      }

      // Create commission
      const commission = await prisma.commission.create({
        data: {
          agentId: calc.agentId,
          invoiceId: invoiceId,
          commissionType: 'SALES',
          calculationType: 'PERCENTAGE',
          baseAmount: calc.baseAmount,
          commissionRate: calc.commissionRate,
          commissionAmount: calc.commissionAmount,
          status: 'PENDING',
          notes: `Auto-generated from invoice payment`
        },
        include: {
          agent: {
            include: {
              user: true
            }
          }
        }
      });

      // Create audit log
      if (performedBy) {
        await prisma.commissionAudit.create({
          data: {
            commissionId: commission.id,
            action: 'CREATED',
            newStatus: 'PENDING',
            newAmount: calc.commissionAmount,
            performedBy: performedBy,
            notes: `Commission auto-created on invoice payment`
          }
        });
      }

      createdCommissions.push(commission);
      
      console.log(`✅ Created commission ${commission.id} for agent ${calc.agentCode}: GH₵${calc.commissionAmount.toFixed(2)}`);
    }

    return createdCommissions;
  }

  /**
   * Approve a commission
   * Changes status from PENDING to APPROVED
   */
  static async approveCommission(
    commissionId: string,
    approvedBy: string,
    reason?: string
  ): Promise<any> {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId }
    });

    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status !== 'PENDING') {
      throw new Error(`Commission is ${commission.status}, cannot approve`);
    }

    const updated = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date()
      },
      include: {
        agent: {
          include: {
            user: true
          }
        },
        invoice: true
      }
    });

    // Create audit log
    await prisma.commissionAudit.create({
      data: {
        commissionId,
        action: 'APPROVED',
        previousStatus: 'PENDING',
        newStatus: 'APPROVED',
        performedBy: approvedBy,
        reason,
        notes: `Commission approved`
      }
    });

    console.log(`✅ Approved commission ${commissionId}`);

    return updated;
  }

  /**
   * Mark commission as paid
   * Changes status from APPROVED to PAID
   */
  static async markCommissionPaid(
    commissionId: string,
    performedBy: string,
    paidDate?: Date,
    reason?: string
  ): Promise<any> {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId }
    });

    if (!commission) {
      throw new Error('Commission not found');
    }

    if (commission.status !== 'APPROVED') {
      throw new Error(`Commission is ${commission.status}, must be APPROVED before marking as paid`);
    }

    const updated = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: 'PAID',
        paidDate: paidDate || new Date()
      },
      include: {
        agent: {
          include: {
            user: true
          }
        },
        invoice: true
      }
    });

    // Create audit log
    await prisma.commissionAudit.create({
      data: {
        commissionId,
        action: 'PAID',
        previousStatus: 'APPROVED',
        newStatus: 'PAID',
        performedBy,
        reason,
        notes: `Commission marked as paid`
      }
    });

    console.log(`✅ Marked commission ${commissionId} as paid`);

    return updated;
  }

  /**
   * Calculate commission preview for an invoice
   * Shows what commissions would be created if invoice is paid
   */
  static async previewCommissions(invoiceId: string): Promise<CommissionCalculation[]> {
    return await this.detectAgentsFromInvoice(invoiceId);
  }

  /**
   * Assign agents to an invoice
   * Creates AgentInvoice records for multiple agents
   */
  static async assignAgentsToInvoice(
    invoiceId: string,
    assignments: Array<{
      agentId: string;
      role?: 'PRIMARY' | 'SUPPORT' | 'CONSULTANT';
      splitPercent?: number;
    }>
  ): Promise<any[]> {
    const created = [];

    for (const assignment of assignments) {
      // Check if assignment already exists
      const existing = await prisma.agentInvoice.findUnique({
        where: {
          agentId_invoiceId: {
            agentId: assignment.agentId,
            invoiceId: invoiceId
          }
        }
      });

      if (!existing) {
        const agentInvoice = await prisma.agentInvoice.create({
          data: {
            agentId: assignment.agentId,
            invoiceId: invoiceId,
            role: assignment.role || 'PRIMARY',
            splitPercent: assignment.splitPercent || null
          },
          include: {
            agent: {
              include: {
                user: true
              }
            }
          }
        });

        created.push(agentInvoice);
      }
    }

    return created;
  }
}

