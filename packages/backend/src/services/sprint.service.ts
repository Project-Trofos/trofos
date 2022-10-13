import { Sprint } from '@prisma/client';
import prisma from '../models/prismaClient';
import { SprintFields } from '../helpers/types/sprint.service.types';

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
      backlogs: true,
    },
  });

  return sprints;
}

async function updateSprint(sprintToUpdate: Omit<SprintFields, 'projectId'> & { sprintId: number }): Promise<Sprint> {
  const { sprintId, name, dates, duration, goals } = sprintToUpdate;
  const updatedSprint = await prisma.sprint.update({
    where: {
      id: sprintId,
    },
    data: {
      name,
      duration,
      goals,
      start_date: dates ? new Date(dates[0]) : null,
      end_date: dates ? new Date(dates[1]) : null,
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
  updateSprint,
  deleteSprint,
};
