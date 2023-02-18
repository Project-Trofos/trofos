import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import feedbackController from '../../controllers/feedback';
import feedbackService from '../../services/feedback.service';
import { mockFeedbackData } from '../mocks/feedbackData';
import feedbackConstraint from '../../policies/constraints/feedback.constraint';

const feedbackServiceSpies = {
  create: jest.spyOn(feedbackService, 'create'),
  list: jest.spyOn(feedbackService, 'list'),
  listBySprintId: jest.spyOn(feedbackService, 'listBySprintId'),
  update: jest.spyOn(feedbackService, 'update'),
  remove: jest.spyOn(feedbackService, 'remove'),
};

describe('feedbackController tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const policyConstraint = feedbackConstraint.feedbackPolicyConstraint(1, true);
  const mockFeedback = mockFeedbackData[0];

  describe('create feedback', () => {
    it('should return new feedback and status 200 when new feedback is successfully created', async () => {
      const mockRequest = createRequest({
        body: {
          sprintId: mockFeedback.id,
          content: mockFeedback.content,
        },
      });
      const mockResponse = createResponse();

      mockResponse.locals.userSession = {
        user_id: mockFeedback.user_id,
      };

      feedbackServiceSpies.create.mockResolvedValueOnce(mockFeedback);

      await feedbackController.create(mockRequest, mockResponse);
      expect(feedbackServiceSpies.create).toHaveBeenCalledWith({
        sprintId: mockFeedback.sprint_id,
        content: mockFeedback.content,
        userId: mockFeedback.user_id,
      });
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(mockFeedback));
    });

    it('should throw an error and return status 500 when sprintId is missing', async () => {
      const request = createRequest({
        body: {
          sprintId: undefined,
          content: mockFeedback.content,
        },
      });

      const mockResponse = createResponse();

      mockResponse.locals.userSession = {
        user_id: mockFeedback.user_id,
      };

      feedbackServiceSpies.create.mockResolvedValueOnce(mockFeedback);

      await feedbackController.create(request, mockResponse);
      expect(feedbackServiceSpies.create).not.toHaveBeenCalledWith();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('list feedbacks', () => {
    it('should return all feedbacks and status 200', async () => {
      const mockRequest = createRequest();
      const mockResponse = createResponse();

      mockResponse.locals.policyConstraint = policyConstraint;

      feedbackServiceSpies.list.mockResolvedValueOnce(mockFeedbackData);

      await feedbackController.list(mockRequest, mockResponse);

      expect(feedbackServiceSpies.list).toHaveBeenCalledWith(policyConstraint);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(mockFeedbackData));
    });
  });

  describe('list feedbacks by sprintId', () => {
    it('should return array of feedbacks and status 200 when called with valid sprintId', async () => {
      const mockRequest = createRequest({
        params: {
          sprintId: mockFeedback.sprint_id,
        },
      });
      const mockResponse = createResponse();

      feedbackServiceSpies.listBySprintId.mockResolvedValueOnce(mockFeedbackData);

      await feedbackController.listBySprintId(mockRequest, mockResponse);

      expect(feedbackServiceSpies.listBySprintId).toHaveBeenCalledWith(mockFeedback.sprint_id);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(mockFeedbackData));
    });

    it('should throw an error and return status 400 when sprintId is missing', async () => {
      const mockMissingProjectIdRequest = createRequest();
      const mockResponse = createResponse();

      await feedbackController.listBySprintId(mockMissingProjectIdRequest, mockResponse);
      expect(feedbackServiceSpies.listBySprintId).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('update feedback', () => {
    const NEW_CONTENT = 'new content';
    it('should return updated feedback and status 200 when called with valid fields', async () => {
      const mockRequest = createRequest({
        params: {
          feedbackId: mockFeedback.id,
        },
        body: {
          content: 'new content',
        },
      });

      const mockResponse = createResponse();
      const expectedFeedback = {
        ...mockFeedback,
        content: NEW_CONTENT,
        updated_at: new Date(Date.now()),
      };
      feedbackServiceSpies.update.mockResolvedValueOnce(expectedFeedback);

      await feedbackController.update(mockRequest, mockResponse);
      expect(feedbackServiceSpies.update).toHaveBeenCalledWith(mockFeedback.id, {
        content: NEW_CONTENT,
      });
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(expectedFeedback));
    });

    it('should throw an error and return status 400 when feedbackId is missing', async () => {
      const mockRequest = createRequest({
        body: {
          content: NEW_CONTENT,
        },
      });
      const mockResponse = createResponse();
      await feedbackController.update(mockRequest, mockResponse);
      expect(feedbackServiceSpies.update).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should throw an error and return status 400 when content is missing', async () => {
      const mockRequest = createRequest({
        params: {
          feedbackId: mockFeedback.id,
        },
      });
      const mockResponse = createResponse();
      await feedbackController.update(mockRequest, mockResponse);
      expect(feedbackServiceSpies.update).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('delete feedback', () => {
    it('should return feedback and status 200 when called with valid fields', async () => {
      const mockRequest = createRequest({
        params: {
          feedbackId: mockFeedback.id,
        },
      });

      const mockResponse = createResponse();
      feedbackServiceSpies.remove.mockResolvedValueOnce(mockFeedback);

      await feedbackController.remove(mockRequest, mockResponse);
      expect(feedbackServiceSpies.remove).toHaveBeenCalledWith(mockFeedback.id);
      expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
      expect(mockResponse._getData()).toEqual(JSON.stringify(mockFeedback));
    });

    it('should throw an error and return status 400 when feedbackId is missing', async () => {
      const mockRequest = createRequest();
      const mockResponse = createResponse();
      await feedbackController.remove(mockRequest, mockResponse);
      expect(feedbackServiceSpies.remove).not.toHaveBeenCalled();
      expect(mockResponse.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });
});
