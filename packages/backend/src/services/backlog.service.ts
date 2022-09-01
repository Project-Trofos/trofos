import { PrismaClient, BacklogType, BacklogPriority } from '@prisma/client';

type BacklogFields = {
  summary: string;
  type: BacklogType;
  sprintId: number | undefined;
  priority: BacklogPriority | undefined;
  reporterId: number;
  assigneeId: number | undefined;
  points: number | undefined;
  description: string | undefined;
  projectId: number;
};

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
