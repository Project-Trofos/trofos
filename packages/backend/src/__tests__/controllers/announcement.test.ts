import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import coursePolicy from '../../policies/constraints/course.constraint';
import announcementService from '../../services/announcement.service';
import { announcementData } from '../mocks/announcementData';
import announcementController from '../../controllers/announcement';

const spies = {
  get: jest.spyOn(announcementService, 'get'),
  list: jest.spyOn(announcementService, 'list'),
  create: jest.spyOn(announcementService, 'create'),
  update: jest.spyOn(announcementService, 'update'),
  remove: jest.spyOn(announcementService, 'remove'),
};

describe('announcement controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const coursePolicyConstraint = coursePolicy.coursePolicyConstraint(1, true);

  describe('get', () => {
    it('should return correct announcements', async () => {
      const announcement = announcementData[0];
      spies.get.mockResolvedValueOnce(announcement);
      const mockReq = createRequest({
        params: {
          announcementId: announcement.id,
        },
      });
      const mockRes = createResponse();

      await announcementController.get(mockReq, mockRes);

      expect(spies.get).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(announcement));
    });
  });

  describe('list', () => {
    it('should return all announcement', async () => {
      spies.list.mockResolvedValueOnce(announcementData);
      const mockReq = createRequest({
        params: {
          courseId: 1,
        },
      });
      const mockRes = createResponse();

      mockRes.locals.policyConstraint = coursePolicyConstraint;

      await announcementController.list(mockReq, mockRes);

      expect(spies.list).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(announcementData));
    });
  });

  describe('create', () => {
    it('should return created announcement', async () => {
      const announcement = announcementData[0];
      spies.create.mockResolvedValueOnce(announcement);
      const mockReq = createRequest({
        params: {
          courseId: announcement.course_id,
        },
        body: {
          announcementTitle: announcement.title,
          announcementContent: announcement.content,
        },
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await announcementController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(announcement));
    });
  });

  describe('update', () => {
    it('should return updated announcement', async () => {
      const announcement = announcementData[0];
      const updated = {
        ...announcement,
        title: 'updated title',
      };
      spies.update.mockResolvedValueOnce(updated);
      const mockReq = createRequest({
        params: {
          announcementId: updated.id,
        },
        body: {
          title: updated.title,
        },
      });
      const mockRes = createResponse();

      await announcementController.update(mockReq, mockRes);

      expect(spies.update).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(updated));
    });
  });

  describe('remove', () => {
    it('should return deleted announcement', async () => {
      const announcement = announcementData[0];
      spies.remove.mockResolvedValueOnce(announcement);
      const mockReq = createRequest({
        params: {
          announcementId: announcement.id,
        },
      });
      const mockRes = createResponse();

      await announcementController.remove(mockReq, mockRes);

      expect(spies.remove).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(announcement));
    });
  });
});
