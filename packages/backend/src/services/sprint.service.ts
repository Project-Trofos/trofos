import { Sprint, SprintStatus } from '@prisma/client';
import prisma from '../models/prismaClient';
import { SprintFields } from '../helpers/types/sprint.service.types';
import { assertProjectIdIsValid, BadRequestError } from '../helpers/error';

async function newSprint(sprintFields: SprintFields): Promise<Sprint> {
  const { projectId, name, dates, duration, goals } = sprintFields;

  const sprint = prisma.sprint.create({
    data: {
      name,
      duration,
      goals,
      project: {
        connect: { id: projectId },
      },
      ...(dates && {
        start_date: new Date(dates[0]),
        end_date: new Date(dates[1]),
      }),
    },
  });

  return sprint;
}

async function listSprints(projectId: number): Promise<Sprint[]> {
  const sprints = await prisma.sprint.findMany({
    where: {
      project_id: projectId,
    },
    include: {
      backlogs: {
        include: {
          assignee: {
            include: {
              user: {
                select: {
                  user_email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return sprints;
}

async function listActiveSprint(projectId: number): Promise<Sprint | null> {
  const sprint = await prisma.sprint.findFirst({
    where: {
      project_id: projectId,
      status: SprintStatus.current,
    },
    include: {
      backlogs: {
        include: {
          assignee: {
            include: {
              user: {
                select: {
                  user_email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return sprint;
}

async function updateSprint(
  sprintToUpdate: Partial<Omit<SprintFields, 'projectId' | 'status'>> & { sprintId: number },
): Promise<Sprint> {
  const { sprintId, name, dates, duration, goals } = sprintToUpdate;
  const updatedSprint = await prisma.sprint.update({
    where: {
      id: sprintId,
    },
    data: {
      name,
      duration,
      goals,
      ...(dates !== undefined
        ? {
            start_date: dates ? new Date(dates[0]) : null,
            end_date: dates ? new Date(dates[1]) : null,
          }
        : {}),
    },
  });

  return updatedSprint;
}

async function updateSprintStatus(
  sprintToUpdate: Pick<SprintFields, 'projectId' | 'status'> & { sprintId: number },
): Promise<Sprint> {
  const { sprintId, projectId, status } = sprintToUpdate;

  if (status === 'current') {
    assertProjectIdIsValid(projectId);

    return prisma.$transaction<Sprint>(async (tx) => {
      // ensure there are no other active sprint for the project
      const isCurrentPresent = await tx.sprint.findFirst({
        where: {
          project_id: projectId,
          status: 'current',
        },
      });

      if (isCurrentPresent) {
        throw new BadRequestError('An active sprint already exists');
      }

      const updatedCurrentSprint = await tx.sprint.update({
        where: {
          id: sprintId,
        },
        data: {
          status,
        },
      });

      // ensures that completed sprints cannot be reopened after another
      // sprint has started
      await tx.sprint.updateMany({
        where: {
          project_id: projectId,
          status: 'completed',
        },
        data: {
          status: 'closed',
        },
      });

      return updatedCurrentSprint;
    });
  }

  const updatedSprint = await prisma.sprint.update({
    where: {
      id: sprintId,
    },
    data: {
      status,
    },
  });

  return updatedSprint;
}

async function deleteSprint(sprintId: number): Promise<Sprint> {
  const sprint = await prisma.sprint.delete({
    where: {
      id: sprintId,
    },
  });

  return sprint;
}

export default {
  newSprint,
  listSprints,
  listActiveSprint,
  updateSprint,
  updateSprintStatus,
  deleteSprint,
};
