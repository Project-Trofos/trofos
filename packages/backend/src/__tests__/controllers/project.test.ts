import StatusCodes from 'http-status-codes';
import { BacklogStatus, BacklogStatusType, User, UsersOnProjects, Settings } from '@prisma/client';
import { createRequest, createResponse } from 'node-mocks-http';
import project from '../../services/project.service';
import settings from '../../services/settings.service';
import projectController from '../../controllers/project';
import { projectsData } from '../mocks/projectData';
import { settingsData } from '../mocks/settingsData';

const spies = {
  getAll: jest.spyOn(project, 'getAll'),
  create: jest.spyOn(project, 'create'),
  getById: jest.spyOn(project, 'getById'),
  update: jest.spyOn(project, 'update'),
  remove: jest.spyOn(project, 'remove'),
  getUsers: jest.spyOn(project, 'getUsers'),
  addUser: jest.spyOn(project, 'addUser'),
  removeUser: jest.spyOn(project, 'removeUser'),
  createBacklogStatus: jest.spyOn(project, 'createBacklogStatus'),
  updateBacklogStatus: jest.spyOn(project, 'updateBacklogStatus'),
  updateBacklogStatusOrder: jest.spyOn(project, 'updateBacklogStatusOrder'),
  getBacklogStatus: jest.spyOn(project, 'getBacklogStatus'),
  deleteBacklogStatus: jest.spyOn(project, 'deleteBacklogStatus'),
  getSettings: jest.spyOn(settings, 'get'),
};

describe('project controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mock data for users
  const usersData: User[] = [{ user_email: 'user@mail.com', user_id: 1, user_password_hash: 'hash' }];

  // Mock data for users on projects
  const usersProjectData: UsersOnProjects[] = [{ project_id: 1, user_id: 1, created_at: new Date(Date.now()) }];

  // Mock data for backlog status
  const backlogStatusData: BacklogStatus[] = [
    { project_id: 1, name: 'In progress', type: BacklogStatusType.in_progress, order: 1 },
  ];

  describe('getAll', () => {
    it('should return all projects', async () => {
      spies.getSettings.mockResolvedValue(settingsData);
      spies.getAll.mockResolvedValueOnce(projectsData);

      const mockReq = createRequest();
      const mockRes = createResponse();

      await projectController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData));
    });

    it('should return all past projects', async () => {
      const pastProjects = [projectsData[2]];
      spies.getSettings.mockResolvedValue(settingsData);
      spies.getAll.mockResolvedValueOnce(pastProjects);
      const mockReq = createRequest({
        body: {
          option: 'past',
        },
      });
      const mockRes = createResponse();

      await projectController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(pastProjects));
    });

    it('should return all current projects', async () => {
      const currentProjects = [projectsData[0], projectsData[1]];
      spies.getSettings.mockResolvedValue(settingsData);
      spies.getAll.mockResolvedValueOnce(currentProjects);
      const mockReq = createRequest({
        body: {
          option: 'current',
        },
      });
      const mockRes = createResponse();

      await projectController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(currentProjects));
    });

    it('should return all future projects', async () => {
      const futureProjects = [projectsData[3]];
      spies.getSettings.mockResolvedValue(settingsData);
      spies.getAll.mockResolvedValueOnce(futureProjects);
      const mockReq = createRequest({
        body: {
          option: 'future',
        },
      });
      const mockRes = createResponse();

      await projectController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(futureProjects));
    });

    it('should throw if option is incorrect', async () => {
      const mockReq = createRequest({
        body: {
          option: 'some option',
        },
      });
      const mockRes = createResponse();

      await projectController.getAll(mockReq, mockRes);

      expect(spies.getAll).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get', () => {
    it('should return project', async () => {
      spies.getById.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
      });
      const mockRes = createResponse();

      await projectController.get(mockReq, mockRes);

      expect(spies.getById).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData[0]));
    });
  });

  describe('create', () => {
    it('should return project created', async () => {
      spies.create.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        body: {
          projectName: projectsData[0].pname,
          description: projectsData[0].description,
        },
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await projectController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData[0]));
    });

    it('should bad request if user session is not defined', async () => {
      spies.create.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        body: {
          projectName: projectsData[0].pname,
          description: projectsData[0].description,
        },
      });
      const mockRes = createResponse();

      await projectController.create(mockReq, mockRes);

      expect(spies.create).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return bad request if name is not provided', async () => {
      spies.create.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        body: {
          description: projectsData[0].description,
        },
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await projectController.create(mockReq, mockRes);

      expect(spies.create).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('update', () => {
    it('should return project updated', async () => {
      spies.update.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
        body: {
          name: projectsData[0].pname,
          description: projectsData[0].description,
        },
      });
      const mockRes = createResponse();

      await projectController.update(mockReq, mockRes);

      expect(spies.update).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData[0]));
    });

    it('should return bad request if update fields are not provided', async () => {
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
        body: {},
      });
      const mockRes = createResponse();

      await projectController.update(mockReq, mockRes);

      expect(spies.update).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get', () => {
    it('should return project', async () => {
      spies.remove.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
      });
      const mockRes = createResponse();

      await projectController.remove(mockReq, mockRes);

      expect(spies.remove).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData[0]));
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      spies.getUsers.mockResolvedValueOnce(usersData);
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
      });
      const mockRes = createResponse();

      await projectController.getUsers(mockReq, mockRes);

      expect(spies.getUsers).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(usersData));
    });
  });

  describe('addUser', () => {
    it('should return added user relation', async () => {
      spies.addUser.mockResolvedValueOnce(usersProjectData[0]);
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
        body: {
          userId: usersData[0].user_id.toString(),
        },
      });
      const mockRes = createResponse();

      await projectController.addUser(mockReq, mockRes);

      expect(spies.addUser).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(usersProjectData[0]));
    });

    it('should return error if no userId given', async () => {
      spies.addUser.mockResolvedValueOnce(usersProjectData[0]);
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
        body: {},
      });
      const mockRes = createResponse();

      await projectController.addUser(mockReq, mockRes);

      expect(spies.addUser).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('removeUser', () => {
    it('should return removed user relation', async () => {
      spies.removeUser.mockResolvedValueOnce(usersProjectData[0]);
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
        body: {
          userId: usersData[0].user_id.toString(),
        },
      });
      const mockRes = createResponse();

      await projectController.removeUser(mockReq, mockRes);

      expect(spies.removeUser).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(usersProjectData[0]));
    });

    it('should return error if no userId given', async () => {
      spies.removeUser.mockResolvedValueOnce(usersProjectData[0]);
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
        body: {},
      });
      const mockRes = createResponse();

      await projectController.removeUser(mockReq, mockRes);

      expect(spies.removeUser).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('createBacklogStatus', () => {
    it('should return created backlog status', async () => {
      spies.createBacklogStatus.mockResolvedValueOnce(backlogStatusData[0]);
      const mockReq = createRequest({
        params: {
          projectId: backlogStatusData[0].project_id,
        },
        body: {
          name: backlogStatusData[0].name,
        },
      });
      const mockRes = createResponse();

      await projectController.createBacklogStatus(mockReq, mockRes);

      expect(spies.createBacklogStatus).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(backlogStatusData[0]));
    });

    it('should return error if no name given', async () => {
      spies.createBacklogStatus.mockResolvedValueOnce(backlogStatusData[0]);
      const mockReq = createRequest({
        params: {
          projectId: backlogStatusData[0].project_id,
        },
        body: {},
      });
      const mockRes = createResponse();

      await projectController.createBacklogStatus(mockReq, mockRes);

      expect(spies.createBacklogStatus).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('getBacklogStatus', () => {
    it('should return backlog status', async () => {
      spies.getBacklogStatus.mockResolvedValueOnce(backlogStatusData);
      const mockReq = createRequest({
        params: {
          projectId: backlogStatusData[0].project_id,
        },
      });
      const mockRes = createResponse();

      await projectController.getBacklogStatus(mockReq, mockRes);

      expect(spies.getBacklogStatus).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(backlogStatusData));
    });

    it('should return error if no projectId given', async () => {
      spies.getBacklogStatus.mockResolvedValueOnce(backlogStatusData);
      const mockReq = createRequest({
        params: {},
      });
      const mockRes = createResponse();

      await projectController.getBacklogStatus(mockReq, mockRes);

      expect(spies.getBacklogStatus).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('updateBacklogStatus', () => {
    it('should return updated backlog status name', async () => {
      const updatedStatus = { ...backlogStatusData[0], name: 'Development' };
      spies.updateBacklogStatus.mockResolvedValueOnce(updatedStatus);
      const mockReq = createRequest({
        params: {
          projectId: backlogStatusData[0].project_id,
        },
        body: {
          currentName: 'In progress',
          updatedName: 'Development',
        },
      });
      const mockRes = createResponse();

      await projectController.updateBacklogStatus(mockReq, mockRes);

      expect(spies.updateBacklogStatus).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(updatedStatus));
    });

    it('should return updated backlog status order', async () => {
      spies.updateBacklogStatusOrder.mockResolvedValueOnce(backlogStatusData);
      const mockReq = createRequest({
        params: {
          projectId: backlogStatusData[0].project_id,
        },
        body: {
          updatedStatuses: backlogStatusData,
        },
      });
      const mockRes = createResponse();

      await projectController.updateBacklogStatus(mockReq, mockRes);

      expect(spies.updateBacklogStatusOrder).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(backlogStatusData));
    });

    it('should return error if no projectId given', async () => {
      const updatedStatus = { ...backlogStatusData[0], name: 'Development' };
      spies.updateBacklogStatus.mockResolvedValueOnce(updatedStatus);
      const mockReq = createRequest({
        params: {},
        body: {
          currentName: 'In progress',
          updatedName: 'Development',
        },
      });
      const mockRes = createResponse();

      await projectController.updateBacklogStatus(mockReq, mockRes);

      expect(spies.updateBacklogStatus).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('deleteBacklogStatus', () => {
    it('should return deleted backlog status', async () => {
      spies.deleteBacklogStatus.mockResolvedValueOnce(backlogStatusData[0]);
      const mockReq = createRequest({
        params: {
          projectId: backlogStatusData[0].project_id,
        },
        body: {
          name: 'In progress',
        },
      });
      const mockRes = createResponse();

      await projectController.deleteBacklogStatus(mockReq, mockRes);

      expect(spies.deleteBacklogStatus).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(backlogStatusData[0]));
    });

    it('should return error if no projectId given', async () => {
      spies.deleteBacklogStatus.mockResolvedValueOnce(backlogStatusData[0]);
      const mockReq = createRequest({
        params: {},
      });
      const mockRes = createResponse();

      await projectController.deleteBacklogStatus(mockReq, mockRes);

      expect(spies.deleteBacklogStatus).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });
});
