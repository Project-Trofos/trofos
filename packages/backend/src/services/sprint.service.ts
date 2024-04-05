import {
  Sprint,
  SprintStatus,
  Prisma,
  RetrospectiveType,
  Retrospective,
  RetrospectiveVote,
  RetrospectiveVoteType,
} from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import prisma from '../models/prismaClient';
import { SprintFields } from '../helpers/types/sprint.service.types';
import { assertProjectIdIsValid, BadRequestError } from '../helpers/error';
import { AppAbility } from '../policies/policyTypes';
import { exclude } from '../helpers/common';

function removeNotesFromSprints(sprints: Sprint[]): Omit<Sprint, 'notes'>[] {
  return sprints.map((sprint) => exclude(sprint, ['notes']));
}

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

async function listSprints(policyConstraint: AppAbility): Promise<Omit<Sprint, 'notes'>[]> {
  const sprints = await prisma.sprint.findMany({
    where: {
      project: {
        AND: [accessibleBy(policyConstraint).Project],
      },
    },
    include: {
      backlogs: {
        include: {
          assignee: {
            include: {
              user: {
                select: {
                  user_display_name: true,
                  user_email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const sprintsWithoutNotes = removeNotesFromSprints(sprints);

  return sprintsWithoutNotes;
}

async function listSprintsByProjectId(projectId: number): Promise<Omit<Sprint, 'notes'>[]> {
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
                  user_display_name: true,
                  user_email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const sprintsWithoutNotes = removeNotesFromSprints(sprints);

  return sprintsWithoutNotes;
}

async function getSprintNotes(sprintId: number): Promise<Pick<Sprint, 'notes'>> {
  const notes = await prisma.sprint.findFirstOrThrow({
    where: {
      id: sprintId,
    },
    select: {
      notes: true,
    },
  });

  return notes;
}

async function listActiveSprint(projectId: number): Promise<Omit<Sprint, 'notes'> | null> {
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
                  user_display_name: true,
                  user_email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!sprint) {
    return null;
  }

  const sprintsWithoutNotes = removeNotesFromSprints([sprint]);

  return sprintsWithoutNotes[0];
}

async function updateSprint(
  sprintToUpdate: Partial<Omit<SprintFields, 'projectId' | 'status'>> & { sprintId: number },
): Promise<Sprint> {
  const { sprintId, name, dates, duration, goals, notes } = sprintToUpdate;
  const updatedSprint = await prisma.sprint.update({
    where: {
      id: sprintId,
    },
    data: {
      name,
      duration,
      goals,
      notes,
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

    return prisma.$transaction<Sprint>(async (tx: Prisma.TransactionClient) => {
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

async function addRetrospective(sprintId: number, content: string, type: RetrospectiveType): Promise<Retrospective> {
  const retrospective = await prisma.retrospective.create({
    data: {
      sprint: {
        connect: {
          id: sprintId,
        },
      },
      content,
      type,
    },
  });

  return retrospective;
}

async function deleteRetrospective(retroId: number): Promise<Retrospective> {
  const retrospective = await prisma.retrospective.delete({
    where: {
      id: retroId,
    },
  });

  return retrospective;
}

async function getRetrospectives(sprintId: number, userId: number, type?: RetrospectiveType): Promise<Retrospective[]> {
  const retrospectives = await prisma.retrospective.findMany({
    where: {
      sprint_id: sprintId,
      type,
    },
    include: {
      votes: {
        where: {
          user_id: userId,
        },
      },
    },
    orderBy: [
      {
        score: Prisma.SortOrder.desc,
      },
      {
        id: Prisma.SortOrder.asc,
      },
    ],
  });

  return retrospectives;
}

async function addRetrospectiveVote(
  retroId: number,
  userId: number,
  type: RetrospectiveVoteType,
): Promise<RetrospectiveVote> {
  return prisma.$transaction<RetrospectiveVote>(async (tx: Prisma.TransactionClient) => {
    const retrospectiveVote = await tx.retrospectiveVote.create({
      data: {
        retro: {
          connect: {
            id: retroId,
          },
        },
        user_id: userId,
        type,
      },
    });

    await tx.retrospective.update({
      where: {
        id: retroId,
      },
      data: {
        score: {
          ...(retrospectiveVote.type === RetrospectiveVoteType.up ? { increment: 1 } : { decrement: 1 }),
        },
      },
    });

    return retrospectiveVote;
  });
}

async function updateRetrospectiveVote(
  retroId: number,
  userId: number,
  type: RetrospectiveVoteType,
): Promise<RetrospectiveVote> {
  return prisma.$transaction<RetrospectiveVote>(async (tx: Prisma.TransactionClient) => {
    const retrospectiveVote = await tx.retrospectiveVote.update({
      where: {
        retro_id_user_id: {
          retro_id: retroId,
          user_id: userId,
        },
      },
      data: {
        type,
      },
    });

    await tx.retrospective.update({
      where: {
        id: retroId,
      },
      data: {
        score: {
          ...(retrospectiveVote.type === RetrospectiveVoteType.up ? { increment: 2 } : { decrement: 2 }),
        },
      },
    });

    return retrospectiveVote;
  });
}

async function deleteRetrospectiveVote(retroId: number, userId: number): Promise<RetrospectiveVote> {
  return prisma.$transaction<RetrospectiveVote>(async (tx: Prisma.TransactionClient) => {
    const retrospectiveVote = await prisma.retrospectiveVote.delete({
      where: {
        retro_id_user_id: {
          retro_id: retroId,
          user_id: userId,
        },
      },
    });

    await tx.retrospective.update({
      where: {
        id: retroId,
      },
      data: {
        score: {
          ...(retrospectiveVote.type === RetrospectiveVoteType.up ? { decrement: 1 } : { increment: 1 }),
        },
      },
    });

    return retrospectiveVote;
  });
}

export default {
  newSprint,
  listSprints,
  listSprintsByProjectId,
  listActiveSprint,
  updateSprint,
  updateSprintStatus,
  deleteSprint,
  addRetrospective,
  deleteRetrospective,
  getRetrospectives,
  addRetrospectiveVote,
  updateRetrospectiveVote,
  deleteRetrospectiveVote,
  getSprintNotes,
};
