import { Backlog, BacklogStatusType, HistoryType } from '@prisma/client';
import prisma from '../models/prismaClient';
import { BacklogFields } from '../helpers/types/backlog.service.types';

async function newBacklog(backlogFields: BacklogFields): Promise<Backlog> {
  const { summary, type, sprintId, priority, reporterId, assigneeId, points, description, projectId } = backlogFields;

  const backlogCounter = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    select: { backlog_counter: true },
  });

  const defaultBacklogStatus = await prisma.backlogStatus.findFirst({
    where: {
      project_id: projectId,
      type: BacklogStatusType.todo,
      order: 1,
    },
    select: {
      name: true,
    },
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
      backlogStatus: {
        connect: {
          project_id_name: {
            project_id: projectId,
            name: defaultBacklogStatus?.name || 'To do',
          },
        },
      },
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

  // Create backlog history for this create operation
  const createBacklogHistory = prisma.backlogHistory.create({
    data: {
      history_type: HistoryType.create,
      reporter_id: reporterId,
      backlog_id: backlogCounter.backlog_counter + 1,
      summary,
      type,
      ...(sprintId && {
        sprint: {
          connect: { id: sprintId },
        },
      }),
      priority: priority || null,
      assignee_id: assigneeId,
      points: points || null,
      description: description || null,
      backlogStatus: {
        connect: {
          project_id_name: {
            project_id: projectId,
            name: defaultBacklogStatus?.name || 'To do',
          },
        },
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [backlog, counter, backlogHistory] = await prisma.$transaction([
    createBacklog,
    incrementBacklogCounter,
    createBacklogHistory,
  ]);

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

  // Create backlog history for this update operation
  // TODO (Luoyi): Could this lead to race condition?
  await prisma.backlogHistory.create({
    data: {
      history_type: HistoryType.update,
      reporter_id: updatedBacklog.reporter_id,
      backlog_id: updatedBacklog.backlog_id,
      summary: updatedBacklog.summary,
      type: updatedBacklog.type,
      ...(updatedBacklog.sprint_id && {
        sprint: {
          connect: { id: updatedBacklog.sprint_id },
        },
      }),
      priority: updatedBacklog.priority,
      assignee_id: updatedBacklog.assignee_id,
      points: updatedBacklog.points,
      description: updatedBacklog.description,
      backlogStatus: {
        connect: {
          project_id_name: {
            project_id: projectId,
            name: updatedBacklog.status,
          },
        },
      },
    },
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

  // Create backlog history for this delete operation
  // TODO (Luoyi): Could this lead to race condition?
  await prisma.backlogHistory.create({
    data: {
      history_type: HistoryType.delete,
      reporter_id: backlog.reporter_id,
      backlog_id: backlog.backlog_id,
      summary: backlog.summary,
      type: backlog.type,
      ...(backlog.sprint_id && {
        sprint: {
          connect: { id: backlog.sprint_id },
        },
      }),
      priority: backlog.priority,
      assignee_id: backlog.assignee_id,
      points: backlog.points,
      description: backlog.description,
      backlogStatus: {
        connect: {
          project_id_name: {
            project_id: projectId,
            name: backlog.status,
          },
        },
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
