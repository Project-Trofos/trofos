import { Backlog } from '@prisma/client';
import prisma from '../models/prismaClient';
import { BacklogFields } from '../helpers/types/backlog.service.types';

async function newBacklog(backlogFields: BacklogFields): Promise<Backlog> {
  const { summary, type, sprintId, priority, reporterId, assigneeId, points, description, projectId } = backlogFields;

  const backlogCounter = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { backlog_counter: true },
  });

  // optimistic concurrency control (if backlog_id already exists then throw an error)
  const createBacklog = prisma.backlog.create({
    data: {
      backlog_id: backlogCounter.backlog_counter + 1,
      summary,
      type,
      ...(sprintId && {
        sprint: {
          connect: { id: sprintId },
        },
      }),
      priority: priority || null,
      reporter: {
        connect: {
          project_id_user_id: {
            user_id: reporterId,
            project_id: projectId,
          },
        },
      },
      ...(assigneeId && {
        assignee: {
          connect: {
            project_id_user_id: {
              user_id: assigneeId,
              project_id: projectId,
            },
          },
        },
      }),
      points: points || null,
      description: description || null,
    },
  });

  const incrementBacklogCounter = prisma.project.update({
    where: { id: projectId },
    data: {
      backlog_counter: {
        increment: 1,
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [backlog, counter] = await prisma.$transaction([createBacklog, incrementBacklogCounter]);

  return backlog;
}

async function listBacklogs(projectId: number, shouldListUnassignedBacklogs: boolean): Promise<Backlog[]> {
  const backlogs = await prisma.backlog.findMany({
    where: {
      project_id: projectId,
      ...(shouldListUnassignedBacklogs ? { sprint_id: null } : {}),
    },
  });

  return backlogs;
}

async function getBacklog(projectId: number, backlogId: number): Promise<Backlog | null> {
  const backlog = await prisma.backlog.findUnique({
    where: {
      project_id_backlog_id: {
        project_id: projectId,
        backlog_id: backlogId,
      },
    },
  });

  return backlog;
}

async function updateBacklog(backlogToUpdate: {
  projectId: number;
  backlogId: number;
  fieldToUpdate: Partial<BacklogFields>;
}): Promise<Backlog> {
  const { projectId, backlogId, fieldToUpdate } = backlogToUpdate;
  const updatedBacklog = await prisma.backlog.update({
    where: {
      project_id_backlog_id: {
        project_id: projectId,
        backlog_id: backlogId,
      },
    },
    data: fieldToUpdate,
  });

  return updatedBacklog;
}

async function deleteBacklog(projectId: number, backlogId: number): Promise<Backlog> {
  const backlog = await prisma.backlog.delete({
    where: {
      project_id_backlog_id: {
        project_id: projectId,
        backlog_id: backlogId,
      },
    },
  });

  return backlog;
}

export default {
  newBacklog,
  listBacklogs,
  getBacklog,
  updateBacklog,
  deleteBacklog,
};
