import { Course, Project, User, UsersOnRolesOnCourses } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import course from '../../services/course.service';
import coursesData from '../mocks/courseData';
import { settingsData } from '../mocks/settingsData';
import coursePolicy from '../../policies/constraints/course.constraint';
import projectPolicy from '../../policies/constraints/project.constraint';
import mockBulkCreateBody from '../mocks/bulkCreateProjectBody';
import { BadRequestError } from '../../helpers/error';
import { userData } from '../mocks/userData';
import { STUDENT_ROLE_ID } from '../../helpers/constants';

describe('course.service tests', () => {
  // Mock data for projects
  const projectData: Project[] = [
    {
      id: 1,
      pname: 'project name',
      description: null,
      pkey: 'key',
      public: false,
      course_id: 1,
      created_at: new Date(Date.now()),
      backlog_counter: 0,
    },
  ];

  const coursePolicyConstraint = coursePolicy.coursePolicyConstraint(1, true);
  const projectPolicyConstraint = projectPolicy.projectPolicyConstraint(1, true);

  describe('getAll', () => {
    it('should return all courses', async () => {
      prismaMock.course.findMany.mockResolvedValueOnce(coursesData);

      const result = await course.getAll(coursePolicyConstraint, settingsData, 'all');
      expect(result).toEqual<Course[]>(coursesData);
    });

    it('should return past courses', async () => {
      const pastCourses = coursesData.filter(
        (p) =>
          p.startYear < settingsData.current_year ||
          (p.startYear === settingsData.current_year && p.startSem < settingsData.current_sem),
      );
      prismaMock.course.findMany.mockResolvedValueOnce(pastCourses);

      const result = await course.getAll(coursePolicyConstraint, settingsData, 'past');
      expect(result).toEqual<Course[]>(pastCourses);
    });

    it('should return current courses', async () => {
      const currentCourses = coursesData.filter(
        (c) => c.startSem === settingsData.current_sem && c.startYear === settingsData.current_year,
      );
      prismaMock.course.findMany.mockResolvedValueOnce(currentCourses);

      const result = await course.getAll(coursePolicyConstraint, settingsData, 'current');
      expect(result).toEqual<Course[]>(currentCourses);
    });

    it('should return future courses', async () => {
      const futureCourses = coursesData.filter(
        (p) =>
          p.startYear > settingsData.current_year ||
          (p.startYear === settingsData.current_year && p.startSem > settingsData.current_sem),
      );
      prismaMock.course.findMany.mockResolvedValueOnce(futureCourses);

      const result = await course.getAll(coursePolicyConstraint, settingsData, 'future');
      expect(result).toEqual<Course[]>(futureCourses);
    });
  });

  describe('getById', () => {
    it('should return correct course with the same id', async () => {
      const index = 0;
      const { id } = coursesData[index];
      prismaMock.course.findUniqueOrThrow.mockResolvedValueOnce(coursesData.filter((c) => c.id === id)[0]);

      const result = await course.getById(id);
      expect(result).toEqual<Course>(coursesData[index]);
    });

    it('should throw if course with the same id, year, or sem does not exist', async () => {
      const invalidId = 999;
      prismaMock.course.findUniqueOrThrow.mockRejectedValue(Error());

      await expect(course.getById(invalidId)).rejects.toThrow(Error);
    });
  });

  describe('create', () => {
    it('should return created course', async () => {
      const INDEX = 0;
      const newCourse = coursesData[INDEX];
      prismaMock.user.findFirstOrThrow.mockResolvedValueOnce(userData[INDEX]);
      prismaMock.course.create.mockResolvedValueOnce(newCourse);
      prismaMock.$transaction.mockResolvedValueOnce(coursesData[INDEX]);

      const result = await course.create(
        1,
        newCourse.cname,
        newCourse.startYear,
        newCourse.startSem,
        newCourse.endYear,
        newCourse.endSem,
        newCourse.code,
        newCourse.public,
        newCourse.description ?? undefined,
      );
      expect(result).toEqual<Course>(coursesData[INDEX]);
    });

    it('should throw error if start year is after end year', async () => {
      const INDEX = 0;
      const newCourse = coursesData[INDEX];
      prismaMock.course.create.mockResolvedValueOnce(newCourse);

      const result = course.create(
        1,
        newCourse.cname,
        newCourse.startYear + 1,
        newCourse.startSem,
        newCourse.startYear,
        newCourse.startSem,
        newCourse.code,
        newCourse.public,
        newCourse.description ?? undefined,
      );
      expect(result).rejects.toThrowError(BadRequestError);
    });

    it('should throw error if start year is the same as end year but start sem is after end sem', async () => {
      const INDEX = 0;
      const newCourse = coursesData[INDEX];
      prismaMock.course.create.mockResolvedValueOnce(newCourse);

      const result = course.create(
        1,
        newCourse.cname,
        newCourse.startYear,
        newCourse.startSem + 1,
        newCourse.startYear,
        newCourse.startSem,
        newCourse.code,
        newCourse.public,
        newCourse.description ?? undefined,
      );
      expect(result).rejects.toThrowError(BadRequestError);
    });
  });

  describe('bulkCreate', () => {
    it('should return created course if course exists', async () => {
      const mockCourse = coursesData[0];
      const mockProject = projectData[0];
      prismaMock.course.findFirst.mockResolvedValueOnce(mockCourse);
      prismaMock.project.create.mockResolvedValueOnce(mockProject);

      const result = await course.bulkCreate(mockBulkCreateBody);
      expect(result).toEqual<Course>(mockCourse);
    });

    it('should throw error if course does not exist', async () => {
      const mockCourse = coursesData[0];
      const mockProject = projectData[0];
      prismaMock.course.findFirst.mockResolvedValueOnce(null);
      prismaMock.$transaction.mockResolvedValueOnce([mockCourse, mockProject]);

      const result = course.bulkCreate(mockBulkCreateBody);
      expect(result).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should return updated course', async () => {
      const INDEX = 0;
      const updatedCourse = coursesData[INDEX];
      prismaMock.course.update.mockResolvedValueOnce(updatedCourse);

      const result = await course.update(
        updatedCourse.id,
        updatedCourse.code,
        updatedCourse.startYear,
        updatedCourse.startSem,
        updatedCourse.endYear,
        updatedCourse.endSem,
        updatedCourse.cname,
        updatedCourse.public,
        updatedCourse.description ?? undefined,
      );
      expect(result).toEqual<Course>(coursesData[INDEX]);
    });

    it('should throw error if start year is after end year', async () => {
      const INDEX = 0;
      const newCourse = coursesData[INDEX];
      prismaMock.course.create.mockResolvedValueOnce(newCourse);

      const result = course.update(
        1,
        newCourse.code,
        newCourse.startYear + 1,
        newCourse.startSem,
        newCourse.startYear,
        newCourse.startSem,
        newCourse.cname,
        newCourse.public,
        newCourse.description ?? undefined,
      );
      expect(result).rejects.toThrowError(BadRequestError);
    });

    it('should throw error if start year is the same as end year but start sem is after end sem', async () => {
      const INDEX = 0;
      const newCourse = coursesData[INDEX];
      prismaMock.course.create.mockResolvedValueOnce(newCourse);

      const result = course.update(
        1,
        newCourse.code,
        newCourse.startYear,
        newCourse.startSem + 1,
        newCourse.startYear,
        newCourse.startSem,
        newCourse.cname,
        newCourse.public,
        newCourse.description ?? undefined,
      );
      expect(result).rejects.toThrowError(BadRequestError);
    });
  });

  describe('remove', () => {
    it('should return removed course', async () => {
      const INDEX = 0;
      const deletedCourse = coursesData[INDEX];
      prismaMock.course.delete.mockResolvedValueOnce(deletedCourse);

      const result = await course.remove(deletedCourse.id);
      expect(result).toEqual<Course>(coursesData[INDEX]);
    });
  });

  describe('getUser', () => {
    it('should return users in a course', async () => {
      const INDEX = 0;
      const targetCourse = coursesData[INDEX];
      prismaMock.usersOnRolesOnCourses.findMany.mockResolvedValueOnce(
        userData.map((x) => ({
          id : 1,
          user : x,
          course_id: targetCourse.id,
          user_id: x.user_id,
          role_id : 1
        })),
      );

      const result = await course.getUsers(targetCourse.id);
      expect(result).toEqual<User[]>(userData);
    });
  });

  describe('addUser', () => {
    it('should return added user', async () => {
      const INDEX = 0;
      const targetCourse = coursesData[INDEX];
      const usersOnRolesOnCoursesMock: UsersOnRolesOnCourses = {
        id: 1,
        course_id: targetCourse.id,
        user_id: userData[INDEX].user_id,
        role_id: STUDENT_ROLE_ID
      };

      prismaMock.user.findFirstOrThrow.mockResolvedValueOnce(userData[INDEX]);
      prismaMock.usersOnRolesOnCourses.create.mockResolvedValueOnce(usersOnRolesOnCoursesMock);
      prismaMock.$transaction.mockResolvedValueOnce(usersOnRolesOnCoursesMock);

      const result = await course.addUser(targetCourse.id, userData[INDEX].user_email);
      expect(result).toEqual<UsersOnRolesOnCourses>(usersOnRolesOnCoursesMock);
    });
  });

  describe('removeUser', () => {
    it('should return removed user', async () => {
      const INDEX = 0;
      const targetCourse = coursesData[INDEX];
      const USER_ID = 1;
      const resultMock: UsersOnRolesOnCourses = {
        id: 1,
        course_id: targetCourse.id,
        user_id: USER_ID,
        role_id: STUDENT_ROLE_ID
      };

      prismaMock.usersOnRolesOnCourses.delete.mockResolvedValueOnce(resultMock);

      const result = await course.removeUser(targetCourse.id, USER_ID);
      expect(result).toEqual<UsersOnRolesOnCourses>(resultMock);
    });
  });

  describe('getProjects', () => {
    it('should return all projects', async () => {
      prismaMock.project.findMany.mockResolvedValueOnce(projectData);

      const result = await course.getProjects(projectPolicyConstraint, projectData[0].course_id ?? 1);
      expect(result).toEqual<Project[]>(projectData);
    });
  });

  describe('addProject', () => {
    it('should return added project', async () => {
      const resultMock: Project = projectData[0];
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce(resultMock);
      prismaMock.project.update.mockResolvedValueOnce(resultMock);
      prismaMock.user.findMany.mockResolvedValueOnce(userData);
      prismaMock.$transaction.mockResolvedValueOnce(resultMock);

      if (!resultMock.course_id) {
        throw Error('Result mock is not valid!');
      }

      const result = await course.addProject(resultMock.course_id, resultMock.id);
      expect(result).toEqual<Project>(resultMock);
    });
  });

  describe('removeProject', () => {
    it('should return removed project', async () => {
      const resultMock: Project = projectData[0];

      prismaMock.user.findMany.mockResolvedValueOnce(userData);
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(resultMock);
      prismaMock.project.update.mockResolvedValueOnce(resultMock);
      prismaMock.$transaction.mockResolvedValueOnce(resultMock);

      if (!resultMock.course_id) {
        throw Error('Result mock is not valid!');
      }

      const result = await course.removeProject(resultMock.course_id, resultMock.id);

      expect(result).toEqual<Project>(resultMock);
    });

    it('should throw error if courseId does not match', async () => {
      const INVALID_ID = 999;
      const resultMock: Project = projectData[0];
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(resultMock);
      prismaMock.$transaction.mockRejectedValueOnce(new Error('test'));
      expect(course.removeProject(INVALID_ID, 2022)).rejects.toThrow();
    });
  });

  describe('addProjectAndCourse', () => {
    it('should return created project', async () => {
      const resultMock: Project = projectData[0];
      prismaMock.project.create.mockResolvedValueOnce(resultMock);

      if (!resultMock.course_id) {
        throw Error('Result mock is not valid!');
      }

      const result = await course.addProjectAndCourse(1, '1', 2022, 1, 'c1', projectData[0].pname);
      expect(result).toEqual<Project>(resultMock);
    });
  });
});
