import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationService, SystemNotificationTriggers } from "@/lib/notification-service";

// POST /api/notifications/scheduled - Run scheduled notification checks
export async function POST(request: NextRequest) {
  try {
    console.log('Running scheduled notification checks...');
    
    const results = {
      lowStockAlerts: 0,
      outOfStockAlerts: 0,
      systemAlerts: 0,
      errors: []
    };

    // Check for low stock products
    try {
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stockItems: {
            some: {
              AND: [
                { available: { lte: 10 } },
                { available: { gt: 0 } }
              ]
            }
          }
        },
        include: {
          stockItems: {
            where: {
              available: { lte: 10 }
            },
            include: {
              warehouse: true
            }
          }
        }
      });

      for (const product of lowStockProducts) {
        const stockItem = product.stockItems[0];
        if (stockItem) {
          const trigger = SystemNotificationTriggers.stockLow(
            product.name,
            stockItem.available,
            stockItem.reorderPoint || 10
          );
          
          await NotificationService.sendToInventoryManagers(trigger);
          results.lowStockAlerts++;
        }
      }
    } catch (error) {
      console.error('Error checking low stock:', error);
      results.errors.push('Low stock check failed');
    }

    // Check for out of stock products
    try {
      const outOfStockProducts = await prisma.product.findMany({
        where: {
          stockItems: {
            some: {
              available: 0
            }
          }
        },
        include: {
          stockItems: {
            where: {
              available: 0
            },
            include: {
              warehouse: true
            }
          }
        }
      });

      for (const product of outOfStockProducts) {
        const trigger = SystemNotificationTriggers.stockOut(product.name);
        await NotificationService.sendToInventoryManagers(trigger);
        results.outOfStockAlerts++;
      }
    } catch (error) {
      console.error('Error checking out of stock:', error);
      results.errors.push('Out of stock check failed');
    }

    // Check for system health and send alerts if needed
    try {
      // Example: Check for inactive users (users who haven't logged in for 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const inactiveUsers = await prisma.user.count({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { lastLoginAt: { lt: thirtyDaysAgo } },
                { lastLoginAt: null }
              ]
            }
          ]
        }
      });

      if (inactiveUsers > 0) {
        const trigger = SystemNotificationTriggers.systemAlert(
          'Inactive Users',
          `${inactiveUsers} users haven't logged in for 30+ days`
        );
        await NotificationService.sendToAdmins(trigger);
        results.systemAlerts++;
      }
    } catch (error) {
      console.error('Error checking system health:', error);
      results.errors.push('System health check failed');
    }

    // Send daily summary if it's the first run of the day
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Check if we've already sent a summary today
      const existingSummary = await prisma.notification.findFirst({
        where: {
          type: 'SYSTEM_ALERT',
          title: 'Daily System Summary',
          createdAt: {
            gte: today
          }
        }
      });

      if (!existingSummary) {
        const totalProducts = await prisma.product.count();
        const totalUsers = await prisma.user.count({ where: { isActive: true } });
        const totalStockValue = await prisma.stockItem.aggregate({
          _sum: { totalValue: true }
        });

        const trigger = SystemNotificationTriggers.systemAlert(
          'Daily System Summary',
          `System Status: ${totalProducts} products, ${totalUsers} active users, $${totalStockValue._sum.totalValue || 0} total inventory value`
        );
        await NotificationService.sendToAdmins(trigger);
        results.systemAlerts++;
      }
    } catch (error) {
      console.error('Error sending daily summary:', error);
      results.errors.push('Daily summary failed');
    }

    console.log('Scheduled notification checks completed:', results);

    return NextResponse.json({
      message: "Scheduled notification checks completed",
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error running scheduled notifications:', error);
    return NextResponse.json(
      { error: "Failed to run scheduled notifications" },
      { status: 500 }
    );
  }
}

// GET /api/notifications/scheduled - Get scheduled notification status
export async function GET(request: NextRequest) {
  try {
    // Get recent scheduled notifications
    const recentNotifications = await prisma.notification.findMany({
      where: {
        type: {
          in: ['STOCK_LOW', 'SYSTEM_ALERT']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Get notification statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await prisma.notification.groupBy({
      by: ['type', 'status'],
      where: {
        createdAt: { gte: today }
      },
      _count: true
    });

    return NextResponse.json({
      message: "Scheduled notification system status",
      recentNotifications,
      todayStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting scheduled notification status:', error);
    return NextResponse.json(
      { error: "Failed to get scheduled notification status" },
      { status: 500 }
    );
  }
}
