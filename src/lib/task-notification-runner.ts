import { TaskNotificationScheduler } from './task-notification-scheduler';

class TaskNotificationRunner {
  private static instance: TaskNotificationRunner;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  static getInstance(): TaskNotificationRunner {
    if (!TaskNotificationRunner.instance) {
      TaskNotificationRunner.instance = new TaskNotificationRunner();
    }
    return TaskNotificationRunner.instance;
  }

  start() {
    if (this.isRunning) {
      console.log('Task notification runner is already running');
      return;
    }

    console.log('Starting automatic task notification runner...');
    this.isRunning = true;

    // Run immediately
    this.processNotifications();

    // Then run every minute
    this.intervalId = setInterval(() => {
      this.processNotifications();
    }, 60 * 1000); // 60 seconds

    console.log('✅ Task notification runner started - checking every minute');
  }

  stop() {
    if (!this.isRunning) {
      console.log('Task notification runner is not running');
      return;
    }

    console.log('Stopping task notification runner...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    console.log('✅ Task notification runner stopped');
  }

  private async processNotifications() {
    try {
      console.log(`[${new Date().toISOString()}] 🔄 AUTOMATIC: Processing task notifications...`);
      await TaskNotificationScheduler.processTaskNotifications();
      console.log(`[${new Date().toISOString()}] ✅ AUTOMATIC: Task notification processing completed`);
    } catch (error) {
      console.error('❌ AUTOMATIC: Error in automatic task notification processing:', error);
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

export const taskNotificationRunner = TaskNotificationRunner.getInstance();
