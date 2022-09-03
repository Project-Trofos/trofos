import StatusCodes from 'http-status-codes';
import { Project, User, UsersOnProjects } from '@prisma/client';
import { createRequest, createResponse } from 'node-mocks-http';
import project from '../../services/project.service';
import projectController from '../../controllers/project';


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

  // Mock data for users
  const usersData: User[] = [
    { user_email: 'user@mail.com', user_id: 1, user_password_hash: 'hash' },
  ];

  // Mock data for users on projects
  const usersProjectData: UsersOnProjects[] = [
    { project_id: 1, user_id: 1, created_at: new Date(Date.now()) },
  ];

  // Mock data for projects
  const projectsData: Project[] = [
    { id: 1, pname: 'c1', created_at: new Date(Date.now()), course_id: null, pkey: null, description: 'd1', public: false },
    { id: 2, pname: 'c2', created_at: new Date(Date.now()), course_id: null, pkey: null, description: 'd2', public: false },
    { id: 3, pname: 'c3', created_at: new Date(Date.now()), course_id: null, pkey: null, description: 'd3', public: false },
  ];

  describe('getAll', () => {
    test('should return all projects', async () => {
      spies.getAll.mockResolvedValueOnce(projectsData);
      const mockReq = createRequest();
      const mockRes = createResponse();

      await projectController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData));
    });
  });

  describe('get', () => {
    test('should return project', async () => {
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
    test('should return project created', async () => {
      spies.create.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({ 
        body: { 
          name: projectsData[0].pname,
          description: projectsData[0].description,
        }, 
      });
      const mockRes = createResponse();

      await projectController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData[0]));
    });

    test('should return bad request if name is not provided', async () => {
      spies.create.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({ 
        body: { 
          description: projectsData[0].description,
        }, 
      });
      const mockRes = createResponse();

      await projectController.create(mockReq, mockRes);

      expect(spies.create).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('update', () => {
    test('should return project updated', async () => {
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

    test('should return bad request if update fields are not provided', async () => {
      const mockReq = createRequest({ 
        params: {
          projectId: projectsData[0].id.toString(),
        },
        body: { 
        }, 
      });
      const mockRes = createResponse();

      await projectController.update(mockReq, mockRes);

      expect(spies.update).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get', () => {
    test('should return project', async () => {
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
    test('should return all users', async () => {
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
    test('should return added user relation', async () => {
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

    test('should return error if no userId given', async () => {
      spies.addUser.mockResolvedValueOnce(usersProjectData[0]);
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
        body: {
        },
      });
      const mockRes = createResponse();

      await projectController.addUser(mockReq, mockRes);

      expect(spies.addUser).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('removeUser', () => {
    test('should return removed user relation', async () => {
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

    test('should return error if no userId given', async () => {
      spies.removeUser.mockResolvedValueOnce(usersProjectData[0]);
      const mockReq = createRequest({
        params: {
          projectId: projectsData[0].id.toString(),
        },
        body: {
        },
      });
      const mockRes = createResponse();

      await projectController.removeUser(mockReq, mockRes);

      expect(spies.removeUser).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

});
