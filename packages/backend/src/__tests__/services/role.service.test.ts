import { ActionsOnRoles, Prisma, UsersOnRoles, Action } from '@prisma/client';
import { prismaMock } from '../../models/mock/mockPrismaClient';
import roleService from '../../services/role.service';

const PRISMA_RECORD_NOT_FOUND = 'P2025';

describe('role.service tests', () => {

  describe("when a user's role is queried", () => {
    it('should return a role id if it exists', async () => {
      const prismaResponseObject : UsersOnRoles = {
        user_email : 'testUser@test.com',
        role_id: 1,
      };
      prismaMock.usersOnRoles.findUniqueOrThrow.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.getUserRoleId('testUser@test.com')).resolves.toEqual(1);
    });

    it('should throw an error if there is no role entry', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record does not exist', PRISMA_RECORD_NOT_FOUND, 'testVersion');
      prismaMock.usersOnRoles.findUniqueOrThrow.mockRejectedValueOnce(prismaError);
      await expect(roleService.getUserRoleId('testUser@test.com')).rejects.toThrow(prismaError);
    });
  });

  describe('when a role is queried with an action', () => {
    it('should return true if the role is allowed to perform the action', async () => {
      const prismaResponseObject : ActionsOnRoles[] = [{
        role_id : 1,
        action : Action.create_course,
      }];
      const expectedResult = true;
      prismaMock.actionsOnRoles.findMany.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.isActionAllowed(1, Action.create_course)).resolves.toEqual(expectedResult);
    })

    it('should return false if the role is not allowed to perform the action', async () => {
      const prismaResponseObject : ActionsOnRoles[] = [];
      const expectedResult = false;
      prismaMock.actionsOnRoles.findMany.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.isActionAllowed(1, Action.delete_course)).resolves.toEqual(expectedResult);
    })

    it('should return true if an action is not supplied', async () => {
      const expectedResult = true;
      await expect(roleService.isActionAllowed(1, null)).resolves.toEqual(expectedResult);
    })

    // For now its impossible to have a role without actions
  });

});