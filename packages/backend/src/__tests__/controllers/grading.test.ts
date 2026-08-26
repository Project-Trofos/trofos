import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import { Prisma, ProjectGrade, ProjectGradeStatus, UserSession } from '@prisma/client';
import gradingService from '../../services/grading.service';
import gradingController from '../../controllers/grading';
import { NotAuthorizedError } from '../../helpers/error';

const spies = {
  list: jest.spyOn(gradingService, 'list'),
  update: jest.spyOn(gradingService, 'update'),
  publishAll: jest.spyOn(gradingService, 'publishAll'),
};

describe('grading controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const userSession: UserSession = {
    session_id: 's1',
    user_email: 'ta@test.com',
    user_role_id: 1,
    user_id: 100,
    user_is_admin: false,
    session_expiry: new Date(),
  };

  const gradeMock: ProjectGrade = {
    id: 1,
    project_id: 10,
    assigned_ta_id: 100,
    marks: null,
    comments: null,
    status: ProjectGradeStatus.draft,
    updated_at: new Date(),
    created_at: new Date(),
  };

  describe('list', () => {
    it('should return the grading matrix for the course', async () => {
      spies.list.mockResolvedValueOnce([gradeMock] as never);
      const mockReq = createRequest({ params: { courseId: 1 } });
      const mockRes = createResponse();

      await gradingController.list(mockReq, mockRes);

      expect(spies.list).toHaveBeenCalledWith(1);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify([gradeMock]));
    });
  });

  describe('update', () => {
    it('should update the grade and return it', async () => {
      const updated = { ...gradeMock, marks: new Prisma.Decimal(75) };
      spies.update.mockResolvedValueOnce(updated);
      const mockReq = createRequest({
        params: { courseId: 1, projectId: 10 },
        body: { marks: 75 },
      });
      const mockRes = createResponse();
      mockRes.locals.userSession = userSession;

      await gradingController.update(mockReq, mockRes);

      expect(spies.update).toHaveBeenCalledWith(1, 10, { assignedTaId: undefined, marks: 75, comments: undefined, status: undefined }, userSession);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(updated));
    });

    it('should reject invalid marks before calling the service', async () => {
      const mockReq = createRequest({
        params: { courseId: 1, projectId: 10 },
        body: { marks: 150 },
      });
      const mockRes = createResponse();
      mockRes.locals.userSession = userSession;

      await gradingController.update(mockReq, mockRes);

      expect(spies.update).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should surface a NotAuthorizedError from the service as 401', async () => {
      spies.update.mockRejectedValueOnce(new NotAuthorizedError('nope'));
      const mockReq = createRequest({
        params: { courseId: 1, projectId: 10 },
        body: { marks: 50 },
      });
      const mockRes = createResponse();
      mockRes.locals.userSession = userSession;

      await gradingController.update(mockReq, mockRes);

      expect(mockRes.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('publishAll', () => {
    it('should publish all grades for the course', async () => {
      spies.publishAll.mockResolvedValueOnce({ count: 2 });
      const mockReq = createRequest({ params: { courseId: 1 } });
      const mockRes = createResponse();
      mockRes.locals.userSession = userSession;

      await gradingController.publishAll(mockReq, mockRes);

      expect(spies.publishAll).toHaveBeenCalledWith(1, userSession);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });
});
