import { ActionsOnRoles, Prisma, UsersOnRoles, Action, Role, UsersOnRolesOnCourses } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import roleService from '../../services/role.service';
import { RoleInformation } from '../../services/types/role.service.types';

const PRISMA_RECORD_NOT_FOUND = 'P2025';

// Mock data for tests
const projectResponseObject = {
  id: 1,
  pname: 'testProject',
  course_id: 1,
  public: false,
  created_at: new Date('2022-08-31T15:19:39.104Z'),
  backlog_counter: 0,
  pkey: '',
  description: '',
  users: [],
  sprints: [],
  backlogStatuses: [],
};

const usersOnRolesOnCoursesResponseObject = {
  id: 1,
  user_id: 1,
  course_id: 1,
  role_id: 1,
};

describe('role.service tests', () => {
  describe('getAllRoles', () => {
    it('should return all roles if there is no error', async () => {
      const prismaResponseObject: Role[] = [
        {
          role_name: 'TEST_ROLE',
          id: 1,
        },
      ];
      prismaMock.role.findMany.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.getAllRoles()).resolves.toEqual(prismaResponseObject);
    });
  });
  describe('getUserRoleId', () => {
    it('should return a role id if it exists', async () => {
      const prismaResponseObject: UsersOnRoles = {
        user_id: 1,
        role_id: 1,
      };
      prismaMock.usersOnRoles.findUniqueOrThrow.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.getUserRoleId(1)).resolves.toEqual(1);
    });

    it('should throw an error if there is no role entry', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record does not exist', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.usersOnRoles.findUniqueOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRoleId(1)).rejects.toThrow(prismaError);
    });
  });

  describe('isActionAllowed', () => {
    it('should return true if the role is allowed to perform the action', async () => {
      const prismaResponseObject: ActionsOnRoles[] = [
        {
          role_id: 1,
          action: Action.create_course,
        },
      ];
      const expectedResult = true;
      prismaMock.actionsOnRoles.findMany.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.isActionAllowed(1, Action.create_course)).resolves.toEqual(expectedResult);
    });

    it('should return false if the role is not allowed to perform the action', async () => {
      const prismaResponseObject: ActionsOnRoles[] = [];
      const expectedResult = false;
      prismaMock.actionsOnRoles.findMany.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.isActionAllowed(1, Action.delete_course)).resolves.toEqual(expectedResult);
    });

    it('should return true if an action is not supplied', async () => {
      const expectedResult = true;
      await expect(roleService.isActionAllowed(1, null)).resolves.toEqual(expectedResult);
    });

    // For now its impossible to have a role without actions
  });

  describe('getUserRoleInformation', () => {
    it('should return a role id if it exists', async () => {
      type BasicRoles = UsersOnRoles & {
        role: Role & {
          actions: ActionsOnRoles[];
        };
      };

      type CourseRoles = UsersOnRolesOnCourses & {
        role: Role & {
          actions: ActionsOnRoles[];
        };
      };

      const basicRolesResponseObject: BasicRoles = {
        user_id: 1,
        role_id: 1,
        role: {
          id: 2,
          role_name: 'TEST',
          actions: [
            {
              role_id: 1,
              action: 'test_action' as Action,
            },
          ],
        },
      };

      const courseRolesResponseObject: CourseRoles[] = [];

      const expectedResponse: RoleInformation = {
        isAdmin: false,
        roleId: 1,
        roleActions: ['test_action'],
      };
      prismaMock.usersOnRoles.findFirstOrThrow.mockResolvedValueOnce(basicRolesResponseObject);
      prismaMock.usersOnRolesOnCourses.findMany.mockResolvedValueOnce(courseRolesResponseObject);
      await expect(roleService.getUserRoleInformation(1)).resolves.toEqual(expectedResponse);
    });

    it('should throw an error if there is no role entry', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record does not exist', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.usersOnRoles.findFirstOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRoleInformation(1)).rejects.toThrow(prismaError);
    });
  });

  describe('getAllActions', () => {
    it('should return all actions currently defined in the prisma schema', async () => {
      expect(roleService.getAllActions()).toEqual(Object.values(Action));
    });
  });

  describe('getRoleActions', () => {
    it('should return an error if the prisma query was unsuccessful', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record does not exist', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.role.findMany.mockRejectedValueOnce(prismaError);
      await expect(roleService.getRoleActions()).rejects.toThrow(prismaError);
    });

    it('should return an array of roles with their actions if the query was successful', async () => {
      const prismaResponseObject = [
        {
          id: 1,
          role_name: 'test_role',
          actions: [],
        },
      ];
      prismaMock.role.findMany.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.getRoleActions()).resolves.toEqual(prismaResponseObject);
    });
  });

  describe('addActionToRole', () => {
    it('should return an error if the creation query was unsuccessful', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during creation', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.actionsOnRoles.create.mockRejectedValueOnce(prismaError);
      await expect(roleService.addActionToRole(1, 'admin')).rejects.toThrow(prismaError);
    });

    it('should return the added actionsOnRoles object if it was successfully created', async () => {
      const prismaResponseObject = {
        role_id: 1,
        action: Action.admin,
      };
      prismaMock.actionsOnRoles.create.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.addActionToRole(1, 'admin')).resolves.toEqual(prismaResponseObject);
    });
  });

  describe('removeActionFromRole', () => {
    it('should return an error if the creation query was unsuccessful', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during deletion', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.actionsOnRoles.delete.mockRejectedValueOnce(prismaError);
      await expect(roleService.removeActionFromRole(1, 'admin')).rejects.toThrow(prismaError);
    });

    it('should return the removed actionsOnRoles object if it was successfully created', async () => {
      const prismaResponseObject = {
        role_id: 1,
        action: Action.admin,
      };
      prismaMock.actionsOnRoles.delete.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.removeActionFromRole(1, 'admin')).resolves.toEqual(prismaResponseObject);
    });
  });

  describe('getUserRoleActionsForCourse', () => {
    it('should return an error if the query was unsuccessful', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.usersOnRolesOnCourses.findFirstOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRoleActionsForCourse(1, 1)).rejects.toThrow(prismaError);
    });

    it('should return the users role actions for a course if the query was successful', async () => {
      const prismaResponseObject = {
        id: 1,
        user_id: 1,
        course_id: 1,
        role_id: 1,
        role: {
          role_name: 'TEST_ROLE',
          actions: [],
        },
      };
      prismaMock.usersOnRolesOnCourses.findFirstOrThrow.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.getUserRoleActionsForCourse(1, 1)).resolves.toEqual(
        prismaResponseObject,
      );
    });
  });

  describe('getUserRoleActionsForProject', () => {
    it('should return an error if the query was unsuccessful while retrieving project info', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.project.findFirstOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRoleActionsForProject(1, 1)).rejects.toThrow(prismaError);
    });

    it('should return an error if the query was unsuccessful while retrieving course info', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(projectResponseObject);
      prismaMock.usersOnRolesOnCourses.findFirstOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRoleActionsForProject(1, 1)).rejects.toThrow(prismaError);
    });

    it('should return an error if the query was unsuccessful while retrieving course info', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(projectResponseObject);
      prismaMock.usersOnRolesOnCourses.findFirstOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRoleActionsForProject(1, 1)).rejects.toThrow(prismaError);
    });

    it('should return the users role actions for a course if the query was successful', async () => {
      const userOnRolesOnCoursesResponseObject = {
        id: 1,
        user_id: 1,
        course_id: 1,
        role_id: 1,
        role: {
          role_name: 'TEST_ROLE',
          actions: [],
        },
      };
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(projectResponseObject);
      prismaMock.usersOnRolesOnCourses.findFirstOrThrow.mockResolvedValueOnce(userOnRolesOnCoursesResponseObject);
      await expect(roleService.getUserRoleActionsForCourse(1, 1)).resolves.toEqual(
        userOnRolesOnCoursesResponseObject,
      );
    });
  });

  describe('getUserRolesForCourse', () => {
    it('should return an error if the query was unsuccessful', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.usersOnRolesOnCourses.findMany.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRolesForCourse(1)).rejects.toThrow(prismaError);
    });

    it('should return the list of users and their roles for the course', async () => {
      const prismaResponseObject = [
        {
          id: 1,
          user_id: 1,
          role_id: 1,
          course_id: 1,
        },
      ];
      prismaMock.usersOnRolesOnCourses.findMany.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.getUserRolesForCourse(1)).resolves.toEqual(prismaResponseObject);
    });
  });

  describe('getUserRolesForProject', () => {
    it('should return an error if the query was unsuccessful while retrieving project info', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.project.findFirstOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRolesForProject(1)).rejects.toThrow(prismaError);
    });

    it('should return an error if the query was unsuccessful while retrieving course info', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(projectResponseObject);
      prismaMock.usersOnRolesOnCourses.findMany.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRolesForProject(1)).rejects.toThrow(prismaError);
    });

    it('should return the list of users and their roles for the course', async () => {
      const courseRolesResponseObject = [
        {
          id: 1,
          user_id: 1,
          role_id: 1,
          course_id: 1,
        },
      ];
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(projectResponseObject);
      prismaMock.usersOnRolesOnCourses.findMany.mockResolvedValueOnce(courseRolesResponseObject);
      await expect(roleService.getUserRolesForProject(1)).resolves.toEqual(courseRolesResponseObject);
    });
  });

  describe('updateUserRoleForCourse', () => {
    it('should return an error if the query was unsuccessful while updating role info', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.usersOnRolesOnCourses.update.mockRejectedValueOnce(prismaError);
      await expect(roleService.updateUserRoleForCourse(1, 1, 1)).rejects.toThrow(prismaError);
    });

    it('should return an error if the query was unsuccessful while updating the userOnCourse info', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.usersOnRolesOnCourses.update.mockRejectedValueOnce(prismaError);
      await expect(roleService.updateUserRoleForCourse(1, 1, 1)).rejects.toThrow(prismaError);
    });

    it('should execute successfully if the UserOnRolesOnCourses and UserOnCourses updates were successful', async () => {
      prismaMock.usersOnRolesOnCourses.update.mockResolvedValueOnce(usersOnRolesOnCoursesResponseObject);
      await expect(roleService.updateUserRoleForCourse(1, 2, 1));
    });
  });

  describe('updateUserRoleForProject', () => {
    it('should return an error if the query was unsuccessful while fetching project info', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.project.findFirstOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.updateUserRoleForProject(1, 1, 1)).rejects.toThrow(prismaError);
    });

    it('should return an error if the query was unsuccessful while updating role info', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(projectResponseObject);
      prismaMock.usersOnRolesOnCourses.update.mockRejectedValueOnce(prismaError);
      await expect(roleService.updateUserRoleForProject(1, 1, 1)).rejects.toThrow(prismaError);
    });

    it('should return an error if the query was unsuccessful while updating the userOnCourse info', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error during read', {
        code: 'testError',
        clientVersion: 'testVersion',
      });
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(projectResponseObject);
      prismaMock.usersOnRolesOnCourses.update.mockRejectedValueOnce(prismaError);
      await expect(roleService.updateUserRoleForProject(1, 1, 1)).rejects.toThrow(prismaError);
    });

    it('should execute successfully if the UserOnRolesOnCourses and UserOnCourses updates were successful', async () => {
      prismaMock.project.findFirstOrThrow.mockResolvedValueOnce(projectResponseObject);
      prismaMock.usersOnRolesOnCourses.update.mockResolvedValueOnce(usersOnRolesOnCoursesResponseObject);
      await expect(roleService.updateUserRoleForCourse(1, 1, 1));
    });
  });

  describe('updateUserRole', () => {
    it('should successfully update the users role if it exists', async () => {
      const prismaResponseObject: UsersOnRoles = {
        user_id: 1,
        role_id: 2,
      };
      prismaMock.usersOnRoles.update.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.updateUserRole(2, 1)).resolves.toEqual(prismaResponseObject);
    });

    it('should return an error if there is no such user', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record does not exist', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.usersOnRoles.update.mockRejectedValueOnce(prismaError);
      await expect(roleService.updateUserRole(2, 1)).rejects.toThrow(prismaError);
    });
  });
});
