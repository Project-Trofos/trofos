import { createClient } from 'redis';
import { getIo } from '../services/socket.service';

const redis = createClient();
const TASK_QUEUE_KEY = 'task_aiInsight_queue';
const TASK_NOTIFICATIONS_CHANNEL = 'task_aiInsight_notifications';
const TASK_COMPLETED_CHANNEL = 'task_aiInsight_completed';
const AI_INSIGHT_WEBSOCKET = 'sprint-insight';

const publishTask = async (projectId: number, sprintId: number, user: string) => {
  await redis.connect();

  // Push the task into the list (atomic queue)
  await redis.lPush(TASK_QUEUE_KEY, JSON.stringify({
    projectId,
    sprintId,
    user,
  }));
  const taskId = `${projectId}_${sprintId}_${user}`;
  console.log(`[AI Insight] Task (projId_sprId_usr) ${taskId} added to queue`);

  // Publish a notification about the new task
  await redis.publish(TASK_NOTIFICATIONS_CHANNEL, 'new_task');
  console.log(`[AI Insight] Notification published for task ${taskId}`);

  await redis.quit();
};

const initCompleteInsightSub = async () => {
  const subscriber = createClient();
  await subscriber.connect();

  subscriber.subscribe(TASK_COMPLETED_CHANNEL, async (message) => {
    try {
      console.log(`[AI Insight] Received message: ${message}`);
      const task: {
        projectId: number,
        sprintId: number,
        user: string,
      } = JSON.parse(message);
      console.log(`[AI Insight] Task completed: ${task.projectId} ${task.sprintId} ${task.user}`);
      if (!task || !task.sprintId) {
        console.error('[AI Insight] Task not found');
        return;
      }
      const io = getIo();
      io.emit('updated', `${AI_INSIGHT_WEBSOCKET}/${task.sprintId.toString()}`, AI_INSIGHT_WEBSOCKET);
    } catch (error) {
      console.error(error);
    }
  });
};

export {
  publishTask,
  initCompleteInsightSub,
};
