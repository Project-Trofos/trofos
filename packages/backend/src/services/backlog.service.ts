import { Backlog, BacklogStatusType, HistoryType } from '@prisma/client';
import prisma from '../models/prismaClient';
import { BacklogFields } from '../helpers/types/backlog.service.types';

async function newBacklog(backlogFields: BacklogFields): Promise<Backlog> {
  const { summary, type, sprintId, priority, reporterId, assigneeId, points, description, projectId } = backlogFields;

  return prisma.$transaction<Backlog>(async (tx : any) => {
    const backlogCounter = await tx.project.findUniqueOrThrow({
      where: { id: projectId },
      select: { backlog_counter: true },
    });

    const defaultBacklogStatus = await tx.backlogStatus.findFirst({
      where: {
        project_id: projectId,
        type: BacklogStatusType.todo,
        order: 1,
      },
      select: {
        name: true,
      },
    });

    const createdBacklog = await tx.backlog.create({
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

    await tx.project.update({
      where: { id: projectId },
      data: {
        backlog_counter: {
          increment: 1,
        },
      },
    });

    // Create backlog history for this create operation
    await tx.backlogHistory.create({
      data: {
        history_type: HistoryType.create,
        reporter_id: reporterId,
        backlog_id: backlogCounter.backlog_counter + 1,
        type,
        ...(sprintId && {
          sprint: {
            connect: { id: sprintId },
          },
        }),
        priority: priority || null,
        assignee_id: assigneeId,
        points: points || null,
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

    return createdBacklog;
  });
}

async function listBacklogs(projectId: number): Promise<Backlog[]> {
  const backlogs = await prisma.backlog.findMany({
    where: {
      project_id: projectId,
    },
  });

  return backlogs;
}

async function listUnassignedBacklogs(projectId: number): Promise<Backlog[]> {
  const backlogs = await prisma.backlog.findMany({
    where: {
      project_id: projectId,
      sprint_id: null,
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

  return prisma.$transaction<Backlog>(async (tx : any) => {
    const updatedBacklog = await tx.backlog.update({
      where: {
        project_id_backlog_id: {
          project_id: projectId,
          backlog_id: backlogId,
        },
      },
      data: fieldToUpdate,
    });

    // Create backlog history for this update operation
    await tx.backlogHistory.create({
      data: {
        history_type: HistoryType.update,
        reporter_id: updatedBacklog.reporter_id,
        backlog_id: updatedBacklog.backlog_id,
        type: updatedBacklog.type,
        ...(updatedBacklog.sprint_id && {
          sprint: {
            connect: { id: updatedBacklog.sprint_id },
          },
        }),
        priority: updatedBacklog.priority,
        assignee_id: updatedBacklog.assignee_id,
        points: updatedBacklog.points,
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
  });
}

async function deleteBacklog(projectId: number, backlogId: number): Promise<Backlog> {
  return prisma.$transaction<Backlog>(async (tx : any) => {
    const backlog = await tx.backlog.delete({
      where: {
        project_id_backlog_id: {
          project_id: projectId,
          backlog_id: backlogId,
        },
      },
    });

    // Create backlog history for this delete operation
    await tx.backlogHistory.create({
      data: {
        history_type: HistoryType.delete,
        reporter_id: backlog.reporter_id,
        backlog_id: backlog.backlog_id,
        type: backlog.type,
        ...(backlog.sprint_id && {
          sprint: {
            connect: { id: backlog.sprint_id },
          },
        }),
        priority: backlog.priority,
        assignee_id: backlog.assignee_id,
        points: backlog.points,
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
  });
}

export default {
  newBacklog,
  listBacklogs,
  listUnassignedBacklogs,
  getBacklog,
  updateBacklog,
  deleteBacklog,
};
