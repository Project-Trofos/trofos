import { BacklogStatus, BacklogStatusType, Project, User, UsersOnProjects } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import project from '../../services/project.service';
import { projectsData } from '../mocks/projectData';
import projectPolicy from '../../policies/constraints/project.constraint';

describe('project.service tests', () => {
  // Mock data for users
  const userData: User[] = [{ user_email: 'user@mail.com', user_id: 1, user_password_hash: 'hash' }];

  const projectPolicyConstraint = projectPolicy.projectPolicyConstraint(1, true);

  describe('getAll', () => {
    it('should return all projects', async () => {
      prismaMock.project.findMany.mockResolvedValueOnce(projectsData);

      const result = await project.getAll(projectPolicyConstraint, 'all');
      expect(result).toEqual<Project[]>(projectsData);
    });

    it('should return past projects', async () => {
      const pastProjects = [projectsData[2]];
      prismaMock.project.findMany.mockResolvedValueOnce(pastProjects);

      const result = await project.getAll(projectPolicyConstraint, 'past');
      expect(result).toEqual<Project[]>(pastProjects);
    });

    it('should return current projects', async () => {
      const currentProjects = [projectsData[0], projectsData[1]];
      prismaMock.project.findMany.mockResolvedValueOnce(currentProjects);

      const result = await project.getAll(projectPolicyConstraint, 'current');
      expect(result).toEqual<Project[]>(currentProjects);
    });

    it('should return past projects', async () => {
      const pastProjects = [projectsData[3]];
      prismaMock.project.findMany.mockResolvedValueOnce(pastProjects);

      const result = await project.getAll(projectPolicyConstraint, 'future');
      expect(result).toEqual<Project[]>(pastProjects);
    });
  });

  describe('getById', () => {
    it('should return correct project with the same id', async () => {
      const index = 0;
      const { id } = projectsData[index];
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce(projectsData.filter((c) => c.id === id)[0]);

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
        1,
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

      const result = await project.remove(deletedProject.id);
      expect(result).toEqual<Project>(projectsData[INDEX]);
    });
  });

  describe('getUser', () => {
    it('should return users in a project', async () => {
      const PROJECT_ID = 1;
      // TODO: get the type right
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      prismaMock.usersOnProjects.findMany.mockResolvedValueOnce(userData.map((x) => ({ user: x })));

      const result = await project.getUsers(projectPolicyConstraint, PROJECT_ID);
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

  describe('createBacklogStatus', () => {
    const PROJECT_ID = 1;
    const NAME = 'QA';
    const resultMock: BacklogStatus = {
      project_id: PROJECT_ID,
      name: NAME,
      type: BacklogStatusType.in_progress,
      order: 2,
    };
    it('should return created status', async () => {
      prismaMock.backlogStatus.create.mockResolvedValueOnce(resultMock);

      const result = await project.createBacklogStatus(PROJECT_ID, NAME);
      expect(result).toEqual<BacklogStatus>(resultMock);
    });

    it('should automatically find max order for type', async () => {
      const mockCurrentOrder = [resultMock];
      prismaMock.backlogStatus.findMany.mockResolvedValueOnce(mockCurrentOrder);

      const modifiedResultMock = {
        ...resultMock,
        order: 3,
      };

      prismaMock.backlogStatus.create.mockResolvedValueOnce(modifiedResultMock);

      const result = await project.createBacklogStatus(PROJECT_ID, NAME);
      expect(result).toEqual<BacklogStatus>(modifiedResultMock);
    });
  });

  describe('updateBacklogStatus', () => {
    it('should return updated status', async () => {
      const PROJECT_ID = 1;
      const CURRENT_NAME = 'In progress';
      const UPDATED_NAME = 'In development';
      const resultMock: BacklogStatus = {
        project_id: PROJECT_ID,
        name: UPDATED_NAME,
        type: BacklogStatusType.in_progress,
        order: 2,
      };
      prismaMock.backlogStatus.update.mockResolvedValueOnce(resultMock);

      const result = await project.updateBacklogStatus(PROJECT_ID, CURRENT_NAME, UPDATED_NAME);
      expect(result).toEqual<BacklogStatus>(resultMock);
    });
  });

  describe('updateBacklogStatusOrder', () => {
    it('should return updated status order', async () => {
      const PROJECT_ID = 1;
      const UPDATED_ORDER: Omit<BacklogStatus, 'project_id'>[] = [
        {
          name: 'In progress',
          type: BacklogStatusType.in_progress,
          order: 2,
        },
        {
          name: 'Triage',
          type: BacklogStatusType.in_progress,
          order: 1,
        },
      ];
      const resultMock: BacklogStatus[] = [
        {
          project_id: PROJECT_ID,
          name: 'Triage',
          type: BacklogStatusType.in_progress,
          order: 1,
        },
        {
          project_id: PROJECT_ID,
          name: 'In progress',
          type: BacklogStatusType.in_progress,
          order: 2,
        },
      ];
      prismaMock.backlogStatus.update.mockResolvedValueOnce(resultMock[0]);
      prismaMock.backlogStatus.update.mockResolvedValueOnce(resultMock[1]);
      prismaMock.$transaction.mockResolvedValueOnce(resultMock);

      const result = await project.updateBacklogStatusOrder(PROJECT_ID, UPDATED_ORDER);
      expect(result).toEqual<BacklogStatus[]>(resultMock);
    });
  });

  describe('getBacklogStatus', () => {
    it('should return backlog status', async () => {
      const PROJECT_ID = 1;
      const resultMock: BacklogStatus[] = [
        {
          project_id: PROJECT_ID,
          name: 'To do',
          type: BacklogStatusType.todo,
          order: 1,
        },
        {
          project_id: PROJECT_ID,
          name: 'In progress',
          type: BacklogStatusType.in_progress,
          order: 1,
        },
        {
          project_id: PROJECT_ID,
          name: 'Done',
          type: BacklogStatusType.done,
          order: 1,
        },
      ];
      prismaMock.backlogStatus.findMany.mockResolvedValueOnce(resultMock);

      const result = await project.getBacklogStatus(PROJECT_ID);
      expect(result).toEqual<BacklogStatus[]>(resultMock);
    });
  });

  describe('deleteBacklogStatus', () => {
    it('should return deleted status', async () => {
      const PROJECT_ID = 1;
      const NAME = 'In development';
      const resultMock: BacklogStatus = {
        project_id: PROJECT_ID,
        name: NAME,
        type: BacklogStatusType.in_progress,
        order: 2,
      };
      prismaMock.backlogStatus.delete.mockResolvedValueOnce(resultMock);

      const result = await project.deleteBacklogStatus(PROJECT_ID, NAME);
      expect(result).toEqual<BacklogStatus>(resultMock);
    });
  });
});
