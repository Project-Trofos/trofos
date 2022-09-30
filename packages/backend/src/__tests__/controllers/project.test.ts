import StatusCodes from 'http-status-codes';
import { User, UsersOnProjects } from '@prisma/client';
import { createRequest, createResponse } from 'node-mocks-http';
import project from '../../services/project.service';
import projectController from '../../controllers/project';
import projectsData from '../mocks/projectData';
import { CURRENT_SEM, CURRENT_YEAR } from '../../helpers/currentTime';
import { canManageProject } from '../../policies/project.policy';

jest.mock('../../policies/project.policy')

let canManageProjectMock = jest.mocked(canManageProject)


const spies = {
  getAll: jest.spyOn(project, 'getAll'),
  create: jest.spyOn(project, 'create'),
  getById: jest.spyOn(project, 'getById'),
  update: jest.spyOn(project, 'update'),
  remove: jest.spyOn(project, 'remove'),
  getUsers: jest.spyOn(project, 'getUsers'),
  addUser: jest.spyOn(project, 'addUser'),
  removeUser: jest.spyOn(project, 'removeUser'),
};


describe('project controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  canManageProjectMock.mockResolvedValue(true);

  // Mock data for users
  const usersData: User[] = [{ user_email: 'user@mail.com', user_id: 1, user_password_hash: 'hash' }];

  // Mock data for users on projects
  const usersProjectData: UsersOnProjects[] = [{ project_id: 1, user_id: 1, created_at: new Date(Date.now()) }];

  describe('getAll', () => {
    it('should return all projects', async () => {
      spies.getAll.mockResolvedValueOnce(projectsData);
    
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

      await projectController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData));
    });

    it('should return all past projects', async () => {
      const pastProjects = projectsData.filter(
        (p) =>
          p.course_year &&
          p.course_sem &&
          (p.course_year < CURRENT_YEAR || (p.course_year === CURRENT_YEAR && p.course_sem < CURRENT_SEM)),
      );
      spies.getAll.mockResolvedValueOnce(pastProjects);
      const mockReq = createRequest({
        body: {
          option: 'past',
        },
      });
      const mockRes = createResponse();
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

      await projectController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(pastProjects));
    });

    it('should return all current projects', async () => {
      const currentProjects = projectsData.filter(
        (p) => !p.course_year || !p.course_sem || (p.course_year === CURRENT_YEAR && p.course_sem === CURRENT_SEM),
      );
      spies.getAll.mockResolvedValueOnce(currentProjects);
      const mockReq = createRequest({
        body: {
          option: 'current',
        },
      });
      const mockRes = createResponse();
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

      await projectController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(currentProjects));
    });

    it('should throw if option is incorrect', async () => {
      const mockReq = createRequest({
        body: {
          option: 'some option',
        },
      });
      const mockRes = createResponse();
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

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
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

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
      const mockRes = createResponse();
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

      await projectController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData[0]));
    });

    it('should return bad request if name is not provided', async () => {
      spies.create.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        body: {
          description: projectsData[0].description,
        },
      });
      const mockRes = createResponse();
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

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
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

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
      mockRes.locals.sessionInformation = {}

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
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

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
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

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
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

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
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

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
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

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
      mockRes.locals.sessionInformation = {}
      mockRes.locals.sessionInformation.user_id = 1

      await projectController.removeUser(mockReq, mockRes);

      expect(spies.removeUser).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });
});
