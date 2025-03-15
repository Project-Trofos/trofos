export const TASK_QUEUE_KEY = 'task_aiInsight_queue';
export const TASK_NOTIFICATIONS_CHANNEL = 'task_aiInsight_notifications';
export const SPRINT_PROCESSING_SET = 'sprint_processing_set';
export const TASK_COMPLETED_CHANNEL = 'task_aiInsight_completed';
type Task = {
  projectId: number;
  sprintId: number;
  user: string;
};
export type {
  Task
};