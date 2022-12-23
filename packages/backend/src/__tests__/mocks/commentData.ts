import { Comment } from '@prisma/client';
import { CommentFields } from '../../helpers/types/comment.service.types';

export const mockCommentData: Comment = {
  comment_id: 1,
  backlog_id: 1,
  commenter_id: 1,
  project_id: 123,
  content: 'Test comment content',
  created_at: new Date(Date.now()),
  updated_at: null,
};

export const mockCommentFields: CommentFields = {
  projectId: 123,
  backlogId: 1,
  commenterId: 1,
  content: 'Test comment content',
};
