import { createRequest, createResponse } from 'node-mocks-http';
import StatusCodes from 'http-status-codes';
import { Action, ActionsOnRoles } from '@prisma/client';
import roleService from '../../services/role.service';
import role from '../../controllers/role';
import { UserRoleActionsForCourse, UserRolesForCourse } from '../../services/types/role.service.types';

const spies = {
  roleServiceGetAllActions: jest.spyOn(roleService, 'getAllActions'),
  roleServiceGetRoleActions: jest.spyOn(roleService, 'getRoleActions'),
  roleServiceAddActionToRole: jest.spyOn(roleService, 'addActionToRole'),
  roleServiceRemoveActionFromRole: jest.spyOn(roleService, 'removeActionFromRole'),
  roleServiceGetUserRoleActionsForCourse: jest.spyOn(roleService, 'getUserRoleActionsForCourse'),
  roleServiceGetUserRoleActionsForProject: jest.spyOn(roleService, 'getUserRoleActionsForProject'),
  roleServiceGetUserRolesForCourse: jest.spyOn(roleService, 'getUserRolesForCourse'),
  roleServiceGetUserRolesForProject: jest.spyOn(roleService, 'getUserRolesForProject'),
  roleServiceUpdateUserRoleForCourse: jest.spyOn(roleService, 'updateUserRoleForCourse'),
  roleServiceUpdateUserRoleForProject: jest.spyOn(roleService, 'updateUserRoleForProject'),
};

describe('role.controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
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

  describe('getUserRoleActionsForCourse', () => {
    it('should return status 400 BAD REQUEST if the user email was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        courseId: 1,
      };
      await role.getUserRoleActionsForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid User email! User email cannot be undefined.',
      });
    });

    it('should return status 400 BAD REQUEST if the course Id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: 'testEmail@test.com',
      };
      await role.getUserRoleActionsForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid Course Id! Course Id cannot be undefined.',
      });
    });

    it('should return all of the users role actions for a course if the query is successful', async () => {
      const roleServiceResponseObject: UserRoleActionsForCourse = {
        id: 1,
        user_email: 'testEmail@test.com',
        course_id: 1,
        role_id: 1,
        role: {
          id: 1,
          role_name: 'TEST_ROLE',
          actions: [],
        },
      };
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        courseId: 1,
        userEmail: 'testEmail@test.com',
      };
      spies.roleServiceGetUserRoleActionsForCourse.mockResolvedValueOnce(roleServiceResponseObject);
      await role.getUserRoleActionsForCourse(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData).toEqual(roleServiceResponseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('getUserRoleActionsForProject', () => {
    it('should return status 400 BAD REQUEST if the user email was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        projectId: 1,
      };
      await role.getUserRoleActionsForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid User email! User email cannot be undefined.',
      });
    });

    it('should return status 400 BAD REQUEST if the project id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: 'testEmail@test.com',
      };
      await role.getUserRoleActionsForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid Project Id! Project Id cannot be undefined.',
      });
    });

    it('should return all of the users role actions for a project if the query is successful', async () => {
      const roleServiceResponseObject: UserRoleActionsForCourse = {
        id: 1,
        user_email: 'testEmail@test.com',
        course_id: 1,
        role_id: 1,
        role: {
          id: 1,
          role_name: 'TEST_ROLE',
          actions: [],
        },
      };
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        projectId: 1,
        userEmail: 'testEmail@test.com',
      };
      spies.roleServiceGetUserRoleActionsForProject.mockResolvedValueOnce(roleServiceResponseObject);
      await role.getUserRoleActionsForProject(mockReq, mockRes);
      expect(mockRes._getJSONData()).toEqual(roleServiceResponseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('getUserRolesForCourse', () => {
    it('should return status 400 BAD REQUEST if the course Id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();

      await role.getUserRolesForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ error: 'Course id must be a number' });
    });

    it('should return all of the user roles for a course if the query is successful', async () => {
      const roleServiceResponseObject: UserRolesForCourse[] = [
        {
          id: 1,
          user_email: 'testUser@test.com',
          role_id: 1,
          course_id: 1,
          role: {
            id: 1,
            role_name: 'TEST_ROLE',
          },
        },
      ];

      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.courseId = '1';

      spies.roleServiceGetUserRolesForCourse.mockResolvedValueOnce(roleServiceResponseObject);
      await role.getUserRolesForCourse(mockReq, mockRes);
      expect(mockRes._getJSONData()).toEqual(roleServiceResponseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('getUserRolesForProject', () => {
    it('should return status 400 BAD REQUEST if the project Id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();

      await role.getUserRolesForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ error: 'Project id must be a number' });
    });

    it('should return all of the user roles for a course if the query is successful', async () => {
      const roleServiceResponseObject: UserRolesForCourse[] = [
        {
          id: 1,
          user_email: 'testUser@test.com',
          role_id: 1,
          course_id: 1,
          role: {
            id: 1,
            role_name: 'TEST_ROLE',
          },
        },
      ];

      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.projectId = '1';

      spies.roleServiceGetUserRolesForProject.mockResolvedValueOnce(roleServiceResponseObject);
      await role.getUserRolesForProject(mockReq, mockRes);
      expect(mockRes._getJSONData()).toEqual(roleServiceResponseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('updateUserRoleForCourse', () => {
    it('should return status 400 BAD REQUEST if the course Id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: 'testUser@test.com',
        userRole: 1,
        userId: 1,
      };

      await role.updateUserRoleForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ error: 'Course id must be a number' });
    });

    it('should return status 400 BAD REQUEST if the user role was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.courseId = '1';
      mockReq.body = {
        userEmail: 'testUser@test.com',
        userId: 1,
      };
      await role.updateUserRoleForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid User Role Id! User Role Id cannot be undefined.',
      });
    });

    it('should return status 400 BAD REQUEST if the user Id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.courseId = '1';
      mockReq.body = {
        userEmail: 'testUser@test.com',
        userRole: 1,
      };

      await role.updateUserRoleForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ error: 'Please provide a valid User Id! User Id cannot be undefined.' });
    });

    it('should return status 400 BAD REQUEST if the user email was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.courseId = '1';
      mockReq.body = {
        userRole: 1,
        userId: 1,
      };

      await role.updateUserRoleForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid User Email! User Email cannot be undefined.',
      });
    });

    it('should return HTTP 200 OK if the query is successful', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.courseId = '1';
      mockReq.body = {
        userRole: 1,
        userId: 1,
        userEmail: 'testUser@test.com',
      };

      spies.roleServiceUpdateUserRoleForCourse.mockResolvedValueOnce();
      await role.updateUserRoleForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('updateUserRoleForProject', () => {
    it('should return status 400 BAD REQUEST if the project Id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: 'testUser@test.com',
        userRole: 1,
        userId: 1,
      };

      await role.updateUserRoleForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ error: 'Project id must be a number' });
    });

    it('should return status 400 BAD REQUEST if the user role was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.projectId = '1';
      mockReq.body = {
        userEmail: 'testUser@test.com',
        userId: 1,
      };
      await role.updateUserRoleForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid User Role Id! User Role Id cannot be undefined.',
      });
    });

    it('should return status 400 BAD REQUEST if the user Id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.projectId = '1';
      mockReq.body = {
        userEmail: 'testUser@test.com',
        userRole: 1,
      };

      await role.updateUserRoleForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ error: 'Please provide a valid User Id! User Id cannot be undefined.' });
    });

    it('should return status 400 BAD REQUEST if the user email was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.projectId = '1';
      mockReq.body = {
        userRole: 1,
        userId: 1,
      };

      await role.updateUserRoleForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid User Email! User Email cannot be undefined.',
      });
    });

    it('should return HTTP 200 OK if the query is successful', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.projectId = '1';
      mockReq.body = {
        userRole: 1,
        userId: 1,
        userEmail: 'testUser@test.com',
      };

      spies.roleServiceUpdateUserRoleForProject.mockResolvedValueOnce();
      await role.updateUserRoleForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });
});
