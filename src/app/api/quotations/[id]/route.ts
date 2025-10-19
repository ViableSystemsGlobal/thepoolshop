import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/quotations/[id] - Get a single quotation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TEMPORARY: Skip authentication for testing
    const { id } = await params;
    console.log('🔍 GET quotation API - Starting request for ID:', id);
    
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      select: {
        id: true,
        number: true,
        subject: true,
        status: true,
        total: true,
        subtotal: true,
        tax: true,
        taxInclusive: true,
        notes: true,
        validUntil: true,
        customerType: true,
        qrCodeData: true,
        qrCodeGeneratedAt: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
        account: {
          select: { id: true, name: true, email: true, phone: true },
        },
        distributor: {
          select: { id: true, businessName: true, email: true, phone: true },
        },
        lead: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, company: true },
        },
        lines: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, price: true, images: true }
            }
          }
        },
        invoices: {
          select: { id: true, number: true, createdAt: true, status: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      } as any,
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotation' },
      { status: 500 }
    );
  }
}

// PUT /api/quotations/[id] - Update a quotation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // TEMPORARY: Skip authentication for testing
    console.log('🔍 PUT quotation API - Starting request for ID:', id);
    
    // const session = await getServerSession(authOptions);
    // 
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // const userId = (session.user as any).id;
    const userId = 'cmgxgoy9w00008z2z4ajxyw47'; // TEMPORARY: Hardcoded user ID for testing (correct user ID)
    const body = await request.json();
    
    
    const {
      subject,
      validUntil,
      notes,
      accountId,
      distributorId,
      leadId,
      contactId, // We'll ignore this since quotations don't have direct contactId
      customerType,
      status,
      lines = [],
      taxInclusive = false,
    } = body;

    // Validate required fields
    if (!subject?.trim()) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    // TEMPORARY: Skip owner check for testing
    // Check if quotation exists and user has access
    const existingQuotation = await prisma.quotation.findFirst({
      where: {
        id,
        // ownerId: userId,  // TEMPORARY: Commented out for testing
      },
    });

    if (!existingQuotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }
    

    // Process line items and calculate totals
    const processedLines = lines.map((line: any) => {
      const lineTotal = line.quantity * line.unitPrice * (1 - (line.discount || 0) / 100);
      return {
        ...line,
        lineTotal,
      };
    });

    // Calculate totals
    const subtotal = processedLines.reduce((sum: number, line: any) => sum + line.lineTotal, 0);
    
    // Calculate tax from line items
    const taxesByType: { [key: string]: number } = {};
    processedLines.forEach((line: any) => {
      if (line.taxes && Array.isArray(line.taxes)) {
        line.taxes.forEach((tax: any) => {
          taxesByType[tax.name] = (taxesByType[tax.name] || 0) + tax.amount;
        });
      }
    });
    const totalTax = Object.values(taxesByType).reduce((sum: number, amount: number) => sum + amount, 0);

    // Update quotation
    console.log('🔍 Updating quotation with data:', {
      id,
      accountId,
      distributorId,
      subject
    });
    
    // Build update data object, only including fields that are provided
    const updateData: any = {
      subject,
      validUntil: validUntil ? new Date(validUntil) : null,
      notes,
      subtotal,
      tax: totalTax,
      total: subtotal + totalTax,
      taxInclusive,
      customerType: customerType || 'STANDARD',
    };

    // Only update customer references if they are explicitly provided
    if (accountId !== undefined) {
      updateData.accountId = accountId && accountId !== 'test123' ? accountId : null;
    }
    if (distributorId !== undefined) {
      updateData.distributorId = distributorId || null;
    }
    if (leadId !== undefined) {
      updateData.leadId = leadId || null;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    const quotation = await prisma.quotation.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        account: {
          select: { id: true, name: true, email: true },
        },
        lines: true,
      } as any,
    });

    console.log('✅ Quotation updated successfully:', {
      id: quotation.id,
      accountId: quotation.accountId,
      subject: quotation.subject
    });

    // Update existing opportunity value if quotation is linked to an opportunity
    if ((quotation as any).opportunityId) {
      console.log('🔍 Updating opportunity value for quotation:', quotation.id);
      await prisma.opportunity.update({
        where: { id: (quotation as any).opportunityId },
        data: {
          value: quotation.total,
        },
      });
      console.log('✅ Updated opportunity value to:', quotation.total);
    }

    // Check if we need to create an opportunity (when quotation is updated with accountId and has leadId)
    if (accountId && existingQuotation.leadId && !(existingQuotation as any).opportunityId) {
      console.log('🔍 Creating opportunity from updated quotation with leadId:', existingQuotation.leadId);
      
      // Verify that the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        console.log('❌ User not found:', userId);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Verify that the account exists
      const account = await prisma.account.findUnique({
        where: { id: accountId }
      });
      
      if (!account) {
        console.log('❌ Account not found:', accountId);
        return NextResponse.json(
          { error: 'Account not found' },
          { status: 404 }
        );
      }
      
      // Update lead status to CONVERTED_TO_OPPORTUNITY
      await prisma.lead.update({
        where: { id: existingQuotation.leadId },
        data: {
          status: 'CONVERTED_TO_OPPORTUNITY' as any,
          dealValue: quotation.total,
          probability: 25, // Default probability when quote is sent
        },
      });

      // Create an Opportunity
      const lead = await prisma.lead.findUnique({
        where: { id: existingQuotation.leadId },
        select: { firstName: true, lastName: true, company: true },
      });

      const opportunityName = lead?.company || `${lead?.firstName} ${lead?.lastName}` || 'Untitled Opportunity';

      const opportunity = await prisma.opportunity.create({
        data: {
          name: opportunityName,
          stage: 'QUOTE_SENT' as any,
          value: quotation.total,
          probability: 25,
          accountId: accountId,
          leadId: existingQuotation.leadId,
          ownerId: userId,
        } as any,
      });

      console.log('✅ Created opportunity from updated quotation:', opportunity.id);

      // Link the quotation to the opportunity
      await prisma.quotation.update({
        where: { id: quotation.id },
        data: { opportunityId: opportunity.id } as any,
      });
    }

    // Update line items only if lines are provided
    if (lines.length > 0) {
      // Delete existing lines
      await prisma.quotationLine.deleteMany({
        where: { quotationId: id },
      });

      // Create new lines
      await prisma.quotationLine.createMany({
        data: processedLines.map((line: any) => ({
          quotationId: id,
          productId: line.productId || 'dummy-product-id',
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discount: line.discount || 0,
          lineTotal: line.lineTotal,
        })),
      });
    } else {
      // If no lines provided, recalculate totals from existing line items
      const existingLines = await prisma.quotationLine.findMany({
        where: { quotationId: id },
      });
      
      const recalculatedSubtotal = existingLines.reduce((sum, line) => sum + line.lineTotal, 0);
      const recalculatedTax = 0; // Assuming no taxes for existing lines
      const recalculatedTotal = recalculatedSubtotal + recalculatedTax;
      
      // Update quotation with recalculated totals
      await prisma.quotation.update({
        where: { id },
        data: {
          subtotal: recalculatedSubtotal,
          tax: recalculatedTax,
          total: recalculatedTotal,
        },
      });
    }

    // Update lead's dealValue if this quotation is linked to a lead
    if (quotation.leadId) {
      const finalTotal = lines.length > 0 ? subtotal + totalTax : (await prisma.quotation.findUnique({ where: { id } }))?.total || 0;
      await prisma.lead.update({
        where: { id: quotation.leadId },
        data: {
          dealValue: finalTotal,
        },
      });
    }

    return NextResponse.json(quotation);
  } catch (error: any) {
    console.error('Error updating quotation:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to update quotation' },
      { status: 500 }
    );
  }
}

// DELETE /api/quotations/[id] - Delete a quotation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const userId = (session.user as any).id;
    const userId = 'cmgxgoy9w00008z2z4ajxyw47'; // Hardcoded for testing

    // Check if quotation exists and user has access
    const existingQuotation = await prisma.quotation.findFirst({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!existingQuotation) {
      return NextResponse.json(
        { error: 'Quotation not found or access denied' },
        { status: 404 }
      );
    }

    // Delete quotation lines first (since cascade delete isn't set up)
    await prisma.quotationLine.deleteMany({
      where: { quotationId: id },
    });

    // Then delete the quotation
    await prisma.quotation.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      { error: 'Failed to delete quotation' },
      { status: 500 }
    );
  }
}
