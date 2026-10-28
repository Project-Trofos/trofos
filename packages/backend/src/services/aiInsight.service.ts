import { createClient } from 'redis';
import { context, propagation, trace, Span, ROOT_CONTEXT } from '@opentelemetry/api';
import { getIo } from './socket.service';
import {
  TASK_QUEUE_KEY,
  TASK_NOTIFICATIONS_CHANNEL,
  TASK_COMPLETED_CHANNEL,
  Task,
  getLogger,
} from '@trofos-nus/common';

const logger = getLogger();
const tracer = trace.getTracer('trofos-backend');

export const redis = createClient({
  url: process.env.REDIS_URL,
});
redis.connect();

const subscriber = createClient({
  url: process.env.REDIS_URL,
});
subscriber.connect();

const AI_INSIGHT_WEBSOCKET = 'sprint-insight';

const publishTask = async (projectId: number, sprintId: number, user: string) => {
  const traceHeaders: Record<string, string> = {};
  propagation.inject(context.active(), traceHeaders);

  // Push the task into the list (atomic queue)
  await redis.lPush(
    TASK_QUEUE_KEY,
    JSON.stringify({
      projectId,
      sprintId,
      user,
      _traceContext: traceHeaders,
    }),
  );
  const taskId = `${projectId}_${sprintId}_${user}`;
  logger.info(`[AI Insight] Task (projId_sprId_usr) ${taskId} added to queue`);

  // Publish a notification about the new task
  await redis.publish(TASK_NOTIFICATIONS_CHANNEL, 'new_task');
  logger.info(`[AI Insight] Notification published for task ${taskId}`);
};

const initCompleteInsightSub = async () => {
  subscriber.subscribe(TASK_COMPLETED_CHANNEL, async (message) => {
    try {
      logger.info(`[AI Insight] Received message: ${message}`);

      const task: Task = JSON.parse(message);
      if (!task || !task.sprintId) {
        logger.error({ message }, '[AI Insight] Task not found');
        return;
      }

      const parentContext = propagation.extract(ROOT_CONTEXT, task._traceContext || {});

      await context.with(parentContext, async () => {
        await tracer.startActiveSpan('backend.ai_insight_task_completed', async (span: Span) => {
          try {
            span.setAttribute('project_id', task.projectId);
            span.setAttribute('sprint_id', task.sprintId);
            span.setAttribute('user_id', task.user);

            logger.info(`[AI Insight] Task completed: ${task.projectId} ${task.sprintId} ${task.user}`);

            emitToFrontendInsightChanged(task.sprintId);
          } catch (err) {
            span.recordException(err as Error);
            throw err;
          } finally {
            span.end();
          }
        });
      });
    } catch (error) {
      logger.error({ err: error, message }, '[AI Insight] Error processing task completion');
    }
  });
};

const emitToFrontendInsightChanged = (sprintId: number) => {
  const io = getIo();
  io.emit('updated', `${AI_INSIGHT_WEBSOCKET}/${sprintId.toString()}`, AI_INSIGHT_WEBSOCKET);
}

export {
  publishTask,
  initCompleteInsightSub,
  emitToFrontendInsightChanged,
};
