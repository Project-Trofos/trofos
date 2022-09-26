import StatusCodes from 'http-status-codes';
import { User, UsersOnCourses } from '@prisma/client';
import { createRequest, createResponse } from 'node-mocks-http';
import course from '../../services/course.service';
import courseController from '../../controllers/course';
import coursesData from '../mocks/courseData';
import projectsData from '../mocks/projectData';
import { CURRENT_SEM, CURRENT_YEAR } from '../../helpers/currentTime';

const spies = {
  getAll: jest.spyOn(course, 'getAll'),
  create: jest.spyOn(course, 'create'),
  getByPk: jest.spyOn(course, 'getByPk'),
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
  const usersData: User[] = [{ user_email: 'user@mail.com', user_id: 1, user_password_hash: 'hash' }];

  // Mock data for users on courses
  const usersCourseData: UsersOnCourses[] = [
    { course_id: '1', course_year: 2022, course_sem: 1, user_id: 1, created_at: new Date(Date.now()) },
  ];

  describe('getAll', () => {
    it('should return all courses', async () => {
      spies.getAll.mockResolvedValueOnce(coursesData);
      const mockReq = createRequest();
      const mockRes = createResponse();

      await courseController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(coursesData));
    });

    it('should return all past courses', async () => {
      const pastCourses = coursesData.filter(
        (c) => c.year < CURRENT_YEAR || (c.year === CURRENT_YEAR && c.sem < CURRENT_SEM),
      );
      spies.getAll.mockResolvedValueOnce(pastCourses);
      const mockReq = createRequest({
        body: {
          option: 'past',
        },
      });
      const mockRes = createResponse();

      await courseController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(pastCourses));
    });

    it('should return all current courses', async () => {
      const currentCourses = coursesData.filter((c) => c.year === CURRENT_YEAR && c.sem === CURRENT_SEM);
      spies.getAll.mockResolvedValueOnce(currentCourses);
      const mockReq = createRequest({
        body: {
          option: 'current',
        },
      });
      const mockRes = createResponse();

      await courseController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(currentCourses));
    });

    it('should throw if option is incorrect', async () => {
      const mockReq = createRequest({
        body: {
          option: 'some option',
        },
      });
      const mockRes = createResponse();

      await courseController.getAll(mockReq, mockRes);

      expect(spies.getAll).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get', () => {
    it('should return course', async () => {
      spies.getByPk.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
        },
      });
      const mockRes = createResponse();

      await courseController.get(mockReq, mockRes);

      expect(spies.getByPk).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(coursesData[0]));
    });
  });

  describe('create', () => {
    it('should return course created', async () => {
      spies.create.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        body: {
          id: coursesData[0].id,
          year: coursesData[0].year.toString(),
          sem: coursesData[0].sem.toString(),
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

    it('should return bad request if name is not provided', async () => {
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
    it('should return course updated', async () => {
      spies.update.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
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

    it('should return bad request if update fields are not provided', async () => {
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
        },
        body: {},
      });
      const mockRes = createResponse();

      await courseController.update(mockReq, mockRes);

      expect(spies.update).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get', () => {
    it('should return course', async () => {
      spies.remove.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
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
    it('should return all users', async () => {
      spies.getUsers.mockResolvedValueOnce(usersData);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
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
    it('should return added user relation', async () => {
      spies.addUser.mockResolvedValueOnce(usersCourseData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
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

    it('should return error if no userId given', async () => {
      spies.addUser.mockResolvedValueOnce(usersCourseData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
        },
        body: {},
      });
      const mockRes = createResponse();

      await courseController.addUser(mockReq, mockRes);

      expect(spies.addUser).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('removeUser', () => {
    it('should return removed user relation', async () => {
      spies.removeUser.mockResolvedValueOnce(usersCourseData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
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

    it('should return error if no userId given', async () => {
      spies.removeUser.mockResolvedValueOnce(usersCourseData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
        },
        body: {},
      });
      const mockRes = createResponse();

      await courseController.removeUser(mockReq, mockRes);

      expect(spies.removeUser).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('getProjects', () => {
    it('should return all projects', async () => {
      spies.getProjects.mockResolvedValueOnce(projectsData);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
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
    it('should return added project', async () => {
      spies.addProject.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
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

    it('should return error if no projectId given', async () => {
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
        },
        body: {},
      });
      const mockRes = createResponse();

      await courseController.addProject(mockReq, mockRes);

      expect(spies.addProject).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('removeProject', () => {
    it('should return removed project', async () => {
      spies.removeProject.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
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

    it('should return error if no projectId given', async () => {
      spies.removeProject.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
        },
        body: {},
      });
      const mockRes = createResponse();

      await courseController.removeProject(mockReq, mockRes);

      expect(spies.removeProject).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('addProjectAndCourse', () => {
    it('should return added course', async () => {
      spies.addProjectAndCourse.mockResolvedValueOnce(projectsData[0]);
      const mockReq = createRequest({
        params: {},
        body: {
          courseId: coursesData[0].id,
          courseYear: coursesData[0].year.toString(),
          courseSem: coursesData[0].sem.toString(),
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

    it('should return error if no courseId given', async () => {
      const mockReq = createRequest({
        params: {},
        body: {},
      });
      const mockRes = createResponse();

      await courseController.addProjectAndCourse(mockReq, mockRes);

      expect(spies.addProjectAndCourse).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });
});
