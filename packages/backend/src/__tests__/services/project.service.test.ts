import {
  BacklogStatus,
  BacklogStatusType,
  Prisma,
  Project,
  ProjectGitLink,
  User,
  UsersOnProjects,
  UsersOnProjectOnSettings,
  UsersOnRolesOnCourses,
} from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import project from '../../services/project.service';
import {
  mockReturnedProjectGitLink,
  mockReturnedUserSettings,
  mockUpdatedUserSettings,
  projectsData,
  projectOwnerId,
} from '../mocks/projectData';
import { settingsData } from '../mocks/settingsData';
import projectPolicy from '../../policies/constraints/project.constraint';
import { userData } from '../mocks/userData';
import { STUDENT_ROLE_ID } from '../../helpers/constants';

describe('project.service tests', () => {
  const projectPolicyConstraint = projectPolicy.projectPolicyConstraint(1, true);

  describe('getAll', () => {
    it('should return all projects', async () => {
      prismaMock.project.findMany.mockResolvedValueOnce(projectsData);

      const result = await project.getAll(projectPolicyConstraint, settingsData, 'all', 0, 30, undefined, undefined, undefined, undefined);
      expect(result.data).toEqual<Project[]>(projectsData);
    });

    it('should return past projects', async () => {
      const pastProjects = [projectsData[2]];
      prismaMock.project.findMany.mockResolvedValueOnce(pastProjects);

      const result = await project.getAll(projectPolicyConstraint, settingsData, 'past', 0, 30, undefined, undefined, undefined, undefined);
      expect(result.data).toEqual<Project[]>(pastProjects);
    });

    it('should return current projects', async () => {
      const currentProjects = [projectsData[0], projectsData[1]];
      prismaMock.project.findMany.mockResolvedValueOnce(currentProjects);

      const result = await project.getAll(projectPolicyConstraint, settingsData, 'current', 0, 30, undefined, undefined, undefined, undefined);
      expect(result.data).toEqual<Project[]>(currentProjects);
    });

    it('should return past projects', async () => {
      const pastProjects = [projectsData[3]];
      prismaMock.project.findMany.mockResolvedValueOnce(pastProjects);

      const result = await project.getAll(projectPolicyConstraint, settingsData, 'future', 0, 30, undefined, undefined, undefined, undefined);
      expect(result.data).toEqual<Project[]>(pastProjects);
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
      prismaMock.user.findFirstOrThrow.mockRejectedValueOnce(userData[INDEX]);
      prismaMock.project.create.mockResolvedValueOnce(newProject);
      prismaMock.$transaction.mockResolvedValueOnce(newProject);

      const result = await project.create(
        projectOwnerId,
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
      prismaMock.project.findUniqueOrThrow.mockResolvedValueOnce(deletedProject);
      prismaMock.project.delete.mockResolvedValueOnce(deletedProject);
      prismaMock.$transaction.mockResolvedValueOnce(deletedProject);

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
      const INDEX = 0;
      const PROJECT_ID = 1;
      const resultMock: UsersOnProjects = {
        project_id: PROJECT_ID,
        user_id: userData[INDEX].user_id,
        created_at: new Date(Date.now()),
      };
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(userData[INDEX]);
      prismaMock.usersOnProjects.create.mockResolvedValueOnce(resultMock);
      prismaMock.$transaction.mockResolvedValueOnce(resultMock);

      const result = await project.addUser(PROJECT_ID, userData[INDEX].user_email);
      expect(result).toEqual<UsersOnProjects>(resultMock);
    });
  });

  describe('addUserByInvite', () => {
    it('upserts course membership, project membership, and project settings in one transaction', async () => {
      const INDEX = 0;
      const PROJECT_ID = projectsData[INDEX].id;
      const COURSE_ID = projectsData[INDEX].course_id;
      const user = userData[INDEX];
      const courseMembership: UsersOnRolesOnCourses = {
        id: 1,
        course_id: COURSE_ID,
        user_id: user.user_id,
        role_id: STUDENT_ROLE_ID,
      };
      const projectMembership: UsersOnProjects = {
        project_id: PROJECT_ID,
        user_id: user.user_id,
        created_at: new Date(),
      };
      const projectSettings: UsersOnProjectOnSettings = {
        project_id: PROJECT_ID,
        user_id: user.user_id,
        email_notification: false,
      };
      const mockTransactionClient = {
        user: {
          findUniqueOrThrow: jest.fn().mockResolvedValue(user),
        },
        project: {
          findFirstOrThrow: jest.fn().mockResolvedValue(projectsData[INDEX]),
        },
        usersOnRolesOnCourses: {
          upsert: jest.fn().mockResolvedValue(courseMembership),
        },
        usersOnProjects: {
          upsert: jest.fn().mockResolvedValue(projectMembership),
        },
        usersOnProjectOnSettings: {
          upsert: jest.fn().mockResolvedValue(projectSettings),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransactionClient as unknown as Prisma.TransactionClient);
      });

      await expect(project.addUserByInvite(PROJECT_ID, user.user_email)).resolves.toEqual(projectMembership);
      expect(mockTransactionClient.project.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          id: PROJECT_ID,
        },
      });
      expect(mockTransactionClient.usersOnRolesOnCourses.upsert).toHaveBeenCalledWith({
        where: {
          user_id_course_id: {
            user_id: user.user_id,
            course_id: COURSE_ID,
          },
        },
        create: {
          course_id: COURSE_ID,
          user_id: user.user_id,
          role_id: STUDENT_ROLE_ID,
        },
        update: {},
      });
      expect(mockTransactionClient.usersOnProjects.upsert).toHaveBeenCalledWith({
        where: {
          project_id_user_id: {
            project_id: PROJECT_ID,
            user_id: user.user_id,
          },
        },
        create: {
          project_id: PROJECT_ID,
          user_id: user.user_id,
        },
        update: {},
      });
      expect(mockTransactionClient.usersOnProjectOnSettings.upsert).toHaveBeenCalledWith({
        where: {
          project_id_user_id: {
            project_id: PROJECT_ID,
            user_id: user.user_id,
          },
        },
        create: {
          project_id: PROJECT_ID,
          user_id: user.user_id,
        },
        update: {},
      });
    });

    it('rejects the transaction when a membership operation fails', async () => {
      const user = userData[0];
      const transactionError = new Error('Failed to add project membership');
      const mockTransactionClient = {
        user: {
          findUniqueOrThrow: jest.fn().mockResolvedValue(user),
        },
        project: {
          findFirstOrThrow: jest.fn().mockResolvedValue(projectsData[0]),
        },
        usersOnRolesOnCourses: {
          upsert: jest.fn().mockResolvedValue({}),
        },
        usersOnProjects: {
          upsert: jest.fn().mockRejectedValue(transactionError),
        },
        usersOnProjectOnSettings: {
          upsert: jest.fn(),
        },
      };

      prismaMock.$transaction.mockImplementation(async (callback) => {
        return callback(mockTransactionClient as unknown as Prisma.TransactionClient);
      });

      await expect(project.addUserByInvite(projectsData[0].id, user.user_email)).rejects.toThrow(transactionError);
      expect(mockTransactionClient.usersOnProjectOnSettings.upsert).not.toHaveBeenCalled();
    });
  });

  describe('removeUser', () => {
    it('should return removed user', async () => {
      const INDEX = 0;
      const PROJECT_ID = 1;
      const USER_ID = 1;
      const resultMock: UsersOnProjects = {
        project_id: PROJECT_ID,
        user_id: USER_ID,
        created_at: new Date(Date.now()),
      };
      prismaMock.user.findFirstOrThrow.mockResolvedValueOnce(userData[INDEX]);
      prismaMock.usersOnProjects.delete.mockResolvedValueOnce(resultMock);
      prismaMock.$transaction.mockResolvedValueOnce(resultMock);

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

  describe('getGitUrl', () => {
    const resultMock: ProjectGitLink = mockReturnedProjectGitLink;
    it('should return project git url', async () => {
      prismaMock.projectGitLink.findFirst.mockResolvedValueOnce(resultMock);

      const result = await project.getGitUrl(mockReturnedProjectGitLink.project_id);
      expect(result).toEqual<ProjectGitLink>(resultMock);
    });
  });

  describe('addGitUrl', () => {
    it('should return added git url', async () => {
      const resultMock: ProjectGitLink = mockReturnedProjectGitLink;
      prismaMock.projectGitLink.create.mockResolvedValueOnce(resultMock);

      const result = await project.addGitUrl(mockReturnedProjectGitLink.project_id, mockReturnedProjectGitLink.repo);
      expect(result).toEqual<ProjectGitLink>(resultMock);
    });
  });

  describe('updateGitUrl', () => {
    it('should return updated git url', async () => {
      const resultMock: ProjectGitLink = mockReturnedProjectGitLink;
      prismaMock.projectGitLink.update.mockResolvedValueOnce(resultMock);

      const result = await project.updateGitUrl(mockReturnedProjectGitLink.project_id, mockReturnedProjectGitLink.repo);
      expect(result).toEqual<ProjectGitLink>(resultMock);
    });
  });

  describe('deleteGitUrl', () => {
    it('should return deleted git url', async () => {
      const resultMock: ProjectGitLink = mockReturnedProjectGitLink;
      prismaMock.projectGitLink.delete.mockResolvedValueOnce(resultMock);

      const result = await project.deleteGitUrl(mockReturnedProjectGitLink.project_id);
      expect(result).toEqual<ProjectGitLink>(resultMock);
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings', async () => {
      const resultMock: UsersOnProjectOnSettings = mockReturnedUserSettings;
      prismaMock.usersOnProjectOnSettings.findUnique.mockResolvedValueOnce(resultMock);

      const result = await project.getUserSettings(
        mockReturnedUserSettings.project_id,
        mockReturnedUserSettings.user_id,
      );
      expect(result).toEqual<UsersOnProjectOnSettings>(resultMock);
    });
  });

  describe('updateUserSettings', () => {
    it('should return updated user settings', async () => {
      const resultMock: UsersOnProjectOnSettings = {
        ...mockReturnedUserSettings,
        ...mockUpdatedUserSettings,
      };
      prismaMock.usersOnProjectOnSettings.update.mockResolvedValueOnce(resultMock);

      const result = await project.updateUserSettings(
        mockReturnedUserSettings.project_id,
        mockReturnedUserSettings.user_id,
        mockUpdatedUserSettings,
      );
      expect(result).toEqual<UsersOnProjectOnSettings>(resultMock);
    });
  });

  describe('archiveProject', () => {
    it('should return archived project', async () => {
      const INDEX = 0;
      const archivedProject = { ...projectsData[INDEX], is_archive: true };

      prismaMock.project.update.mockResolvedValueOnce(archivedProject);

      const result = await project.archiveProject(archivedProject.id);
      expect(result).toEqual<Project>(archivedProject);
    });
  });

  describe('unarchiveProject', () => {
    it('should return unarchived project', async () => {
      const INDEX = 0;
      const unarchivedProject = { ...projectsData[INDEX], is_archive: false };

      prismaMock.project.update.mockResolvedValueOnce(unarchivedProject);

      const result = await project.unarchiveProject(unarchivedProject.id);
      expect(result).toEqual<Project>(unarchivedProject);
    });
  });
});
