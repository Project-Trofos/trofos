import { Course, Project, User, UsersOnCourses } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import course from '../../services/course.service';

describe('course.service tests', () => {

  // Mock data for courses
  const coursesData: Course[] = [
    { id: 1, cname: 'c1', created_at: new Date(Date.now()), description: 'd1', public: false },
    { id: 2, cname: 'c2', created_at: new Date(Date.now()), description: 'd2', public: true },
    { id: 3, cname: 'c3', created_at: new Date(Date.now()), description: 'd3', public: false },
  ];

  // Mock data for projects
  const projectData: Project[] = [
    {      
      id: 1,
      pname: 'project name',
      description: null,
      pkey: null,
      public: false,
      course_id: 1,
      created_at: new Date(Date.now()),
    },
  ];

  // Mock data for users
  const userData: User[] = [
    { user_email: 'user@mail.com', user_id: 1, user_password_hash: 'hash' },
  ];


  describe('getAll', () => {
    it('should return all courses', async () => {
      prismaMock.course.findMany.mockResolvedValueOnce(coursesData);
      
      const result = await course.getAll();
      expect(result).toEqual<Course[]>(coursesData);
    });
  });

  describe('getById', () => {
    it('should return correct course with the same id', async () => {
      const index = 0;
      const { id } = coursesData[index];
      prismaMock.course.findUniqueOrThrow.mockResolvedValueOnce(coursesData.filter(c => c.id === id)[0]);
      
      const result = await course.getById(id);
      expect(result).toEqual<Course>(coursesData[index]);
    });

    it('should throw if course with the same id does not exist', async () => {
      const invalidId = 999;
      prismaMock.course.findUniqueOrThrow.mockRejectedValue(Error());
      
      await expect(course.getById(invalidId)).rejects.toThrow(Error);
    });
  });

  describe('create', () => {
    it('should return created course', async () => {
      const INDEX = 0;
      const newCourse = coursesData[INDEX];
      prismaMock.course.create.mockResolvedValueOnce(newCourse);
      
      const result = await course.create(   
        newCourse.cname, 
        newCourse.public, 
        newCourse.description ?? undefined,
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
      
      const result = await course.remove(   
        deletedCourse.id,
      );
      expect(result).toEqual<Course>(coursesData[INDEX]);
    });
  });

  describe('getUser', () => {
    it('should return users in a course', async () => {
      const COURSE_ID = 1;
      // TODO: get the type right
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      prismaMock.usersOnCourses.findMany.mockResolvedValueOnce(userData.map(x => ({ user: x })));
      
      const result = await course.getUsers(COURSE_ID);
      expect(result).toEqual<User[]>(userData);
    });
  });

  describe('addUser', () => {
    it('should return added user', async () => {
      const COURSE_ID = 1;
      const USER_ID = 1;
      const resultMock: UsersOnCourses = {
        course_id: COURSE_ID,
        user_id: USER_ID,
        created_at: new Date(Date.now()),
      }; 
      prismaMock.usersOnCourses.create.mockResolvedValueOnce(resultMock);

      const result = await course.addUser(COURSE_ID, USER_ID);
      expect(result).toEqual<UsersOnCourses>(resultMock);
    });
  });

  describe('removeUser', () => {
    it('should return removed user', async () => {
      const COURSE_ID = 1;
      const USER_ID = 1;
      const resultMock: UsersOnCourses = {
        course_id: COURSE_ID,
        user_id: USER_ID,
        created_at: new Date(Date.now()),
      }; 
      prismaMock.usersOnCourses.delete.mockResolvedValueOnce(resultMock);

      const result = await course.removeUser(COURSE_ID, USER_ID);
      expect(result).toEqual<UsersOnCourses>(resultMock);
    });
  });

  describe('getProjects', () => {
    it('should return all projects', async () => {
      prismaMock.project.findMany.mockResolvedValueOnce(projectData);

      const result = await course.getProjects(projectData[0].course_id ?? 1);
      expect(result).toEqual<Project[]>(projectData);
    });
  });

  describe('addProject', () => {
    it('should return added project', async () => {
      const resultMock: Project = projectData[0];
      prismaMock.project.update.mockResolvedValueOnce(resultMock);

      const result = await course.addProject(resultMock.course_id ?? 1, resultMock.id);
      expect(result).toEqual<Project>(resultMock);
    });
  });

  describe('removeProject', () => {
    it('should return removed project', async () => {
      const resultMock: Project = projectData[0];
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(resultMock);
      prismaMock.project.update.mockResolvedValueOnce(resultMock);

      const result = await course.removeProject(resultMock.course_id ?? 1, resultMock.id);
      expect(result).toEqual<Project>(resultMock);
    });

    it('should throw error if courseId does not match', async () => {
      const INVALID_ID = 999;
      const resultMock: Project = projectData[0];
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(resultMock);
      expect(course.removeProject(INVALID_ID, resultMock.id)).rejects.toThrow();
    });
  });

});