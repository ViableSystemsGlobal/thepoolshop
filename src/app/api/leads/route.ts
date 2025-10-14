import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationService, SystemNotificationTriggers } from '@/lib/notification-service';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Leads API: GET request received');
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // console.log('🔍 Leads API: Session exists:', !!session);
    // console.log('🔍 Leads API: User exists:', !!session?.user);
    
    // if (!session?.user) {
    //   console.log('❌ Leads API: No session or user');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // const userId = (session.user as any).id;
    const userId = 'cmfpufpb500008zi346h5hntw'; // Hardcoded for testing - System Administrator
    console.log('🔍 Leads API: User ID:', userId);
    
    if (!userId) {
      console.log('❌ Leads API: No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {
      ownerId: userId,
      // Exclude opportunity statuses from leads
      status: {
        notIn: ['NEW_OPPORTUNITY', 'QUOTE_SENT', 'NEGOTIATION', 'CONTRACT_SIGNED', 'WON', 'LOST']
      }
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ];
    }

    console.log('🔍 Leads API: Where clause:', JSON.stringify(where, null, 2));
    
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    console.log('🔍 Leads API: Found leads:', leads.length);

    // Parse JSON fields for each lead
    const parsedLeads = leads.map(lead => ({
      ...lead,
      assignedTo: (lead as any).assignedTo ? (() => {
        try {
          return JSON.parse((lead as any).assignedTo);
        } catch (e) {
          console.error('Error parsing assignedTo for lead', lead.id, ':', e);
          return null;
        }
      })() : null,
      interestedProducts: (lead as any).interestedProducts ? (() => {
        try {
          return JSON.parse((lead as any).interestedProducts);
        } catch (e) {
          console.error('Error parsing interestedProducts for lead', lead.id, ':', e);
          return null;
        }
      })() : null,
    }));

    return NextResponse.json(parsedLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/leads - Starting request');
    // TEMPORARY: Skip authentication for testing
    // const session = await getServerSession(authOptions);
    // console.log('Session:', session);
    
    // if (!session?.user) {
    //   console.log('No session or user found');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // const userId = (session.user as any).id;
    const userId = 'cmfpufpb500008zi346h5hntw'; // Hardcoded for testing - System Administrator
    console.log('User ID:', userId);
    
    // if (!userId) {
    //   console.log('No user ID found');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await request.json();
    console.log('Request body:', body);
    
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      source,
      status = 'NEW',
      score = 0,
      notes,
      subject,
      leadType = 'INDIVIDUAL',
      assignedTo,
      interestedProducts,
      followUpDate,
      hasBillingAddress,
      hasShippingAddress,
      sameAsBilling,
      billingAddress,
      shippingAddress,
    } = body;

    if (!firstName || !lastName) {
      console.log('Missing required fields:', { firstName, lastName });
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    console.log('Creating lead with data:', {
      firstName,
      lastName,
      email,
      phone,
      company,
      source,
      status,
      score,
      notes,
      ownerId: userId,
    });

    const lead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        source,
        status,
        score,
        notes,
        subject: subject as any,
        leadType: leadType as any,
        assignedTo: assignedTo && Array.isArray(assignedTo) && assignedTo.length > 0 ? JSON.stringify(assignedTo) : null,
        interestedProducts: interestedProducts && Array.isArray(interestedProducts) && interestedProducts.length > 0 ? JSON.stringify(interestedProducts) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        ownerId: userId,
        // Address fields
        hasBillingAddress: hasBillingAddress || false,
        hasShippingAddress: hasShippingAddress || false,
        sameAsBilling: sameAsBilling !== undefined ? sameAsBilling : true,
        billingAddress: billingAddress ? billingAddress : null,
        shippingAddress: shippingAddress ? shippingAddress : null,
      } as any,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    console.log('Lead created successfully:', lead);

    // Log activity
    try {
      await prisma.activity.create({
        data: {
          entityType: 'Lead',
          entityId: lead.id,
          action: 'created',
          details: { lead: { firstName, lastName, email, company } },
          userId: userId,
        },
      });
      console.log('Activity logged successfully');
    } catch (activityError) {
      console.error('Error logging activity:', activityError);
      // Don't fail the request if activity logging fails
    }

    // Parse JSON fields
    const parsedLead = {
      ...lead,
      assignedTo: (lead as any).assignedTo ? (() => {
        try {
          return JSON.parse((lead as any).assignedTo);
        } catch (e) {
          console.error('Error parsing assignedTo:', e);
          return null;
        }
      })() : null,
      interestedProducts: (lead as any).interestedProducts ? (() => {
        try {
          return JSON.parse((lead as any).interestedProducts);
        } catch (e) {
          console.error('Error parsing interestedProducts:', e);
          return null;
        }
      })() : null,
    };

    // Send notifications for lead creation
    try {
      await sendLeadNotifications(lead, parsedLead, userId);
    } catch (notificationError) {
      console.error('Error sending lead notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    return NextResponse.json(parsedLead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// Helper function to send lead creation notifications
async function sendLeadNotifications(lead: any, parsedLead: any, creatorId: string) {
  try {
    console.log('🚀 Starting to send lead notifications...');
    console.log('Lead details:', { 
      name: `${lead.firstName} ${lead.lastName}`, 
      email: lead.email, 
      phone: lead.phone,
      assignedTo: parsedLead.assignedTo,
      ownerId: lead.ownerId 
    });
    
    const leadName = `${lead.firstName} ${lead.lastName}`;
    const leadEmail = lead.email || '';
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { name: true, email: true }
    });
    const creatorName = creator?.name || creator?.email || 'Unknown User';
    console.log('Creator:', creatorName);

    // 1. Notify assigned users
    if (parsedLead.assignedTo && Array.isArray(parsedLead.assignedTo) && parsedLead.assignedTo.length > 0) {
      for (const assignedUser of parsedLead.assignedTo) {
        try {
          // Extract user ID from the object
          const assignedUserId = typeof assignedUser === 'string' ? assignedUser : assignedUser.id;
          
          const trigger = SystemNotificationTriggers.leadAssigned(
            leadName,
            leadEmail,
            creatorName,
            lead.source || ''
          );
          // Add phone number to trigger data for SMS
          if (lead.phone) {
            trigger.data = { ...trigger.data, phone: lead.phone };
          }
          await NotificationService.sendToUser(assignedUserId, trigger);
          console.log(`Lead assignment notification sent to user ${assignedUserId}`);
        } catch (error) {
          console.error(`Error sending assignment notification:`, error);
        }
      }
    }

    // 2. Notify admins about new lead creation
    const adminTrigger = SystemNotificationTriggers.leadCreated(
      leadName,
      leadEmail,
      creatorName,
      parsedLead.assignedTo
    );
    // Add phone number to trigger data for SMS
    if (lead.phone) {
      adminTrigger.data = { ...adminTrigger.data, phone: lead.phone };
    }
    await NotificationService.sendToAdmins(adminTrigger);
    console.log('Lead creation notification sent to admins');

    // 3. Notify lead owner if different from creator
    if (lead.ownerId !== creatorId) {
      try {
        const trigger = SystemNotificationTriggers.leadOwnerNotification(
          leadName,
          leadEmail,
          creatorName,
          {
            company: lead.company,
            source: lead.source,
            status: lead.status
          }
        );
        // Add phone number to trigger data for SMS
        if (lead.phone) {
          trigger.data = { ...trigger.data, phone: lead.phone };
        }
        await NotificationService.sendToUser(lead.ownerId, trigger);
        console.log(`Lead owner notification sent to user ${lead.ownerId}`);
      } catch (error) {
        console.error(`Error sending owner notification to user ${lead.ownerId}:`, error);
      }
    }

    // 4. Send welcome email to lead if they provided email
    if (lead.email) {
      try {
        // Extract the first assigned user's ID
        const firstAssignedUserId = parsedLead.assignedTo && parsedLead.assignedTo.length > 0
          ? (typeof parsedLead.assignedTo[0] === 'string' ? parsedLead.assignedTo[0] : parsedLead.assignedTo[0].id)
          : null;
        
        const assignedUser = firstAssignedUserId 
          ? await prisma.user.findUnique({
              where: { id: firstAssignedUserId },
              select: { name: true }
            })
          : null;

        const companyName = 'AD Pools Group'; // This could be made configurable
        const trigger = SystemNotificationTriggers.leadWelcome(
          leadName,
          companyName,
          assignedUser?.name || undefined
        );

        // Send directly to lead's email
        if (lead.email) {
          await NotificationService.sendToEmail(lead.email, trigger);
        }
        console.log(`Welcome email sent to lead ${lead.email}`);
      } catch (error) {
        console.error(`Error sending welcome email to lead ${lead.email}:`, error);
      }
    }

  } catch (error) {
    console.error('Error in sendLeadNotifications:', error);
    throw error;
  }
}
