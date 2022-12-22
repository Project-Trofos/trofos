import { Comment } from '@prisma/client';
import prisma from '../models/prismaClient';

async function create(projectId: number, backlogId: number, commenterId: number, content: string) {
  const comment: Comment = await prisma.comment.create({
    data: {
      backlog: {
        connect: {
          project_id_backlog_id: {
            project_id: projectId,
            backlog_id: backlogId,
          },
        },
      },
      commenter: {
        connect: {
          project_id_user_id: {
            project_id: projectId,
            user_id: commenterId,
          },
        },
      },
      content,
    },
  });

  return comment;
}

async function list(projectId: number, backlogId: number) {
  const comments: Comment[] = await prisma.comment.findMany({
    where: {
      project_id: projectId,
      backlog_id: backlogId,
    },
    orderBy: {
      created_at: 'desc',
    },
    include: {
      commenter: {
        include: {
          user: {
            select: {
              user_email: true,
              user_id: true,
            },
          },
        },
      },
    },
  });

  return comments;
}

async function update(commentId: number, updatedComment: string) {
  const comment: Comment = await prisma.comment.update({
    where: {
      comment_id: commentId,
    },
    data: {
      content: updatedComment,
      updated_at: new Date(Date.now()),
    },
  });

  return comment;
}

async function remove(commentId: number) {
  const comment: Comment = await prisma.comment.delete({
    where: {
      comment_id: commentId,
    },
  });

  return comment;
}

export default {
  create,
  list,
  update,
  remove,
};
