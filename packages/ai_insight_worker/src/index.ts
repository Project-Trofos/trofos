import { createClient } from 'redis';
import { Task } from './types';
import { handleAllInsights } from './service';

const TASK_QUEUE_KEY = 'task_aiInsight_queue';
const TASK_NOTIFICATIONS_CHANNEL = 'task_aiInsight_notifications';
const SPRINT_PROCESSING_SET = 'sprint_processing_set';

// Create a Redis client for publishing
const redisClient = createClient();
redisClient.connect();

// Create a Redis client for subscribing
const subscriber = createClient();
subscriber.connect();

console.log('AI Insight Worker is running');
// Subscribing to a channel
subscriber.subscribe(TASK_NOTIFICATIONS_CHANNEL, async (message) => {
  console.log(`Received message: ${message}`);
  const task: Task = JSON.parse(await redisClient.rPop(TASK_QUEUE_KEY) ?? 'null');
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
    // Remove the sprint from the processing set
    await redisClient.sRem(SPRINT_PROCESSING_SET, `${task.projectId}:${task.sprintId}`);

    // todo - inform BE this is done
  } else {
    console.log('No tasks to process');
  }
});
