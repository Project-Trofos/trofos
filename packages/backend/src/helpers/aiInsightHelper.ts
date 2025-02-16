import { createClient } from 'redis';

const redis = createClient();
const TASK_QUEUE_KEY = 'task_aiInsight_queue';
const TASK_NOTIFICATIONS_CHANNEL = 'task_aiInsight_notifications';

const publishTask = async (projectId: number, sprintId: number, user: string) => {
  await redis.connect();

  // Push the task into the list (atomic queue)
  await redis.lPush(TASK_QUEUE_KEY, JSON.stringify({
    projectId,
    sprintId,
    user,
  }));
  const taskId = `${projectId}_${sprintId}_${user}`;
  console.log(`Task (projId_sprId_usr) ${taskId} added to queue`);

  // Publish a notification about the new task
  await redis.publish(TASK_NOTIFICATIONS_CHANNEL, 'new_task');
  console.log(`Notification published for task ${taskId}`);

  await redis.quit();
};

export {
  publishTask,
};
