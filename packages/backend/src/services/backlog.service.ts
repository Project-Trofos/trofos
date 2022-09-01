import { PrismaClient } from '@prisma/client';
import { BacklogFields } from './types/backlog.service.types';

async function createBacklog(backlogFields : BacklogFields, prisma : PrismaClient) : Promise<boolean> {
  const {
    summary,
    type,
    sprintId,
    priority,
    reporterId,
    assigneeId,
    points,
    description,
    projectId,
  } = backlogFields;
    
  const backlog = await prisma.backlog.create({
    data: {
      summary,
      type,
      ...sprintId && {
        sprint: {
          connect: { id: sprintId },
        },
      },
      priority: priority || null,
      reporterId,
      assigneeId: assigneeId || null,
      points: points || null,
      description: description || null,
      projectId,
    },
  });

  if (!backlog) {
    return false;
  }

  return true;
}

export default {
  createBacklog,
};
