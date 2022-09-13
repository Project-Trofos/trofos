import { Backlog } from '@prisma/client';
import prisma from '../models/prismaClient';
import { BacklogFields } from './types/backlog.service.types';

async function createBacklog(backlogFields : BacklogFields) : Promise<Backlog> {
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
      reporter: {
        connect: {
          project_id_user_id: {
            user_id: reporterId,
            project_id: projectId,
          },
        },
      },
      ...assigneeId && {
        assignee: {
          connect: {
            project_id_user_id: {
              user_id: assigneeId,
              project_id: projectId,
            },
          },
        },
      },
      points: points || null,
      description: description || null,
    },
  });

  return backlog;
}

async function getBacklogs(projectId : number) : Promise<Backlog[]> {
  const backlogs = await prisma.backlog.findMany({
    where: {
      project_id: projectId,
    },
  });

  return backlogs;
}

export default {
  createBacklog,
  getBacklogs,
};
