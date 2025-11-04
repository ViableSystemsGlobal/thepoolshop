import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/cron/business-report - Cron job endpoint for automated business reports
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a legitimate cron service
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('📊 Business Report Cron: Checking for scheduled reports...');
    
    // Get all enabled business report settings
    const reportSettings = await prisma.systemSettings.findMany({
      where: {
        key: {
          in: [
            'ai_business_report_enabled',
            'ai_business_report_frequency',
            'ai_business_report_recipients',
            'ai_business_report_time',
            'ai_business_report_day',
            'ai_business_report_timezone'
          ]
        }
      }
    });

    const settingsMap = reportSettings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    // Check if business reports are enabled
    if (settingsMap.ai_business_report_enabled !== 'true') {
      console.log('📊 Business Report Cron: Reports are disabled');
      return NextResponse.json({ 
        message: "Business reports are disabled",
        timestamp: new Date().toISOString()
      });
    }

    // Check if recipients are configured
    if (!settingsMap.ai_business_report_recipients || !settingsMap.ai_business_report_recipients.trim()) {
      console.log('📊 Business Report Cron: No recipients configured');
      return NextResponse.json({ 
        message: "No recipients configured for business reports",
        timestamp: new Date().toISOString()
      });
    }

    const frequency = settingsMap.ai_business_report_frequency || 'daily';
    const timezone = settingsMap.ai_business_report_timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const sendTime = settingsMap.ai_business_report_time || '08:00';
    const sendDay = settingsMap.ai_business_report_day || 'monday';

    // Get current time in the specified timezone
    const now = new Date();
    const currentTimeInTZ = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const currentHour = currentTimeInTZ.getHours();
    const currentMinute = currentTimeInTZ.getMinutes();
    const currentDay = currentTimeInTZ.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Parse send time
    const [sendHour, sendMinute] = sendTime.split(':').map(Number);
    
    // Map day names to day numbers
    const dayMap: { [key: string]: number } = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };
    const targetDay = dayMap[sendDay.toLowerCase()] ?? 1;

    // Check if it's time to send
    let shouldSend = false;

    if (frequency === 'daily') {
      // Daily: Check if current time matches send time (within 5 minute window)
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (sendHour * 60 + sendMinute));
      shouldSend = timeDiff <= 5; // Allow 5 minute window for cron execution variance
    } else if (frequency === 'weekly') {
      // Weekly: Check if it's the right day and time
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (sendHour * 60 + sendMinute));
      shouldSend = currentDay === targetDay && timeDiff <= 5;
    } else if (frequency === 'monthly') {
      // Monthly: Send on the first day of the month at the specified time
      const isFirstDayOfMonth = currentTimeInTZ.getDate() === 1;
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (sendHour * 60 + sendMinute));
      shouldSend = isFirstDayOfMonth && timeDiff <= 5;
    }

    if (!shouldSend) {
      console.log(`📊 Business Report Cron: Not time to send yet. Current: ${currentHour}:${currentMinute}, Target: ${sendHour}:${sendMinute}, Day: ${currentDay}, Target Day: ${targetDay}`);
      return NextResponse.json({ 
        message: "Not time to send business report yet",
        timestamp: new Date().toISOString(),
        currentTime: `${currentHour}:${currentMinute}`,
        targetTime: `${sendHour}:${sendMinute}`,
        frequency
      });
    }

    // Check if we've already sent a report today (to prevent duplicates)
    const today = new Date(currentTimeInTZ);
    today.setHours(0, 0, 0, 0);
    
    // Get all users who have business reports enabled
    // For now, we'll send to the first admin/super admin user
    // In a production system, you might want to track per-user settings
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        },
        isActive: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (!adminUser) {
      console.log('📊 Business Report Cron: No admin user found');
      return NextResponse.json({ 
        message: "No admin user found to generate report",
        timestamp: new Date().toISOString()
      });
    }

    // Trigger the business report by calling the generator directly
    console.log(`📊 Business Report Cron: Triggering ${frequency} business report for user ${adminUser.id}...`);
    
    // Import and call the business report generator
    const { generateBusinessReport } = await import('@/lib/business-report-generator');
    const result = await generateBusinessReport(adminUser.id);

    if (!result.success) {
      console.error('📊 Business Report Cron: Error generating report:', result.error);
      return NextResponse.json({
        message: "Failed to generate business report",
        error: result.error || 'Unknown error',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    console.log(`📊 Business Report Cron: ${frequency} business report sent successfully`);
    
    return NextResponse.json({ 
      message: `${frequency} business report sent successfully`,
      timestamp: new Date().toISOString(),
      frequency,
      result
    });

  } catch (error) {
    console.error('❌ Business Report Cron Error:', error);
    return NextResponse.json(
      { 
        error: "Failed to process business report cron job",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/cron/business-report - Health check endpoint
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      message: "Business Report Cron endpoint is active",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Business Report Cron health check error:', error);
    return NextResponse.json(
      { error: "Health check failed" },
      { status: 500 }
    );
  }
}

