import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { checkExpenseLimitAndNotify } from './notificationService';

export const EXPENSE_CHECK_TASK_NAME = 'checkExpenseLimitDaily';

const BackgroundTaskResult = {
    NoData: 1,
    NewData: 2,
    Failed: 3,
};

TaskManager.defineTask(EXPENSE_CHECK_TASK_NAME, async () => {
    try {
        console.log('Background task running: Checking expense limit...');
        
        await checkExpenseLimitAndNotify(); 
        return BackgroundTaskResult.NewData; 
    } catch (error) {
        console.error('Background task failed:', error);
        return BackgroundTaskResult.Failed; 
    }
});

export async function registerBackgroundExpenseCheck() {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(EXPENSE_CHECK_TASK_NAME);
    if (isRegistered) {
        console.log('Background task already registered.');
        return; 
    }

    try {
        await BackgroundTask.registerTaskAsync(EXPENSE_CHECK_TASK_NAME, {
            minimumInterval: 60 * 60 * 24,
        });
        console.log('Background task registered successfully.');
    } catch (error) {
        console.error('Failed to register background task:', error);
    }
}