import { BaseComment, Prisma } from '@prisma/client';
import { BacklogCommentWithBase, CommentFields, IssueCommentFields } from '../../helpers/types/comment.service.types';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import commentService from '../../services/comment.service';
import {
  mockBaseCommentData,
  mockBaseIssueCommentData,
  mockCommentData,
  mockCommentFields,
  mockIssueCommentData,
  mockIssueCommentFields,
} from '../mocks/commentData';

describe('comment.service tests', () => {
  describe('create comment', () => {
    it('should create and return comment', async () => {
      const mockData = { ...mockBaseCommentData, BacklogComment: mockCommentData };
      const mockReturnedComment = mockCommentData;
      const comment: CommentFields = mockCommentFields;

      const mockTransactionClient = {
        baseComment: {
          create: jest.fn().mockResolvedValueOnce(mockData),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransactionClient as unknown as Prisma.TransactionClient);
      });

      await expect(
        commentService.create(comment.projectId, comment.backlogId, comment.commenterId, comment.content),
      ).resolves.toEqual(mockReturnedComment);
    });
  });

  describe('create issue comment', () => {
    it('should create and return issue comment', async () => {
      const mockData = { ...mockBaseIssueCommentData, IssueComment: mockIssueCommentData };
      const mockReturnedComment = mockIssueCommentData;
      const comment: IssueCommentFields = mockIssueCommentFields;

      const mockTransactionClient = {
        baseComment: {
          create: jest.fn().mockResolvedValueOnce(mockData),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransactionClient as unknown as Prisma.TransactionClient);
      });

      await expect(
        commentService.createIssueComment(comment.issueId, comment.commenterId, comment.content),
      ).resolves.toEqual(mockReturnedComment);
    });
  });

  describe('get comments', () => {
    it('should return comments when called with valid project id', async () => {
      const mockData = [
        {
          comment_id: mockCommentData.comment_id,
          backlog_id: mockCommentData.backlog_id,
          commenter_id: mockCommentData.commenter_id,
          project_id: mockCommentData.project_id,
          base_comment: mockBaseCommentData,
          commenter: {
            user: {
              user_id: mockCommentData.commenter.user_id,
              user_email: mockCommentData.commenter.user_email,
              user_display_name: mockCommentData.commenter.user_display_name,
            },
          },
        },
      ];
      const mockReturnedComments = [mockCommentData];
      const projectId = 123;
      const backlogId = 1;
      prismaMock.backlogComment.findMany.mockResolvedValueOnce(mockData);
      await expect(commentService.list(projectId, backlogId)).resolves.toEqual(mockReturnedComments);
    });
  });

  describe('get issue comments', () => {
    it('should return issue comments when called with valid issue id', async () => {
      const mockData = [mockIssueCommentData];
      const mockReturnedComments = mockData;
      const issueId = 1;
      prismaMock.issueComment.findMany.mockResolvedValueOnce(mockData);
      await expect(commentService.listIssueComments(issueId)).resolves.toEqual(mockReturnedComments);
    });
  });

  describe('update comment', () => {
    it('should update and return comment', async () => {
      const mockReturnedComment: BaseComment = {
        ...mockBaseCommentData,
        content: 'An updated comment',
        updated_at: new Date(Date.now()),
      };

      const commentToUpdate = {
        commentId: 1,
        updatedComment: 'An updated comment',
      };
      prismaMock.baseComment.update.mockResolvedValueOnce(mockReturnedComment);
      await expect(commentService.update(commentToUpdate.commentId, commentToUpdate.updatedComment)).resolves.toEqual(
        mockReturnedComment,
      );
    });
  });

  describe('delete comment', () => {
    it('should return comment that got deleted', async () => {
      const mockReturnedComment: BaseComment = mockBaseCommentData;
      const commentId = 1;
      prismaMock.baseComment.delete.mockResolvedValueOnce(mockReturnedComment);
      await expect(commentService.remove(commentId)).resolves.toEqual(mockReturnedComment);
    });
  });
});
