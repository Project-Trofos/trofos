import { Project, ProjectAssignment } from '@prisma/client';
import { createRequest, createResponse } from 'node-mocks-http';
import projectAssignment from '../../services/projectAssignment.service';
import projectAssignmentController from '../../controllers/projectAssignment';
import { projectsData } from '../mocks/projectData';

const spies = {
  create: jest.spyOn(projectAssignment, 'create'),
  remove: jest.spyOn(projectAssignment, 'remove'),
  getAssignedProjects: jest.spyOn(projectAssignment, 'getAssignedProjects'),
};

describe('project assignment tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should return 200 and create a project assignment', async () => {
      const sourceProjectId = '1';
      const targetProjectId = '2';
      const mockResponse: ProjectAssignment = { id: 1, sourceProjectId: 1, targetProjectId: 2 };

      const mockReq = createRequest({
        params: {
          projectId: sourceProjectId,
        },
        body: {
          targetProjectId,
        },
      });
      const mockRes = createResponse();
      spies.create.mockResolvedValueOnce(mockResponse);

      await projectAssignmentController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(200);
      expect(mockRes._getData()).toEqual(JSON.stringify(mockResponse));
    });

    it('should return 400 if projects are the same', async () => {
      const sourceProjectId = '1';
      const targetProjectId = '1';
      const mockReq = createRequest({
        params: {
          projectId: sourceProjectId,
        },
        body: {
          targetProjectId,
        },
      });
      const mockRes = createResponse();

      await projectAssignmentController.create(mockReq, mockRes);

      expect(spies.create).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(400);
    });

    it('should return 400 if source project id is invalid', async () => {
      const sourceProjectId = 'invalid';
      const targetProjectId = '2';
      const mockReq = createRequest({
        params: {
          projectId: sourceProjectId,
        },
        body: {
          targetProjectId,
        },
      });
      const mockRes = createResponse();

      await projectAssignmentController.create(mockReq, mockRes);

      expect(spies.create).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(400);
    });

    it('should return 400 if target project id is invalid', async () => {
      const sourceProjectId = '1';
      const targetProjectId = 'invalid';
      const mockReq = createRequest({
        params: {
          projectId: sourceProjectId,
        },
        body: {
          targetProjectId,
        },
      });
      const mockRes = createResponse();

      await projectAssignmentController.create(mockReq, mockRes);

      expect(spies.create).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(400);
    });

    it('should return 500 if projectAssignmentService  throws an error', async () => {
      const sourceProjectId = '1';
      const targetProjectId = '2';
      const mockReq = createRequest({
        params: {
          projectId: sourceProjectId,
        },
        body: {
          targetProjectId,
        },
      });
      const mockRes = createResponse();
      spies.create.mockRejectedValueOnce(new Error('Service failed'));

      await projectAssignmentController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(500);
    });
  });

  describe('remove', () => {
    it('should return 200 and remove a project assignment', async () => {
      const sourceProjectId = '1';
      const projectAssignmentId = '2';
      const mockResponse: ProjectAssignment = { id: 1, sourceProjectId: 1, targetProjectId: 2 };

      const mockReq = createRequest({
        params: {
          projectId: sourceProjectId,
          projectAssignmentId,
        },
      });
      const mockRes = createResponse();
      spies.remove.mockResolvedValueOnce(mockResponse);

      await projectAssignmentController.remove(mockReq, mockRes);

      expect(spies.remove).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(200);
      expect(mockRes._getData()).toEqual(JSON.stringify(mockResponse));
    });

    it('should return 400 if project id is invalid', async () => {
      const sourceProjectId = 'invalid';
      const projectAssignmentId = '2';
      const mockReq = createRequest({
        params: {
          projectId: sourceProjectId,
          projectAssignmentId,
        },
      });
      const mockRes = createResponse();

      await projectAssignmentController.remove(mockReq, mockRes);

      expect(spies.remove).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(400);
    });

    it('should return 400 if project assignment id is invalid', async () => {
      const sourceProjectId = '1';
      const projectAssignmentId = 'invalid';
      const mockReq = createRequest({
        params: {
          projectId: sourceProjectId,
          projectAssignmentId,
        },
      });
      const mockRes = createResponse();

      await projectAssignmentController.remove(mockReq, mockRes);

      expect(spies.remove).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(400);
    });

    it('should return 500 if projectAssignmentService throws an error', async () => {
      const sourceProjectId = '1';
      const projectAssignmentId = '2';
      const mockReq = createRequest({
        params: {
          projectId: sourceProjectId,
          projectAssignmentId,
        },
      });
      const mockRes = createResponse();
      spies.remove.mockRejectedValueOnce(new Error('Service failed'));

      await projectAssignmentController.remove(mockReq, mockRes);

      expect(spies.remove).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(500);
    });
  });

  describe('getAssignedProjects', () => {
    it('should return 200 and get assigned projects', async () => {
      const projectId = '1';
      const mockResponse: { id: number; targetProject: Project }[] = projectsData.map((project, index) => ({
        id: index,
        targetProject: project,
      }));
      const mockReq = createRequest({
        params: {
          projectId,
        },
      });
      const mockRes = createResponse();
      spies.getAssignedProjects.mockResolvedValueOnce(mockResponse);

      await projectAssignmentController.getAssignedProjects(mockReq, mockRes);

      expect(spies.getAssignedProjects).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(200);
      expect(mockRes._getData()).toEqual(JSON.stringify(mockResponse));
    });

    it('should return 400 if project id is invalid', async () => {
      const projectId = 'invalid';
      const mockReq = createRequest({
        params: {
          projectId,
        },
      });
      const mockRes = createResponse();

      await projectAssignmentController.getAssignedProjects(mockReq, mockRes);

      expect(spies.getAssignedProjects).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(400);
    });

    it('should return 500 if projectAssignmentService throws an error', async () => {
      const projectId = '1';
      const mockReq = createRequest({
        params: {
          projectId,
        },
      });
      const mockRes = createResponse();
      spies.getAssignedProjects.mockRejectedValueOnce(new Error('Service failed'));

      await projectAssignmentController.getAssignedProjects(mockReq, mockRes);

      expect(spies.getAssignedProjects).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(500);
    });
  });
});
