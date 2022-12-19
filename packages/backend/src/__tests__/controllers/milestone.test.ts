import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import coursePolicy from '../../policies/constraints/course.constraint';
import milestoneService from '../../services/milestone.service';
import { milestoneData } from '../mocks/milestoneData';
import milestoneController from '../../controllers/milestone';

const spies = {
  get: jest.spyOn(milestoneService, 'get'),
  list: jest.spyOn(milestoneService, 'list'),
  create: jest.spyOn(milestoneService, 'create'),
  update: jest.spyOn(milestoneService, 'update'),
  remove: jest.spyOn(milestoneService, 'remove'),
};

describe('course controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const coursePolicyConstraint = coursePolicy.coursePolicyConstraint(1, true);

  describe('get', () => {
    it('should return correct milestone', async () => {
      const milestone = milestoneData[0];
      spies.get.mockResolvedValueOnce(milestone);
      const mockReq = createRequest({
        params: {
          milestoneId: milestone.id,
        },
      });
      const mockRes = createResponse();

      await milestoneController.get(mockReq, mockRes);

      expect(spies.get).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(milestone));
    });
  });

  describe('list', () => {
    it('should return all milestone', async () => {
      spies.list.mockResolvedValueOnce(milestoneData);
      const mockReq = createRequest({
        params: {
          courseId: 1,
        },
      });
      const mockRes = createResponse();

      mockRes.locals.policyConstraint = coursePolicyConstraint;

      await milestoneController.list(mockReq, mockRes);

      expect(spies.list).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(milestoneData));
    });
  });

  describe('create', () => {
    it('should return created milestone', async () => {
      const milestone = milestoneData[0];
      spies.create.mockResolvedValueOnce(milestone);
      const mockReq = createRequest({
        params: {
          courseId: milestone.course_id,
        },
        body: {
          milestoneDeadline: milestone.deadline.toString(),
          milestoneStartDate: milestone.start_date.toString(),
          milestoneName: milestone.name,
        },
      });
      const mockRes = createResponse();

      await milestoneController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(milestone));
    });
  });

  describe('update', () => {
    it('should return updated milestone', async () => {
      const milestone = milestoneData[0];
      const updated = {
        ...milestone,
        name: 'ms2',
      };
      spies.update.mockResolvedValueOnce(updated);
      const mockReq = createRequest({
        params: {
          milestoneId: updated.id,
        },
        body: {
          name: updated.name,
        },
      });
      const mockRes = createResponse();

      await milestoneController.update(mockReq, mockRes);

      expect(spies.update).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(updated));
    });
  });

  describe('remove', () => {
    it('should return deleted milestone', async () => {
      const milestone = milestoneData[0];
      spies.remove.mockResolvedValueOnce(milestone);
      const mockReq = createRequest({
        params: {
          milestoneId: milestone.id,
        },
      });
      const mockRes = createResponse();

      await milestoneController.remove(mockReq, mockRes);

      expect(spies.remove).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(milestone));
    });
  });
});
