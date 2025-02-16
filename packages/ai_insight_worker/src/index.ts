import { createClient } from 'redis';
import { Task } from './types';

const TASK_QUEUE_KEY = 'task_aiInsight_queue';
const TASK_NOTIFICATIONS_CHANNEL = 'task_aiInsight_notifications';

// Create a Redis client for publishing
const queueClient = createClient();
queueClient.connect();

// Create a Redis client for subscribing
const subscriber = createClient();
subscriber.connect();

// Subscribing to a channel
subscriber.subscribe(TASK_NOTIFICATIONS_CHANNEL, async (message) => {
  console.log(`Received message: ${message}`);
  const task: Task = JSON.parse(await queueClient.rPop(TASK_QUEUE_KEY) ?? 'null');
  if (task !== null) {
    console.log(`Processing task: ${task.projectId} ${task.sprintId} ${task.user}`);
  } else {
    console.log('No tasks to process');
  }
});
