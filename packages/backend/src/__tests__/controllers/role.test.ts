import { createRequest, createResponse } from 'node-mocks-http';
import StatusCodes from 'http-status-codes';
import { Action, ActionsOnRoles, Role, UserSession, UsersOnRoles } from '@prisma/client';
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
  roleServiceGetAllRoles: jest.spyOn(roleService, 'getAllRoles'),
  roleServiceUpdateUserRole: jest.spyOn(roleService, 'updateUserRole'),
};

// Mock role service data
const roleServiceUserRolesForCourseObject: UserRolesForCourse[] = [
  {
    id: 1,
    user_id: 1,
    role_id: 1,
    course_id: 1,
    role: {
      id: 1,
      role_name: 'TEST_ROLE',
    },
  },
];

const roleServiceActionsOnRolesObject: ActionsOnRoles = {
  role_id: 1,
  action: Action.admin,
};

const roleServiceUserRoleActionsForCourseObject: UserRoleActionsForCourse = {
  id: 1,
  user_id: 1,
  course_id: 1,
  role_id: 1,
  role: {
    id: 1,
    role_name: 'TEST_ROLE',
    actions: [],
  },
};

describe('role.controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRoles', () => {
    it('should return all roles in the application if the query was successful', async () => {
      const roleServiceResponseObject: Role[] = [
        {
          role_name: 'TEST_ROLE',
          id: 1,
        },
      ];
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
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        roleId: 1,
        action: Action.admin,
      };
      spies.roleServiceAddActionToRole.mockResolvedValueOnce(roleServiceActionsOnRolesObject);
      await role.addActionToRole(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData.message).toEqual('Successfully added');
      expect(jsonData.data).toEqual(roleServiceActionsOnRolesObject);
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
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        roleId: 1,
        action: Action.admin,
      };
      spies.roleServiceRemoveActionFromRole.mockResolvedValueOnce(roleServiceActionsOnRolesObject);
      await role.removeActionFromRole(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData.message).toEqual('Successfully removed');
      expect(jsonData.data).toEqual(roleServiceActionsOnRolesObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('getUserRoleActionsForCourse', () => {
    it('should return status 400 BAD REQUEST if the user id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        courseId: 1,
      };
      await role.getUserRoleActionsForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'User id must be a number',
      });
    });

    it('should return status 400 BAD REQUEST if the course Id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userId: 1,
      };
      await role.getUserRoleActionsForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid Course Id! Course Id cannot be undefined.',
      });
    });

    it('should return all of the users role actions for a course if the query is successful', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        courseId: 1,
        userId: 1,
      };
      spies.roleServiceGetUserRoleActionsForCourse.mockResolvedValueOnce(roleServiceUserRoleActionsForCourseObject);
      await role.getUserRoleActionsForCourse(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData).toEqual(roleServiceUserRoleActionsForCourseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('getUserRoleActionsForProject', () => {
    it('should return status 400 BAD REQUEST if the user id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        projectId: 1,
      };
      await role.getUserRoleActionsForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'User id must be a number',
      });
    });

    it('should return status 400 BAD REQUEST if the project id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userId: 1,
      };
      await role.getUserRoleActionsForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid Project Id! Project Id cannot be undefined.',
      });
    });

    it('should return all of the users role actions for a project if the query is successful', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        projectId: 1,
        userId: 1,
      };
      spies.roleServiceGetUserRoleActionsForProject.mockResolvedValueOnce(roleServiceUserRoleActionsForCourseObject);
      await role.getUserRoleActionsForProject(mockReq, mockRes);
      expect(mockRes._getJSONData()).toEqual(roleServiceUserRoleActionsForCourseObject);
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
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.courseId = '1';

      spies.roleServiceGetUserRolesForCourse.mockResolvedValueOnce(roleServiceUserRolesForCourseObject);
      await role.getUserRolesForCourse(mockReq, mockRes);
      expect(mockRes._getJSONData()).toEqual(roleServiceUserRolesForCourseObject);
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
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.projectId = '1';

      spies.roleServiceGetUserRolesForProject.mockResolvedValueOnce(roleServiceUserRolesForCourseObject);
      await role.getUserRolesForProject(mockReq, mockRes);
      expect(mockRes._getJSONData()).toEqual(roleServiceUserRolesForCourseObject);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('updateUserRoleForCourse', () => {
    it('should return status 400 BAD REQUEST if the course Id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
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
        userRole: 1,
      };

      await role.updateUserRoleForCourse(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ error: 'Please provide a valid User Id! User Id cannot be undefined.' });
    });

    it('should return HTTP 200 OK if the query is successful', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.courseId = '1';
      mockReq.body = {
        userRole: 1,
        userId: 1,
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
        userRole: 1,
      };

      await role.updateUserRoleForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({ error: 'Please provide a valid User Id! User Id cannot be undefined.' });
    });

    it('should return HTTP 200 OK if the query is successful', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.params.projectId = '1';
      mockReq.body = {
        userRole: 1,
        userId: 1,
      };

      spies.roleServiceUpdateUserRoleForProject.mockResolvedValueOnce();
      await role.updateUserRoleForProject(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('updateUserRole', () => {
    it('should return status 400 BAD REQUEST if the role id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userId: 1,
      };
      await role.updateUserRole(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'Please provide a valid Role id! Role id cannot be undefined.',
      });
    });

    it('should return status 400 BAD REQUEST if the User id was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        newRoleId: 1,
      };
      await role.updateUserRole(mockReq, mockRes);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(mockRes._getJSONData()).toEqual({
        error: 'User id must be a number',
      });
    });

    it('should return status 401 UNAUTHORISED if the user tries to modify their own role', async () => {
      const userSessionInformation: UserSession = {
        user_email: 'testUser@test.com',
        user_id: 1,
        user_is_admin: true,
        session_id: 'testSessionId',
        user_role_id: 1,
        session_expiry: new Date('2022-08-31T15:19:39.104Z'),
      };
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        newRoleId: 1,
        userId: 1,
      };
      mockRes.locals.userSession = userSessionInformation;
      await role.updateUserRole(mockReq, mockRes);
      const jsonData = mockRes._getJSONData();
      expect(jsonData.error).toEqual('Admin cannot modify their own role');
      expect(mockRes.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    });

    it('should update the uers role if the query was successful', async () => {
      const userSessionInformation: UserSession = {
        user_email: 'testAdmin@test.com',
        user_id: 2,
        user_is_admin: true,
        session_id: 'testSessionId',
        user_role_id: 1,
        session_expiry: new Date('2022-08-31T15:19:39.104Z'),
      };
      const roleServiceResponseObject: UsersOnRoles = {
        role_id: 1,
        user_id: 1,
      };
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        newRoleId: 1,
        userId: 1,
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
