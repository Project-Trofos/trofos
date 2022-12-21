import { Comment } from '@prisma/client';
import { CommentFields } from '../../helpers/types/comment.service.types';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import commentService from '../../services/comment.service';
import { mockCommentData, mockCommentFields } from '../mocks/commentData';

describe('comment.service tests', () => {
  describe('create comment', () => {
    it('should create and return comment', async () => {
      const mockReturnedComment: Comment = mockCommentData;
      const comment: CommentFields = mockCommentFields;

      prismaMock.comment.create.mockResolvedValueOnce(mockReturnedComment);
      await expect(
        commentService.create(comment.projectId, comment.backlogId, comment.commenterId, comment.content),
      ).resolves.toEqual(mockReturnedComment);
    });
  });

  describe('get comments', () => {
    it('should return comments when called with valid project id', async () => {
      const mockReturnedComments: Comment[] = [mockCommentData];
      const projectId = 123;
      const backlogId = 1;
      prismaMock.comment.findMany.mockResolvedValueOnce(mockReturnedComments);
      await expect(commentService.list(projectId, backlogId)).resolves.toEqual(mockReturnedComments);
    });
  });

  describe('update comment', () => {
    it('should update and return comment', async () => {
      const mockReturnedComment: Comment = {
        ...mockCommentData,
        content: 'An updated comment',
      };

      const commentToUpdate = {
        commentId: 1,
        updatedComment: 'An updated comment',
      };
      prismaMock.comment.update.mockResolvedValueOnce(mockReturnedComment);
      await expect(commentService.update(commentToUpdate.commentId, commentToUpdate.updatedComment)).resolves.toEqual(
        mockReturnedComment,
      );
    });
  });

  describe('delete comment', () => {
    it('should return comment that got deleted', async () => {
      const mockReturnedComment: Comment = mockCommentData;
      const commentId = 1;
      prismaMock.comment.delete.mockResolvedValueOnce(mockReturnedComment);
      await expect(commentService.remove(commentId)).resolves.toEqual(mockReturnedComment);
    });
  });
});
