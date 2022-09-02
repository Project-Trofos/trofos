import { Backlog } from '@prisma/client';
import prisma from '../models/prismaClient';
import { BacklogFields } from './types/backlog.service.types';

async function createBacklog(backlogFields : BacklogFields) : Promise<Backlog> {
  /* eslint-disable @typescript-eslint/naming-convention */
  const {
    summary,
    type,
    sprint_id,
    priority,
    reporter_id,
    assignee_id,
    points,
    description,
    project_id,
  } = backlogFields;
  /* eslint-enable @typescript-eslint/naming-convention */
    
  const backlog = await prisma.backlog.create({
    data: {
      summary,
      type,
      ...sprint_id && {
        sprint: {
          connect: { id: sprint_id },
        },
      },
      priority: priority || null,
      reporter: {
        connect: {
          project_id_user_id: {
            user_id: reporter_id,
            project_id,
          },
        },
      },
      ...assignee_id && {
        assignee: {
          connect: {
            project_id_user_id: {
              user_id: assignee_id,
              project_id,
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

export default {
  createBacklog,
};
