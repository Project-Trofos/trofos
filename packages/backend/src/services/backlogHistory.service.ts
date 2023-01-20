import { BacklogHistory } from '@prisma/client';
import prisma from '../models/prismaClient';

// List the project history of a particular sprint
async function getSprintBacklogHistory(sprintId: number): Promise<BacklogHistory[]> {
  const history = await prisma.backlogHistory.findMany({
    where: {
      sprint_id: sprintId,
    },
  });

  return history;
}

// List all backlog histories of a project
async function getProjectBacklogHistory(projectId: number): Promise<BacklogHistory[]> {
  const history = await prisma.backlogHistory.findMany({
    where: {
      project_id: projectId,
    },
  });

  return history;
}

export default {
  getSprintBacklogHistory,
  getProjectBacklogHistory,
};
