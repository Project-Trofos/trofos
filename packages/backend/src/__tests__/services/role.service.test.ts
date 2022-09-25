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

  describe('when the actions of a role are queried', () => {
    it('should return all the actions associated with the role', async () => {
      const prismaResponseObject : ActionsOnRoles[] = [{
        role_id : 1,
        action : Action.create_course,
      }, {
        role_id : 1,
        action : Action.delete_course,
      }];
      const expectedResult : Action[] = [Action.create_course, Action.delete_course];
      prismaMock.actionsOnRoles.findMany.mockResolvedValueOnce(prismaResponseObject);
      await expect(roleService.getRoleActions(1)).resolves.toEqual(expectedResult);
            
    });

    // For now its impossible to have a role without actions
  });

});