import { BacklogComment, BaseComment, IssueComment } from '@prisma/client';

export type CommentFields = {
  projectId: number;
  backlogId: number;
  commenterId: number;
  content: string;
};

export type BacklogCommentWithBase = BacklogComment & { base_comment: BaseComment };
export type IssueCommentWithBase = IssueComment & { base_comment: BaseComment };
