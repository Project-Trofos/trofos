import StatusCodes from 'http-status-codes';
import { User, UsersOnRolesOnCourses } from '@prisma/client';
import { createRequest, createResponse } from 'node-mocks-http';
import course from '../../services/course.service';
import csvService from '../../services/csv.service';
import fs, { unlinkSync } from 'fs';
import settings from '../../services/settings.service';
import courseController from '../../controllers/course';
import coursesData from '../mocks/courseData';
import { settingsData } from '../mocks/settingsData';
import { projectsData } from '../mocks/projectData';
import coursePolicy from '../../policies/constraints/course.constraint';
import projectPolicy from '../../policies/constraints/project.constraint';
import mockBulkCreateBody from '../mocks/bulkCreateProjectBody';
import { BadRequestError } from '../../helpers/error';
import { STUDENT_ROLE_ID } from '../../helpers/constants';

const spies = {
  getAll: jest.spyOn(course, 'getAll'),
  create: jest.spyOn(course, 'create'),
  bulkCreate: jest.spyOn(course, 'bulkCreate'),
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
  archiveCourse: jest.spyOn(course, 'archiveCourse'),
  unarchiveCourse: jest.spyOn(course, 'unarchiveCourse'),
  importProjectAssignments: jest.spyOn(csvService, 'importProjectAssignments'),
  getSettings: jest.spyOn(settings, 'get'),
  unlinkSync: jest.spyOn(fs, 'unlinkSync'),
};

describe('course controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mock data for users
  const usersData: User[] = [
    {
      user_email: 'user@mail.com',
      user_id: 1,
      user_password_hash: 'hash',
      user_display_name: 'User',
      has_completed_tour: true,
    },
  ];

  // Mock data for users on courses
  const usersCourseData: UsersOnRolesOnCourses[] = [{ id: 1, course_id: 1, user_id: 1, role_id: STUDENT_ROLE_ID }];

  const coursePolicyConstraint = coursePolicy.coursePolicyConstraint(1, true);
  const projectPolicyConstraint = projectPolicy.projectPolicyConstraint(1, true);

  const validBody = {
    courseId: coursesData[0].id,
    courseCode: coursesData[0].code,
    courseStartYear: coursesData[0].startYear,
    courseStartSem: coursesData[0].startSem,
    courseEndYear: coursesData[0].endYear,
    courseEndSem: coursesData[0].endSem,
    courseName: coursesData[0].cname,
    description: coursesData[0].description,
  };

  describe('getAll', () => {
    it('should return all courses', async () => {
      spies.getSettings.mockResolvedValue(settingsData);
      spies.getAll.mockResolvedValueOnce({
        data: coursesData,
        totalCount: 6
      });
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockRes.locals.policyConstraint = coursePolicyConstraint;

      await courseController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData().data).toEqual(JSON.stringify(coursesData));
    });

    it('should return all past courses', async () => {
      const pastCourses = coursesData.filter(
        (c) =>
          c.startYear < settingsData.current_year ||
          (c.startYear === settingsData.current_year && c.startSem < settingsData.current_sem),
      );
      spies.getSettings.mockResolvedValue(settingsData);
      spies.getAll.mockResolvedValueOnce({
        data: pastCourses,
        totalCount: 1
      });
      const mockReq = createRequest({
        body: {
          option: 'past',
        },
      });
      const mockRes = createResponse();
      mockRes.locals.policyConstraint = coursePolicyConstraint;

      await courseController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData().data).toEqual(JSON.stringify(pastCourses));
    });

    it('should return all current courses', async () => {
      const currentCourses = coursesData.filter(
        (c) => c.startYear === settingsData.current_year && c.startSem === settingsData.current_sem,
      );
      spies.getSettings.mockResolvedValue(settingsData);
      spies.getAll.mockResolvedValueOnce({
        data: currentCourses,
        totalCount: 2
      });
      const mockReq = createRequest({
        body: {
          option: 'current',
        },
      });
      const mockRes = createResponse();
      mockRes.locals.policyConstraint = coursePolicyConstraint;

      await courseController.getAll(mockReq, mockRes);

      expect(spies.getAll).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData().data).toEqual(JSON.stringify(currentCourses));
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
      spies.getById.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
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
    it('should return course created', async () => {
      spies.create.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        body: validBody,
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await courseController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(coursesData[0]));
    });

    it('should return bad request if user session is not defined', async () => {
      const mockReq = createRequest({
        body: validBody,
      });
      const mockRes = createResponse();

      await courseController.create(mockReq, mockRes);

      expect(spies.create).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return bad request if name is not provided', async () => {
      const mockReq = createRequest({
        body: {
          description: coursesData[0].description,
        },
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await courseController.create(mockReq, mockRes);

      expect(spies.create).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return bad request if start year is after end year', async () => {
      const mockReq = createRequest({
        body: {
          ...validBody,
          courseStartYear: validBody.courseStartYear + 1,
          courseEndYear: validBody.courseStartYear,
          courseEndSem: validBody.courseStartSem,
        },
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await courseController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return bad request if start year is the same as end year but start sem is after end sem', async () => {
      const mockReq = createRequest({
        body: {
          ...validBody,
          courseStartSem: validBody.courseStartSem + 1,
          courseEndYear: validBody.courseStartYear,
          courseEndSem: validBody.courseStartSem,
        },
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await courseController.create(mockReq, mockRes);

      expect(spies.create).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('bulkCreate', () => {
    it('should return course created', async () => {
      spies.bulkCreate.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        body: mockBulkCreateBody,
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await courseController.bulkCreate(mockReq, mockRes);

      expect(spies.bulkCreate).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(coursesData[0]));
    });

    it('should return bad request if id is not provided', async () => {
      spies.bulkCreate.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        body: {
          ...mockBulkCreateBody,
          courseId: undefined,
        },
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await courseController.bulkCreate(mockReq, mockRes);

      expect(spies.bulkCreate).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return bad request if project details is malformed', async () => {
      spies.bulkCreate.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        body: {
          ...mockBulkCreateBody,
          projects: [{ users: [] }],
        },
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await courseController.bulkCreate(mockReq, mockRes);

      expect(spies.bulkCreate).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return bad request user id is malformed', async () => {
      spies.bulkCreate.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        body: {
          ...mockBulkCreateBody,
          projects: [{ projectName: 'p1', users: [{ invalid: 'data' }] }],
        },
      });
      const mockRes = createResponse({ locals: { userSession: { userId: 1 } } });

      await courseController.bulkCreate(mockReq, mockRes);

      expect(spies.bulkCreate).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('update', () => {
    it('should return course updated', async () => {
      spies.update.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
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
        },
        body: {},
      });
      const mockRes = createResponse();

      await courseController.update(mockReq, mockRes);

      expect(spies.update).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return bad request if start year is after end year', async () => {
      spies.update.mockImplementation(async () => {
        throw new BadRequestError('');
      });
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
        },
        body: {
          courseStartYear: coursesData[0].startYear + 1,
          courseEndYear: coursesData[0].startYear,
        },
      });
      const mockRes = createResponse();

      await courseController.update(mockReq, mockRes);

      expect(spies.update).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return bad request if start year is same as end year but start sem is after end sem', async () => {
      spies.update.mockImplementation(async () => {
        throw new BadRequestError('');
      });
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
        },
        body: {
          courseStartYear: coursesData[0].startYear,
          courseStartSem: coursesData[0].startSem + 1,
          courseEndYear: coursesData[0].startYear,
          courseEndSem: coursesData[0].startSem,
        },
      });
      const mockRes = createResponse();

      await courseController.update(mockReq, mockRes);

      expect(spies.update).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('get', () => {
    it('should return course', async () => {
      spies.remove.mockResolvedValueOnce(coursesData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
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
        },
      });
      const mockRes = createResponse();
      mockRes.locals.policyConstraint = coursePolicyConstraint;

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
        },
        body: {
          userEmail: usersData[0].user_email,
        },
      });
      const mockRes = createResponse();

      await courseController.addUser(mockReq, mockRes);

      expect(spies.addUser).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(usersCourseData[0]));
    });

    it('should return error if no userEmail given', async () => {
      spies.addUser.mockResolvedValueOnce(usersCourseData[0]);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[0].id,
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
        },
      });
      const mockRes = createResponse();
      mockRes.locals.policyConstraint = projectPolicyConstraint;

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
          courseName: coursesData[0].cname.toString(),
          courseCode: coursesData[0].code,
          courseYear: coursesData[0].startYear,
          courseSem: coursesData[0].startSem,
          projectName: projectsData[0].pname.toString(),
        },
      });
      const mockRes = createResponse();
      mockRes.locals.userSession = {
        user_id: 1,
      };

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
      mockRes.locals.userSession = {
        user_id: 1,
      };

      await courseController.addProjectAndCourse(mockReq, mockRes);

      expect(spies.addProjectAndCourse).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('archiveCourse', () => {
    it('should return archived course', async () => {
      const INDEX = 0;
      const archivedCourse = { ...coursesData[INDEX], is_archive: true };
      spies.archiveCourse.mockResolvedValueOnce(archivedCourse);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[INDEX].id,
        },
      });
      const mockRes = createResponse();

      await courseController.archiveCourse(mockReq, mockRes);

      expect(spies.archiveCourse).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(archivedCourse));
    });

    it('should return error if no courseId given', async () => {
      const mockReq = createRequest({
        params: {},
        body: {},
      });
      const mockRes = createResponse();

      await courseController.archiveCourse(mockReq, mockRes);

      expect(spies.archiveCourse).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('unarchiveCourse', () => {
    it('should return unarchived course', async () => {
      const INDEX = 0;
      const unarchivedCourse = { ...coursesData[INDEX], is_archive: false };
      spies.unarchiveCourse.mockResolvedValueOnce(unarchivedCourse);
      const mockReq = createRequest({
        params: {
          courseId: coursesData[INDEX].id,
        },
      });
      const mockRes = createResponse();

      await courseController.unarchiveCourse(mockReq, mockRes);

      expect(spies.unarchiveCourse).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(unarchivedCourse));
    });

    it('should return error if no courseId given', async () => {
      const mockReq = createRequest({
        params: {},
        body: {},
      });
      const mockRes = createResponse();

      await courseController.unarchiveCourse(mockReq, mockRes);

      expect(spies.unarchiveCourse).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('importProjectAssignments', () => {
    const mockCsvFile = {
      fieldname: 'file',
      originalname: 'test.csv',
      encoding: '7bit',
      mimetype: 'text/csv',
      path: '/tmp/test.csv',
      size: 1024,
    };

    it('should return 200 and call csvService when valid CSV file and courseId are provided', async () => {
      const courseId = '1';

      spies.importProjectAssignments.mockResolvedValueOnce(undefined);
      spies.unlinkSync.mockImplementationOnce(() => {});

      const mockReq = createRequest({
        params: {
          courseId,
        },
        file: mockCsvFile,
      });
      const mockRes = createResponse();

      await courseController.importProjectAssignments(mockReq, mockRes);

      expect(spies.importProjectAssignments).toHaveBeenCalledWith(mockCsvFile.path, Number(courseId));
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(spies.unlinkSync).toHaveBeenCalledWith(mockCsvFile.path);
    });

    it('should return 400 when no file is provided', async () => {
      const courseId = '1';

      const mockReq = createRequest({
        params: {
          courseId,
        },
        file: null,
      });
      const mockRes = createResponse();

      await courseController.importProjectAssignments(mockReq, mockRes);

      expect(spies.importProjectAssignments).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(spies.unlinkSync).not.toHaveBeenCalled();
    });

    it('should return 400 when file type is incorrect', async () => {
      const courseId = '1';
      spies.unlinkSync.mockImplementationOnce(() => {});

      const mockReq = createRequest({
        params: {
          courseId,
        },
        file: {
          ...mockCsvFile,
          mimetype: 'text/plain',
        },
      });
      const mockRes = createResponse();

      await courseController.importProjectAssignments(mockReq, mockRes);

      expect(spies.importProjectAssignments).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(spies.unlinkSync).toHaveBeenCalledWith(mockCsvFile.path);
    });

    it('should return 400 when courseId is invalid', async () => {
      const courseId = 'invalid';
      spies.unlinkSync.mockImplementationOnce(() => {});

      const mockReq = createRequest({
        params: {
          courseId,
        },
        file: mockCsvFile,
      });
      const mockRes = createResponse();

      await courseController.importProjectAssignments(mockReq, mockRes);

      expect(spies.importProjectAssignments).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(spies.unlinkSync).toHaveBeenCalledWith(mockCsvFile.path);
    });

    it('should return 500 when csvService fails', async () => {
      const courseId = '1';
      spies.unlinkSync.mockImplementationOnce(() => {});

      const mockReq = createRequest({
        params: {
          courseId,
        },
        file: mockCsvFile,
      });
      const mockRes = createResponse();

      spies.importProjectAssignments.mockRejectedValueOnce(new Error('Failed to import project assignments'));

      await courseController.importProjectAssignments(mockReq, mockRes);

      expect(spies.importProjectAssignments).toHaveBeenCalledWith(mockCsvFile.path, Number(courseId));
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(spies.unlinkSync).toHaveBeenCalledWith(mockCsvFile.path);
    });
  });
});
