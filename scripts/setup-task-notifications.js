const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTaskNotifications() {
  try {
    console.log('Setting up task notification settings...');

    const settings = [
      {
        key: 'TASK_NOTIFICATIONS_ENABLED',
        value: 'true',
        category: 'task_notifications',
        type: 'boolean',
        description: 'Enable/disable task due date notifications'
      },
      {
        key: 'TASK_NOTIFICATION_MINUTES_BEFORE_DUE',
        value: '10',
        category: 'task_notifications',
        type: 'number',
        description: 'Minutes before due date to send reminder notification'
      },
      {
        key: 'TASK_NOTIFICATION_SEND_DUE_SOON',
        value: 'true',
        category: 'task_notifications',
        type: 'boolean',
        description: 'Send notifications when tasks are due soon'
      },
      {
        key: 'TASK_NOTIFICATION_SEND_OVERDUE',
        value: 'true',
        category: 'task_notifications',
        type: 'boolean',
        description: 'Send notifications when tasks become overdue'
      },
      {
        key: 'TASK_NOTIFICATION_SEND_ESCALATION',
        value: 'true',
        category: 'task_notifications',
        type: 'boolean',
        description: 'Send escalation notifications for overdue tasks'
      },
      {
        key: 'TASK_NOTIFICATION_ESCALATION_INTERVAL',
        value: '1',
        category: 'task_notifications',
        type: 'number',
        description: 'Hours between escalation notifications for overdue tasks'
      }
    ];

    for (const setting of settings) {
      await prisma.systemSettings.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          category: setting.category,
          type: setting.type,
          description: setting.description,
          updatedAt: new Date()
        },
        create: {
          key: setting.key,
          value: setting.value,
          category: setting.category,
          type: setting.type,
          description: setting.description
        }
      });
      console.log(`✓ Set up ${setting.key}: ${setting.value}`);
    }

    console.log('\n✅ Task notification settings setup completed!');
    console.log('\nSettings configured:');
    console.log('- Task notifications: ENABLED');
    console.log('- Minutes before due: 10');
    console.log('- Due soon notifications: ENABLED');
    console.log('- Overdue notifications: ENABLED');
    console.log('- Escalation notifications: ENABLED');
    console.log('- Escalation interval: 1 hour');
    
  } catch (error) {
    console.error('Error setting up task notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTaskNotifications();
