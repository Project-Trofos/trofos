import './tracing';
import { createClient } from 'redis';
import { context, propagation, trace, Span, ROOT_CONTEXT } from '@opentelemetry/api';
import {
  TASK_QUEUE_KEY,
  TASK_NOTIFICATIONS_CHANNEL,
  SPRINT_PROCESSING_SET,
  TASK_COMPLETED_CHANNEL,
  Task,
  getLogger,
} from '@trofos-nus/common';
import { handleAllInsights } from './service';

const logger = getLogger();
const tracer = trace.getTracer('trofos-ai-insight-worker');

// Create a Redis client for publishing
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect();

// Create a Redis client for subscribing
const subscriber = createClient({
  url: process.env.REDIS_URL,
});
subscriber.connect();

logger.info('AI Insight Worker is running');

// Subscribing to a channel
subscriber.subscribe(TASK_NOTIFICATIONS_CHANNEL, async (message) => {
  let task: Task | null = null;
  try {
    logger.info(`Received message: ${message}`);
    task = JSON.parse(await redisClient.rPop(TASK_QUEUE_KEY) ?? 'null');

    if (task !== null) {
      const currentTask = task;
      const parentContext = propagation.extract(ROOT_CONTEXT, currentTask._traceContext || {});

      await context.with(parentContext, async () => {
        await tracer.startActiveSpan('ai_insight_worker.process_task', async (span: Span) => {
          try {
            span.setAttribute('project_id', currentTask.projectId);
            span.setAttribute('sprint_id', currentTask.sprintId);
            span.setAttribute('user_id', currentTask.user);

            logger.info(`Processing task: ${currentTask.projectId} ${currentTask.sprintId} ${currentTask.user}`);

            const wasAdded = await redisClient.sAdd(
              SPRINT_PROCESSING_SET,
              `${currentTask.projectId}:${currentTask.sprintId}`,
            );
            if (wasAdded === 0) {
              logger.info(`Task ${currentTask.projectId} ${currentTask.sprintId} is already being processed`);
              return;
            }

            // Process the task
            await handleAllInsights(currentTask.projectId, currentTask.sprintId, currentTask.user);
            logger.info(`Task ${currentTask.projectId} ${currentTask.sprintId} processed`);

            // Publish a message to the completed channel
            await redisClient.publish(TASK_COMPLETED_CHANNEL, JSON.stringify(currentTask));
          } catch (error) {
            span.recordException(error as Error);
            throw error;
          } finally {
            span.end();
          }
        });
      });
    } else {
      logger.info('No tasks to process');
    }
  } catch (error) {
    logger.error(error, 'Error processing task');
  } finally {
    // Ensure sprint is removed from the processing set
    if (task) {
      const taskKey = `${task.projectId}:${task.sprintId}`;
      const removed = await redisClient.sRem(SPRINT_PROCESSING_SET, taskKey);
      if (removed === 0) {
        logger.warn(`Failed to remove task ${taskKey} from processing set (might have been removed already).`);
      } else {
        logger.info(`Task ${taskKey} removed from processing set.`);
      }
    }
  }
});
