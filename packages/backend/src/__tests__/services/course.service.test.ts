import { Course, Project, User, UsersOnCourses } from '@prisma/client';
import { CURRENT_SEM, CURRENT_YEAR } from '../../helpers/currentTime';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import course from '../../services/course.service';
import coursesData from '../mocks/courseData';

describe('course.service tests', () => {
  // Mock data for projects
  const projectData: Project[] = [
    {
      id: 1,
      pname: 'project name',
      description: null,
      pkey: null,
      public: false,
      course_id: '1',
      course_year: 2022,
      course_sem: 1,
      created_at: new Date(Date.now()),
      backlog_counter: 0,
    },
  ];

  // Mock data for users
  const userData: User[] = [{ user_email: 'user@mail.com', user_id: 1, user_password_hash: 'hash' }];

  describe('getAll', () => {
    it('should return all courses', async () => {
      prismaMock.course.findMany.mockResolvedValueOnce(coursesData);

      const result = await course.getAll();
      expect(result).toEqual<Course[]>(coursesData);
    });

    it('should return past courses', async () => {
      const pastCourses = coursesData.filter(
        (p) => p.year < CURRENT_SEM || (p.year === CURRENT_YEAR && p.sem < CURRENT_SEM),
      );
      prismaMock.course.findMany.mockResolvedValueOnce(pastCourses);

      const result = await course.getAll('past');
      expect(result).toEqual<Course[]>(pastCourses);
    });

    it('should return current projects', async () => {
      const currentCourses = coursesData.filter((c) => c.sem === CURRENT_SEM && c.year === CURRENT_YEAR);
      prismaMock.course.findMany.mockResolvedValueOnce(currentCourses);

      const result = await course.getAll('current');
      expect(result).toEqual<Course[]>(currentCourses);
    });
  });

  describe('getById', () => {
    it('should return correct course with the same id', async () => {
      const index = 0;
      const { id, year, sem } = coursesData[index];
      prismaMock.course.findUniqueOrThrow.mockResolvedValueOnce(coursesData.filter((c) => c.id === id)[0]);

      const result = await course.getByPk(id, year, sem);
      expect(result).toEqual<Course>(coursesData[index]);
    });

    it('should throw if course with the same id, year, or sem does not exist', async () => {
      const invalidId = '999';
      prismaMock.course.findUniqueOrThrow.mockRejectedValue(Error());

      await expect(course.getByPk(invalidId, 2022, 1)).rejects.toThrow(Error);
    });
  });

  describe('create', () => {
    it('should return created course', async () => {
      const INDEX = 0;
      const newCourse = coursesData[INDEX];
      prismaMock.course.create.mockResolvedValueOnce(newCourse);

      const result = await course.create(
        newCourse.cname,
        newCourse.year,
        newCourse.sem,
        newCourse.description ?? undefined,
        newCourse.public,
      );
      expect(result).toEqual<Course>(coursesData[INDEX]);
    });
  });

  describe('update', () => {
    it('should return updated course', async () => {
      const INDEX = 0;
      const updatedCourse = coursesData[INDEX];
      prismaMock.course.update.mockResolvedValueOnce(updatedCourse);

      const result = await course.update(
        updatedCourse.id,
        updatedCourse.year,
        updatedCourse.sem,
        updatedCourse.cname,
        updatedCourse.public,
        updatedCourse.description ?? undefined,
      );
      expect(result).toEqual<Course>(coursesData[INDEX]);
    });
  });

  describe('remove', () => {
    it('should return removed course', async () => {
      const INDEX = 0;
      const deletedCourse = coursesData[INDEX];
      prismaMock.course.delete.mockResolvedValueOnce(deletedCourse);

      const result = await course.remove(deletedCourse.id, deletedCourse.year, deletedCourse.sem);
      expect(result).toEqual<Course>(coursesData[INDEX]);
    });
  });

  describe('getUser', () => {
    it('should return users in a course', async () => {
      const INDEX = 0;
      const targetCourse = coursesData[INDEX];
      // TODO: get the type right
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      prismaMock.usersOnCourses.findMany.mockResolvedValueOnce(userData.map((x) => ({ user: x })));

      const result = await course.getUsers(targetCourse.id, targetCourse.year, targetCourse.sem);
      expect(result).toEqual<User[]>(userData);
    });
  });

  describe('addUser', () => {
    it('should return added user', async () => {
      const INDEX = 0;
      const targetCourse = coursesData[INDEX];
      const USER_ID = 1;
      const resultMock: UsersOnCourses = {
        course_id: targetCourse.id,
        course_year: targetCourse.year,
        course_sem: targetCourse.sem,
        user_id: USER_ID,
        created_at: new Date(Date.now()),
      };
      prismaMock.usersOnCourses.create.mockResolvedValueOnce(resultMock);

      const result = await course.addUser(targetCourse.id, targetCourse.year, targetCourse.sem, USER_ID);
      expect(result).toEqual<UsersOnCourses>(resultMock);
    });
  });

  describe('removeUser', () => {
    it('should return removed user', async () => {
      const INDEX = 0;
      const targetCourse = coursesData[INDEX];
      const USER_ID = 1;
      const resultMock: UsersOnCourses = {
        course_id: targetCourse.id,
        course_year: targetCourse.year,
        course_sem: targetCourse.sem,
        user_id: USER_ID,
        created_at: new Date(Date.now()),
      };
      prismaMock.usersOnCourses.delete.mockResolvedValueOnce(resultMock);

      const result = await course.removeUser(targetCourse.id, targetCourse.year, targetCourse.sem, USER_ID);
      expect(result).toEqual<UsersOnCourses>(resultMock);
    });
  });

  describe('getProjects', () => {
    it('should return all projects', async () => {
      prismaMock.project.findMany.mockResolvedValueOnce(projectData);

      const result = await course.getProjects(projectData[0].course_id ?? '1');
      expect(result).toEqual<Project[]>(projectData);
    });
  });

  describe('addProject', () => {
    it('should return added project', async () => {
      const resultMock: Project = projectData[0];
      prismaMock.project.update.mockResolvedValueOnce(resultMock);

      if (!resultMock.course_id || !resultMock.course_year || !resultMock.course_sem) {
        throw Error('Result mock is not valid!');
      }

      const result = await course.addProject(
        resultMock.course_id,
        resultMock.course_year,
        resultMock.course_sem,
        resultMock.id,
      );
      expect(result).toEqual<Project>(resultMock);
    });
  });

  describe('removeProject', () => {
    it('should return removed project', async () => {
      const resultMock: Project = projectData[0];
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(resultMock);
      prismaMock.project.update.mockResolvedValueOnce(resultMock);

      if (!resultMock.course_id || !resultMock.course_year || !resultMock.course_sem) {
        throw Error('Result mock is not valid!');
      }

      const result = await course.removeProject(
        resultMock.course_id,
        resultMock.course_year,
        resultMock.course_sem,
        resultMock.id,
      );

      expect(result).toEqual<Project>(resultMock);
    });

    it('should throw error if courseId does not match', async () => {
      const INVALID_ID = '999';
      const resultMock: Project = projectData[0];
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(resultMock);
      expect(course.removeProject(INVALID_ID, 2022, 1, resultMock.id)).rejects.toThrow();
    });
  });

  describe('addProjectAndCourse', () => {
    it('should return created project', async () => {
      const resultMock: Project = projectData[0];
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(resultMock);
      prismaMock.project.update.mockResolvedValueOnce(resultMock);

      if (!resultMock.course_id || !resultMock.course_year || !resultMock.course_sem) {
        throw Error('Result mock is not valid!');
      }

      const result = await course.removeProject(
        resultMock.course_id,
        resultMock.course_year,
        resultMock.course_sem,
        resultMock.id,
      );
      expect(result).toEqual<Project>(resultMock);
    });
  });
});
