import { createRequest, createResponse } from 'node-mocks-http';
import StatusCodes from 'http-status-codes';
import { Action, ActionsOnRoles, Role, UserSession, UsersOnRoles } from '@prisma/client';
import roleService from '../../services/role.service';
import role from '../../controllers/role';

const spies = {
  roleServiceGetAllActions: jest.spyOn(roleService, 'getAllActions'),
  roleServiceGetRoleActions: jest.spyOn(roleService, 'getRoleActions'),
  roleServiceAddActionToRole: jest.spyOn(roleService, 'addActionToRole'),
  roleServiceRemoveActionFromRole: jest.spyOn(roleService, 'removeActionFromRole'),
  roleServiceGetAllRoles: jest.spyOn(roleService, 'getAllRoles'),
  roleServiceUpdateUserRole: jest.spyOn(roleService, 'updateUserRole'),
};

describe('role.controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRoles', () => {
    it('should return all roles in the application if the query was successful', async () => {
      const roleServiceResponseObject : Role[] = [{
        role_name : 'TEST_ROLE',
        id : 1
      }];
      const mockReq = createRequest();
      const mockRes = createResponse();
      spies.roleServiceGetAllRoles.mockResolvedValue(roleServiceResponseObject);
      await role.getAllRoles(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData).toEqual(roleServiceResponseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });

    it('should return status 500 INTERNAL SEVER ERROR if the query was unsuccessful', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      spies.roleServiceGetAllRoles.mockImplementationOnce(() => {
        throw new Error('Error during request');
      });
      await role.getAllRoles(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockRes._getJSONData()).toEqual({ error: 'Error during request' });
    });
  });

  describe('getAllActions', () => {
    it('should return all actions in the application if the query was successful', async () => {
      const roleServiceResponseObject = ['testActionOne', 'testActionTwo'];
      const mockReq = createRequest();
      const mockRes = createResponse();
      spies.roleServiceGetAllActions.mockReturnValueOnce(roleServiceResponseObject);
      await role.getAllActions(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData).toEqual(roleServiceResponseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });

    it('should return status 500 INTERNAL SEVER ERROR if the query was unsuccessful', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      spies.roleServiceGetAllActions.mockImplementationOnce(() => {
        throw new Error('Error during request');
      });
      await role.getAllActions(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockRes._getJSONData()).toEqual({ error: 'Error during request' });
    });
  });

  describe('getRoleActions', () => {
    it('should return status 500 INTERNAL SEVER ERROR if the query was unsuccessful', async () => {
      const roleServiceResponseError = new Error('Error during request');
      const mockReq = createRequest();
      const mockRes = createResponse();
      spies.roleServiceGetRoleActions.mockRejectedValueOnce(roleServiceResponseError);
      await role.getRoleActions(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockRes._getJSONData()).toEqual({ error: 'Error during request' });
    });

    it('should return all roles and their actions in the application if the query was successful', async () => {
      const roleServiceResponseObject = [
        {
          id: 1,
          role_name: 'testRole',
          actions: [],
        },
      ];
      const mockReq = createRequest();
      const mockRes = createResponse();
      spies.roleServiceGetRoleActions.mockResolvedValueOnce(roleServiceResponseObject);
      await role.getRoleActions(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData).toEqual(roleServiceResponseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('addActionToRole', () => {
    it('should return status 400 BAD REQUEST if the role id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        action: 'test_action',
      };
      await role.addActionToRole(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ error: 'Role id must be a number' });
    });

    it('should return status 400 BAD REQUEST if the action was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        roleId: 1,
      };
      await role.addActionToRole(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid Role action! Role action cannot be undefined.',
      });
    });

    it('should return all roles and their actions in the application if the query was successful', async () => {
      const roleServiceResponseObject: ActionsOnRoles = {
        role_id: 1,
        action: Action.admin,
      };
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        roleId: 1,
        action: Action.admin,
      };
      spies.roleServiceAddActionToRole.mockResolvedValueOnce(roleServiceResponseObject);
      await role.addActionToRole(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData.message).toEqual('Successfully added');
      expect(jsonData.data).toEqual(roleServiceResponseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('removeActionFromRole', () => {
    it('should return status 400 BAD REQUEST if the role id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        action: 'test_action',
      };
      await role.removeActionFromRole(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ error: 'Role id must be a number' });
    });

    it('should return status 400 BAD REQUEST if the action was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        roleId: 1,
      };
      await role.removeActionFromRole(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid Role action! Role action cannot be undefined.',
      });
    });

    it('should return all roles and their actions in the application if the query was successful', async () => {
      const roleServiceResponseObject: ActionsOnRoles = {
        role_id: 1,
        action: Action.admin,
      };
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        roleId: 1,
        action: Action.admin,
      };
      spies.roleServiceRemoveActionFromRole.mockResolvedValueOnce(roleServiceResponseObject);
      await role.removeActionFromRole(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData.message).toEqual('Successfully removed');
      expect(jsonData.data).toEqual(roleServiceResponseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('updateUserRole', () => {
    it('should return status 400 BAD REQUEST if the role id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        user_email : "testUser@test.com"
      };
      await role.updateUserRole(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ 
        error: 'Please provide a valid Role id! Role id cannot be undefined.',
       });
    });

    it('should return status 400 BAD REQUEST if the userEmail was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        newRoleId: 1,
      };
      await role.updateUserRole(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid User email! User email cannot be undefined.',
      });
    });

    it('should return status 401 UNAUTHORISED if the user tries to modify their own role', async () => {
      const userSessionInformation : UserSession = {
        user_email : "testUser@test.com",
        user_id : 1,
        user_is_admin : true,
        session_id: 'testSessionId',
        user_role_id: 1,
        session_expiry: new Date('2022-08-31T15:19:39.104Z'),
      }
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        newRoleId: 1,
        userEmail: "testUser@test.com",
      };
      mockRes.locals.userSession = userSessionInformation;
      await role.updateUserRole(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData.error).toEqual("Admin cannot modify their own role");
      expect(mockRes.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    });

    it('should update the uers role if the query was successful', async () => {
      const userSessionInformation : UserSession = {
        user_email : "testAdmin@test.com",
        user_id : 1,
        user_is_admin : true,
        session_id: 'testSessionId',
        user_role_id: 1,
        session_expiry: new Date('2022-08-31T15:19:39.104Z'),
      }
      const roleServiceResponseObject: UsersOnRoles = {
        role_id: 1,
        user_email: "testUser@test.com",
      };
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        newRoleId: 1,
        userEmail: "testUser@test.com",
      };
      mockRes.locals.userSession = userSessionInformation;
      spies.roleServiceUpdateUserRole.mockResolvedValueOnce(roleServiceResponseObject);
      await role.updateUserRole(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData.message).toEqual('Successfully updated');
      expect(jsonData.data).toEqual(roleServiceResponseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });
});
