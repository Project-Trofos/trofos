import { ActionsOnRoles, Prisma, UsersOnRoles, Action, Role } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import roleService from '../../services/role.service';
import { RoleInformation } from '../../services/types/role.service.types';

const PRISMA_RECORD_NOT_FOUND = 'P2025';

describe('role.service tests', () => {
  describe('getUserRoleId', () => {
    it('should return a role id if it exists', async () => {
      const prismaResponseObject: UsersOnRoles = {
        user_email: 'testUser@test.com',
        role_id: 1,
      };
      prismaMock.usersOnRoles.findUniqueOrThrow.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.getUserRoleId('testUser@test.com')).resolves.toEqual(1);
    });

    it('should throw an error if there is no role entry', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record does not exist', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.usersOnRoles.findUniqueOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRoleId('testUser@test.com')).rejects.toThrow(prismaError);
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
      type Responsetype = UsersOnRoles & {
        role: Role & {
          actions: ActionsOnRoles[];
        };
      };

      const prismaResponseObject: Responsetype = {
        user_email: 'testUser@test.com',
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

      const expectedResponse: RoleInformation = {
        isAdmin: false,
        roleId: 1,
        roleActions: ['test_action'],
      };
      prismaMock.usersOnRoles.findFirstOrThrow.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.getUserRoleInformation('testUser@test.com')).resolves.toEqual(expectedResponse);
    });

    it('should throw an error if there is no role entry', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record does not exist', {
        code: PRISMA_RECORD_NOT_FOUND,
        clientVersion: 'testVersion',
      });
      prismaMock.usersOnRoles.findFirstOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRoleInformation('testUser@test.com')).rejects.toThrow(prismaError);
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
});
