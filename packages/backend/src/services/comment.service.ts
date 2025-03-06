import { BaseComment, CommentType, Prisma } from '@prisma/client';
import prisma from '../models/prismaClient';
import { BacklogCommentWithBase, IssueCommentWithBase } from '../helpers/types/comment.service.types';

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

async function createIssueComment(
  issueId: number,
  commenterId: number,
  content: string,
): Promise<IssueCommentWithBase> {
  return prisma.$transaction(async (prisma: Prisma.TransactionClient) => {
    const comment = await prisma.baseComment.create({
      data: {
        content,
        type: CommentType.issue,
        IssueComment: {
          create: {
            issue_id: issueId,
            commenter_id: commenterId,
          },
        },
      },
      include: {
        IssueComment: {
          include: {
            base_comment: true,
          },
        },
      },
    });

    return comment.IssueComment!;
  });
}

async function list(projectId: number, backlogId: number) {
  const comments = await prisma.backlogComment.findMany({
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

  // Flatten the commenter structure
  return comments.map((comment) => ({
    ...comment,
    commenter: {
      user_id: comment.commenter.user.user_id,
      user_email: comment.commenter.user.user_email,
      user_display_name: comment.commenter.user.user_display_name,
    },
  }));
}

async function listIssueComments(issueId: number) {
  const comments: IssueCommentWithBase[] = await prisma.issueComment.findMany({
    where: {
      issue_id: issueId,
    },
    orderBy: {
      base_comment: { created_at: 'desc' },
    },
    include: {
      commenter: {
        select: {
          user_display_name: true,
          user_email: true,
          user_id: true,
        },
      },
      base_comment: true,
    },
  });

  return comments;
}

async function update(commentId: number, updatedComment: string) {
  return await prisma.baseComment.update({
    where: {
      comment_id: commentId,
    },
    data: {
      content: updatedComment,
      updated_at: new Date(Date.now()),
    },
  });
}

async function remove(commentId: number) {
  return await prisma.baseComment.delete({
    where: {
      comment_id: commentId,
    },
  });
}

export default {
  create,
  createIssueComment,
  list,
  listIssueComments,
  update,
  remove,
};
