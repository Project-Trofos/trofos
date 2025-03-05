import { BaseComment, BacklogComment, CommentType, Prisma } from '@prisma/client';
import prisma from '../models/prismaClient';
import { BacklogCommentWithBase } from '../helpers/types/comment.service.types';

async function create(
  projectId: number,
  backlogId: number,
  commenterId: number,
  content: string,
): Promise<BacklogCommentWithBase> {
  return prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
    const comment = await prisma.baseComment.create({
      data: {
        content,
        type: CommentType.backlog,
        BacklogComment: {
          create: {
            project_id: projectId,
            backlog_id: backlogId,
            commenter_id: commenterId,
          },
        },
      },
      include: {
        BacklogComment: {
          include: {
            base_comment: true,
          },
        },
      },
    });

    return comment.BacklogComment!;
  });
}

async function list(projectId: number, backlogId: number) {
  const comments: BacklogCommentWithBase[] = await prisma.backlogComment.findMany({
    where: {
      project_id: projectId,
      backlog_id: backlogId,
    },
    orderBy: {
      base_comment: { created_at: 'desc' },
    },
    include: {
      commenter: {
        include: {
          user: {
            select: {
              user_display_name: true,
              user_email: true,
              user_id: true,
            },
          },
        },
      },
      base_comment: true,
    },
  });

  return comments;
}

async function update(commentId: number, updatedComment: string) {
  const comment: BacklogCommentWithBase = await prisma.backlogComment.update({
    where: {
      comment_id: commentId,
    },
    data: {
      base_comment: {
        update: {
          content: updatedComment,
          updated_at: new Date(Date.now()),
        },
      },
    },
    include: {
      base_comment: true,
    },
  });

  return comment;
}

async function remove(commentId: number) {
  return prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
    const backlogComment = await prisma.backlogComment.delete({
      where: {
        comment_id: commentId,
      },
      include: {
        base_comment: true,
      },
    });

    await prisma.baseComment.delete({
      where: {
        comment_id: commentId,
      },
    });

    return backlogComment;
  });
}

export default {
  create,
  list,
  update,
  remove,
};
