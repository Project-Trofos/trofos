import { createClient } from 'redis';
import { Task } from './types';
import { handleAllInsights } from './service';

const TASK_QUEUE_KEY = 'task_aiInsight_queue';
const TASK_NOTIFICATIONS_CHANNEL = 'task_aiInsight_notifications';
const SPRINT_PROCESSING_SET = 'sprint_processing_set';
const TASK_COMPLETED_CHANNEL = 'task_aiInsight_completed';

// Create a Redis client for publishing
const redisClient = createClient();
redisClient.connect();

// Create a Redis client for subscribing
const subscriber = createClient();
subscriber.connect();

console.log('AI Insight Worker is running');
// Subscribing to a channel
subscriber.subscribe(TASK_NOTIFICATIONS_CHANNEL, async (message) => {
  let task: Task | null = null;
  try {
    console.log(`Received message: ${message}`);
    task = JSON.parse(await redisClient.rPop(TASK_QUEUE_KEY) ?? 'null');
    if (task !== null) {
      console.log(`Processing task: ${task.projectId} ${task.sprintId} ${task.user}`);
      const wasAdded = await redisClient.sAdd(SPRINT_PROCESSING_SET, `${task.projectId}:${task.sprintId}`);
      if (wasAdded === 0) {
        console.log(`Task ${task.projectId} ${task.sprintId} is already being processed`);
        return;
      }

      // Process the task
      await handleAllInsights(task.projectId, task.sprintId, task.user);
      console.log(`Task ${task.projectId} ${task.sprintId} processed`)
      // Publish a message to the completed channel
      await redisClient.publish(TASK_COMPLETED_CHANNEL, JSON.stringify(task));
    } else {
      console.log('No tasks to process');
    }
  } catch (error) {
    console.error(error);
  } finally {
    // Ensure sprint is removed from the processing set
    if (task) {
      const taskKey = `${task.projectId}:${task.sprintId}`;
      const removed = await redisClient.sRem(SPRINT_PROCESSING_SET, taskKey);
      if (removed === 0) {
        console.warn(`Failed to remove task ${taskKey} from processing set (might have been removed already).`);
      } else {
        console.log(`Task ${taskKey} removed from processing set.`);
      }
    }
  }
});
