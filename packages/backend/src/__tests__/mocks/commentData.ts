import { BaseComment, CommentType } from '@prisma/client';
import { CommentFields, IssueCommentFields } from '../../helpers/types/comment.service.types';

export const mockBaseCommentData: BaseComment = {
  comment_id: 1,
  content: 'Test comment content',
  type: CommentType.backlog,
  created_at: new Date(Date.now()),
  updated_at: null,
};

export const mockCommentData = {
  comment_id: 1,
  backlog_id: 1,
  commenter_id: 1,
  commenter: {
    user_id: 1,
    user_email: 'c4WtW@example.com',
    user_display_name: 'John Doe',
  },
  project_id: 123,
  base_comment: mockBaseCommentData,
};

export const mockCommentFields: CommentFields = {
  projectId: 123,
  backlogId: 1,
  commenterId: 1,
  content: 'Test comment content',
};

export const mockBaseIssueCommentData: BaseComment = {
  comment_id: 2,
  content: 'Test issue comment content',
  type: CommentType.issue,
  created_at: new Date(Date.now()),
  updated_at: null,
};

export const mockIssueCommentData = {
  comment_id: 2,
  issue_id: 1,
  commenter_id: 1,
  commenter: {
    user_id: 1,
    user_email: 'c4WtW@example.com',
    user_display_name: 'John Doe',
  },
  base_comment: mockBaseIssueCommentData,
};

export const mockIssueCommentFields: IssueCommentFields = {
  issueId: 1,
  commenterId: 1,
  content: 'Test issue comment content',
};
