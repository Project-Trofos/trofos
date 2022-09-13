import StatusCodes from 'http-status-codes';
import { Course, Project, User, UsersOnCourses } from '@prisma/client';
import { createRequest, createResponse } from 'node-mocks-http';
import course from '../../services/course.service';
import courseController from '../../controllers/course';


const spies = {
  getAll: jest.spyOn(course, 'getAll'),
  create: jest.spyOn(course, 'create'),
  getById: jest.spyOn(course, 'getById'),
  update: jest.spyOn(course, 'update'),
  remove: jest.spyOn(course, 'remove'),
  getUsers: jest.spyOn(course, 'getUsers'),
  addUser: jest.spyOn(course, 'addUser'),
  removeUser: jest.spyOn(course, 'removeUser'),
  getProjects: jest.spyOn(course, 'getProjects'),
  addProject: jest.spyOn(course, 'addProject'),
  removeProject: jest.spyOn(course, 'removeProject'),
  addProjectAndCourse: jest.spyOn(course, 'addProjectAndCourse'),
};

describe('course controller tests', () => {

  afterEach(() => {    
    jest.clearAllMocks();
  });

  // Mock data for users
  const usersData: User[] = [
    { user_email: 'user@mail.com', user_id: 1, user_password_hash: 'hash' },
  ];

  // Mock data for projects
  const projectsData: Project[] = [
    { id: 1, pname: 'c1', created_at: new Date(Date.now()), course_id: null, pkey: null, description: 'd1', public: false },
    { id: 2, pname: 'c2', created_at: new Date(Date.now()), course_id: null, pkey: null, description: 'd2', public: false },
    { id: 3, pname: 'c3', created_at: new Date(Date.now()), course_id: null, pkey: null, description: 'd3', public: false },
  ];

  // Mock data for users on courses
  const usersCourseData: UsersOnCourses[] = [
    { course_id: '1', user_id: 1, created_at: new Date(Date.now()) },
  ];

  // Mock data for courses
  const coursesData: Course[] = [
    { id: '1', cname: 'c1', created_at: new Date(Date.now()), description: 'd1', public: false },
    { id: '2', cname: 'c2', created_at: new Date(Date.now()), description: 'd2', public: false },
    { id: '3', cname: 'c3', created_at: new Date(Date.now()), description: 'd3', public: false },
  ];

  describe('getAll', () => {
    test('should return all courses', async () => {
      spies.getAll.mockResolvedValueOnce(coursesData);
      const mockReq = createRequest();
      const mockRes = createResponse();

      await courseController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(coursesData));
    });
  });

  describe('get', () => {
    test('should return course', async () => {
      spies.getById.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
      });
      const mockRes = createResponse();

      await courseController.get(mockReq, mockRes);

      expect(spies.getById).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(coursesData[0]));
    });
  });

  describe('create', () => {
    test('should return course created', async () => {
      spies.create.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({ 
        body: { 
          name: coursesData[0].cname,
          description: coursesData[0].description,
        }, 
      });
      const mockRes = createResponse();

      await courseController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(coursesData[0]));
    });

    test('should return bad request if name is not provided', async () => {
      spies.create.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({ 
        body: { 
          description: coursesData[0].description,
        }, 
      });
      const mockRes = createResponse();

      await courseController.create(mockReq, mockRes);

      expect(spies.create).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('update', () => {
    test('should return course updated', async () => {
      spies.update.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({ 
        params: {
          courseId: coursesData[0].id.toString(),
        },
        body: { 
          name: coursesData[0].cname,
          description: coursesData[0].description,
        }, 
      });
      const mockRes = createResponse();

      await courseController.update(mockReq, mockRes);

      expect(spies.update).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(coursesData[0]));
    });

    test('should return bad request if update fields are not provided', async () => {
      const mockReq = createRequest({ 
        params: {
          courseId: coursesData[0].id.toString(),
        },
        body: { 
        }, 
      });
      const mockRes = createResponse();

      await courseController.update(mockReq, mockRes);

      expect(spies.update).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get', () => {
    test('should return course', async () => {
      spies.remove.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
      });
      const mockRes = createResponse();

      await courseController.remove(mockReq, mockRes);

      expect(spies.remove).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(coursesData[0]));
    });
  });

  describe('getUsers', () => {
    test('should return all users', async () => {
      spies.getUsers.mockResolvedValueOnce(usersData);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
      });
      const mockRes = createResponse();

      await courseController.getUsers(mockReq, mockRes);

      expect(spies.getUsers).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(usersData));
    });
  });

  describe('addUser', () => {
    test('should return added user relation', async () => {
      spies.addUser.mockResolvedValueOnce(usersCourseData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
        body: {
          userId: usersData[0].user_id.toString(),
        },
      });
      const mockRes = createResponse();

      await courseController.addUser(mockReq, mockRes);

      expect(spies.addUser).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(usersCourseData[0]));
    });

    test('should return error if no userId given', async () => {
      spies.addUser.mockResolvedValueOnce(usersCourseData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
        body: {
        },
      });
      const mockRes = createResponse();

      await courseController.addUser(mockReq, mockRes);

      expect(spies.addUser).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('removeUser', () => {
    test('should return removed user relation', async () => {
      spies.removeUser.mockResolvedValueOnce(usersCourseData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
        body: {
          userId: usersData[0].user_id.toString(),
        },
      });
      const mockRes = createResponse();

      await courseController.removeUser(mockReq, mockRes);

      expect(spies.removeUser).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(usersCourseData[0]));
    });

    test('should return error if no userId given', async () => {
      spies.removeUser.mockResolvedValueOnce(usersCourseData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
        body: {
        },
      });
      const mockRes = createResponse();

      await courseController.removeUser(mockReq, mockRes);

      expect(spies.removeUser).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('getProjects', () => {
    test('should return all projects', async () => {
      spies.getProjects.mockResolvedValueOnce(projectsData);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
      });
      const mockRes = createResponse();

      await courseController.getProjects(mockReq, mockRes);

      expect(spies.getProjects).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData));
    });
  });

  describe('addProject', () => {
    test('should return added project', async () => {
      spies.addProject.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
        body: {
          projectId: projectsData[0].id.toString(),
        },
      });
      const mockRes = createResponse();

      await courseController.addProject(mockReq, mockRes);

      expect(spies.addProject).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData[0]));
    });

    test('should return error if no projectId given', async () => {
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
        body: {
        },
      });
      const mockRes = createResponse();

      await courseController.addProject(mockReq, mockRes);

      expect(spies.addProject).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('removeProject', () => {
    test('should return removed project', async () => {
      spies.removeProject.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
        body: {
          projectId: projectsData[0].id.toString(),
        },
      });
      const mockRes = createResponse();

      await courseController.removeProject(mockReq, mockRes);

      expect(spies.removeProject).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData[0]));
    });

    test('should return error if no projectId given', async () => {
      spies.removeProject.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id.toString(),
        },
        body: {
        },
      });
      const mockRes = createResponse();

      await courseController.removeProject(mockReq, mockRes);

      expect(spies.removeProject).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });


  describe('addProjectAndCourse', () => {
    test('should return added course', async () => {
      spies.addProjectAndCourse.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {
        },
        body: {
          courseId: coursesData[0].id.toString(),
          courseName: coursesData[0].cname.toString(),
          projectName: projectsData[0].pname.toString(),
        },
      });
      const mockRes = createResponse();

      await courseController.addProjectAndCourse(mockReq, mockRes);

      expect(spies.addProjectAndCourse).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(projectsData[0]));
    });

    test('should return error if no courseId given', async () => {
      const mockReq = createRequest({
        params: {
        },
        body: {
        },
      });
      const mockRes = createResponse();

      await courseController.addProjectAndCourse(mockReq, mockRes);

      expect(spies.addProjectAndCourse).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

});
