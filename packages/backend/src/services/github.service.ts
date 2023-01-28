import { Backlog, BacklogStatus, BacklogStatusType, Prisma, ProjectGitLink } from '@prisma/client';
import prisma from '../models/prismaClient';

async function handleWebhook(repoLink: string, backlogId: number, status: BacklogStatusType): Promise<Backlog[]> {
  return prisma.$transaction<Backlog[]>(async (tx: Prisma.TransactionClient) => {
    const projectGitLinks = await tx.projectGitLink.findMany({
      where: {
        repo: repoLink,
      },
    });

    const promises = projectGitLinks.map(async (projectGitLink: ProjectGitLink) => {
      const backlogStatus: BacklogStatus = await tx.backlogStatus.findFirstOrThrow({
        where: {
          project_id: projectGitLink.project_id,
          type: status,
          order: 1,
        },
      });

      const backlog = await tx.backlog.update({
        where: {
          project_id_backlog_id: {
            project_id: projectGitLink.project_id,
            backlog_id: backlogId,
          },
        },
        data: {
          status: backlogStatus.name,
        },
      });

      return backlog;
    });

    return Promise.all(promises);
  });
}

export default {
  handleWebhook,
};
