import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import { BacklogComment, BaseComment } from '@prisma/client';
import commentController from '../../controllers/comment';
import commentService from '../../services/comment.service';
import {
  mockBaseCommentData,
  mockCommentData,
  mockCommentFields,
  mockIssueCommentData,
  mockIssueCommentFields,
} from '../mocks/commentData';
import {
  BacklogCommentWithBase,
  CommentFields,
  IssueCommentFields,
  IssueCommentWithBase,
} from '../../helpers/types/comment.service.types';

const commentServiceSpies = {
  create: jest.spyOn(commentService, 'create'),
  createIssueComment: jest.spyOn(commentService, 'createIssueComment'),
  list: jest.spyOn(commentService, 'list'),
  listIssueComments: jest.spyOn(commentService, 'listIssueComments'),
  update: jest.spyOn(commentService, 'update'),
  remove: jest.spyOn(commentService, 'remove'),
};

describe('commentController tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create comment', () => {
    const mockComment: CommentFields = mockCommentFields;

    const expectedComment: BacklogCommentWithBase = mockCommentData;

    const mockRequest = createRequest({
      body: mockComment,
    });

    const mockResponse = createResponse();

    it('should return new comment and status 200 when new comment is successfully created', async () => {
      commentServiceSpies.create.mockResolvedValueOnce(expectedComment);

      await commentController.create(mockRequest, mockResponse);
      expect(commentServiceSpies.create).toHaveBeenCalledWith(
        mockComment.projectId,
        mockComment.backlogId,
        mockComment.commenterId,
        mockComment.content,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedComment));
    });

    it('should throw an error and return status 500 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        body: {
          ...mockComment,
          projectId: undefined,
        },
      });

      commentServiceSpies.create.mockResolvedValueOnce(expectedComment);

      await commentController.create(mockMissingProjectIdRequest, mockResponse);
      expect(commentServiceSpies.create).not.toHaveBeenCalledWith();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('create issue comment', () => {
    const mockComment: IssueCommentFields = mockIssueCommentFields;

    const expectedComment: IssueCommentWithBase = mockIssueCommentData;

    const mockRequest = createRequest({
      body: mockComment,
    });

    const mockResponse = createResponse();

    it('should return new issue comment and status 200 when new comment is successfully created', async () => {
      commentServiceSpies.createIssueComment.mockResolvedValueOnce(expectedComment);

      await commentController.createIssueComment(mockRequest, mockResponse);
      expect(commentServiceSpies.createIssueComment).toHaveBeenCalledWith(
        mockComment.issueId,
        mockComment.commenterId,
        mockComment.content,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedComment));
    });

    it('should throw an error and return status 500 when issueId is missing', async () => {
      const mockMissingIssueIdRequest = createRequest({
        body: {
          ...mockComment,
          issueId: undefined,
        },
      });

      commentServiceSpies.createIssueComment.mockResolvedValueOnce(expectedComment);

      await commentController.createIssueComment(mockMissingIssueIdRequest, mockResponse);
      expect(commentServiceSpies.createIssueComment).not.toHaveBeenCalledWith();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 500 when commenterId is missing', async () => {
      const mockMissingCommenterIdRequest = createRequest({
        body: {
          ...mockComment,
          commenterId: undefined,
        },
      });

      commentServiceSpies.createIssueComment.mockResolvedValueOnce(expectedComment);

      await commentController.createIssueComment(mockMissingCommenterIdRequest, mockResponse);
      expect(commentServiceSpies.createIssueComment).not.toHaveBeenCalledWith();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 500 when content is missing', async () => {
      const mockMissingContentRequest = createRequest({
        body: {
          ...mockComment,
          content: undefined,
        },
      });

      commentServiceSpies.createIssueComment.mockResolvedValueOnce(expectedComment);

      await commentController.createIssueComment(mockMissingContentRequest, mockResponse);
      expect(commentServiceSpies.createIssueComment).not.toHaveBeenCalledWith();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('list comments', () => {
    const mockProjectAndBacklogId = {
      projectId: 123,
      backlogId: 1,
    };

    const mockRequest = createRequest({
      params: mockProjectAndBacklogId,
    });

    const mockResponse = createResponse();

    it('should return array of comments and status 200 when called with valid projectId and backlogId', async () => {
      const expectedComments = [mockCommentData];
      commentServiceSpies.list.mockResolvedValueOnce(expectedComments);

      await commentController.list(mockRequest, mockResponse);
      expect(commentServiceSpies.list).toHaveBeenCalledWith(
        mockProjectAndBacklogId.projectId,
        mockProjectAndBacklogId.backlogId,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedComments));
    });

    it('should throw an error and return status 400 when projectId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest({
        params: {
          backlogId: 1,
        },
      });
      await commentController.list(mockMissingProjectIdRequest, mockResponse);
      expect(commentServiceSpies.list).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('list issue comments', () => {
    const mockIssueId = {
      issueId: 1,
    };

    const mockRequest = createRequest({
      params: mockIssueId,
    });

    const mockResponse = createResponse();

    it('should return array of issue comments and status 200 when called with valid issueId', async () => {
      const expectedComments = [mockIssueCommentData];
      commentServiceSpies.listIssueComments.mockResolvedValueOnce(expectedComments);

      await commentController.listIssueComments(mockRequest, mockResponse);
      expect(commentServiceSpies.listIssueComments).toHaveBeenCalledWith(mockIssueId.issueId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedComments));
    });

    it('should throw an error and return status 400 when issueId is missing', async () => {
      const mockMissingIssueIdRequest = createRequest({
        params: { issueId: undefined },
      });
      await commentController.listIssueComments(mockMissingIssueIdRequest, mockResponse);
      expect(commentServiceSpies.listIssueComments).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('update comment', () => {
    const mockCommentToUpdate = {
      commentId: 1,
      updatedComment: 'An updated comment',
    };

    const mockRequest = createRequest({
      body: mockCommentToUpdate,
    });

    const mockResponse = createResponse();

    it('should return updated comment and status 200 when called with valid fields', async () => {
      const expectedComment: BaseComment = {
        ...mockBaseCommentData,
        content: 'An updated comment',
        updated_at: new Date(Date.now()),
      };
      commentServiceSpies.update.mockResolvedValueOnce(expectedComment);

      await commentController.update(mockRequest, mockResponse);
      expect(commentServiceSpies.update).toHaveBeenCalledWith(
        mockCommentToUpdate.commentId,
        mockCommentToUpdate.updatedComment,
      );
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedComment));
    });

    it('should throw an error and return status 400 when commentId is missing', async () => {
      const mockMissingCommentIdRequest = createRequest({
        body: {
          ...mockCommentToUpdate,
          commentId: undefined,
        },
      });
      await commentController.update(mockMissingCommentIdRequest, mockResponse);
      expect(commentServiceSpies.update).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('delete comment', () => {
    const mockCommentToDelete = {
      commentId: 1,
    };

    const mockRequest = createRequest({
      params: mockCommentToDelete,
    });

    const mockResponse = createResponse();

    it('should return comment and status 200 when called with valid fields', async () => {
      const expectedComment: BaseComment = mockBaseCommentData;
      commentServiceSpies.remove.mockResolvedValueOnce(expectedComment);

      await commentController.remove(mockRequest, mockResponse);
      expect(commentServiceSpies.remove).toHaveBeenCalledWith(mockCommentToDelete.commentId);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedComment));
    });

    it('should throw an error and return status 400 when commentId is missing', async () => {
      const mockMissingCommentIdRequest = createRequest({
        params: {
          commentId: undefined,
        },
      });
      await commentController.remove(mockMissingCommentIdRequest, mockResponse);
      expect(commentServiceSpies.remove).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });
});
