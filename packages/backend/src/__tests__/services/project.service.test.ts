import { Project, User, UsersOnProjects } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import project from '../../services/project.service';

describe('project.service tests', () => {

  // Mock data for projects
  const projectsData: Project[] = [
    { id: 1, pname: 'c1', created_at: new Date(Date.now()), course_id: null, pkey: null, description: 'd1', public: false },
    { id: 2, pname: 'c2', created_at: new Date(Date.now()), course_id: null, pkey: null, description: 'd2', public: false },
    { id: 3, pname: 'c3', created_at: new Date(Date.now()), course_id: null, pkey: null, description: 'd3', public: false },
  ];

  // Mock data for users
  const userData: User[] = [
    { user_email: 'user@mail.com', user_id: 1, user_password_hash: 'hash' },
  ];

  describe('getAll', () => {
    it('should return all projects', async () => {
      prismaMock.project.findMany.mockResolvedValueOnce(projectsData);
      
      const result = await project.getAll();
      expect(result).toEqual<Project[]>(projectsData);
    });
  });

  describe('getById', () => {
    it('should return correct project with the same id', async () => {
      const index = 0;
      const { id } = projectsData[index];
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce(projectsData.filter(c => c.id === id)[0]);
      
      const result = await project.getById(id);
      expect(result).toEqual<Project>(projectsData[index]);
    });

    it('should throw if project with the same id does not exist', async () => {
      const invalidId = 999;
      prismaMock.project.findUniqueOrThrow.mockRejectedValue(Error());
      
      await expect(project.getById(invalidId)).rejects.toThrow(Error);
    });
  });

  describe('create', () => {
    it('should return created project', async () => {
      const INDEX = 0;
      const newProject = projectsData[INDEX];
      prismaMock.project.create.mockResolvedValueOnce(newProject);
      
      const result = await project.create(   
        newProject.pname, 
        newProject.pkey ?? undefined,
        newProject.public, 
        newProject.description ?? undefined,
      );
      expect(result).toEqual<Project>(projectsData[INDEX]);
    });
  });

  describe('update', () => {
    it('should return updated project', async () => {
      const INDEX = 0;
      const updatedProject = projectsData[INDEX];
      prismaMock.project.update.mockResolvedValueOnce(updatedProject);
      
      const result = await project.update(   
        updatedProject.id,
        updatedProject.pname, 
        updatedProject.public, 
        updatedProject.description ?? undefined,
      );
      expect(result).toEqual<Project>(projectsData[INDEX]);
    });
  });


  describe('remove', () => {
    it('should return removed project', async () => {
      const INDEX = 0;
      const deletedProject = projectsData[INDEX];
      prismaMock.project.delete.mockResolvedValueOnce(deletedProject);
      
      const result = await project.remove(   
        deletedProject.id,
      );
      expect(result).toEqual<Project>(projectsData[INDEX]);
    });
  });

  describe('getUser', () => {
    it('should return users in a project', async () => {
      const PROJECT_ID = 1;
      // TODO: get the type right
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      prismaMock.usersOnProjects.findMany.mockResolvedValueOnce(userData.map(x => ({ user: x })));
      
      const result = await project.getUsers(PROJECT_ID);
      expect(result).toEqual<User[]>(userData);
    });
  });

  describe('addUser', () => {
    it('should return added user', async () => {
      const PROJECT_ID = 1;
      const USER_ID = 1;
      const resultMock: UsersOnProjects = {
        project_id: PROJECT_ID,
        user_id: USER_ID,
        created_at: new Date(Date.now()),
      }; 
      prismaMock.usersOnProjects.create.mockResolvedValueOnce(resultMock);

      const result = await project.addUser(PROJECT_ID, USER_ID);
      expect(result).toEqual<UsersOnProjects>(resultMock);
    });
  });

  describe('removeUser', () => {
    it('should return removed user', async () => {
      const PROJECT_ID = 1;
      const USER_ID = 1;
      const resultMock: UsersOnProjects = {
        project_id: PROJECT_ID,
        user_id: USER_ID,
        created_at: new Date(Date.now()),
      }; 
      prismaMock.usersOnProjects.delete.mockResolvedValueOnce(resultMock);

      const result = await project.removeUser(PROJECT_ID, USER_ID);
      expect(result).toEqual<UsersOnProjects>(resultMock);
    });
  });

});