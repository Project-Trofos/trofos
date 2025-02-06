import StatusCodes from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import authentication from '../../controllers/account';
import sessionService from '../../services/session.service';
import authenticationService from '../../services/authentication.service';
import roleService from '../../services/role.service';
import { UserAuth } from '../../services/types/authentication.service.types';
import accountService from '../../services/account.service';
import { RoleInformation } from '../../services/types/role.service.types';
import userService from '../../services/user.service';
import { userData } from '../mocks/userData';
import { User } from '@prisma/client';
import { getCachedIdp, getCachedSp, getCachedIdpStaff, getCachedSpStaff } from '../../helpers/ssoHelper';
import { UpdateUserData } from '../../helpers/types/user.service.types';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';
const MOCK_CODE = 'mockCode';
const MOCK_STATE = 'mockState';
const MOCK_CALLBACK_URL = 'mockUrl';

const spies = {
  authenticationServiceValidateUser: jest.spyOn(authenticationService, 'validateUser'),
  authenticationServiceOauth2Handler: jest.spyOn(authenticationService, 'oauth2Handler'),
  authenticationServiceSamlHandler: jest.spyOn(authenticationService, 'samlHandler'),
  sessionServiceCreateUserSession: jest.spyOn(sessionService, 'createUserSession'),
  sessionServiceDeleteUserSession: jest.spyOn(sessionService, 'deleteUserSession'),
  sessionServiceGetUserSession: jest.spyOn(sessionService, 'getUserSession'),
  roleServiceGetRoleInformation: jest.spyOn(roleService, 'getUserRoleInformation'),
  accountServiceChangePassword: jest.spyOn(accountService, 'changePassword'),
  accountServiceUpdateUser: jest.spyOn(accountService, 'updateUser'),
  userServiceGet: jest.spyOn(userService, 'get'),
};

jest.mock('../../helpers/ssoHelper');

let mockSp: any;
let mockIdp: any;

beforeEach(() => {
  mockSp = {
    createLoginRequest: jest.fn(),
    parseLoginResponse: jest.fn(),
  };
  mockIdp = {};

  (getCachedSp as jest.Mock).mockResolvedValue(mockSp);
  (getCachedIdp as jest.Mock).mockResolvedValue(mockIdp);
  (getCachedSpStaff as jest.Mock).mockResolvedValue(mockSp);
  (getCachedIdpStaff as jest.Mock).mockResolvedValue(mockIdp);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('account.controller tests', () => {
  describe('loginUser', () => {
    it('should return status 401 UNAUTHORISED if the user is not valid', async () => {
      spies.authenticationServiceValidateUser.mockResolvedValueOnce({
        isValidUser: false,
      });
      const testUserEmail = 'testEmail@test.com';
      const testUserPassword = 'testPassword';
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: testUserEmail,
        userPassword: testUserPassword,
      };
      await authentication.loginUser(mockReq, mockRes);
      expect(spies.authenticationServiceValidateUser).toHaveBeenCalledWith(testUserEmail, testUserPassword);
      expect(spies.sessionServiceCreateUserSession).toHaveBeenCalledTimes(0);
      expect(mockRes.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    });

    it('should return status 500 INTERNAL SERVER ERROR if an error occurs during validation', async () => {
      const validateUserError = new Error('test error');
      spies.authenticationServiceValidateUser.mockRejectedValueOnce(validateUserError);
      const testUserEmail = 'testEmail@test.com';
      const testUserPassword = 'testPassword';
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: testUserEmail,
        userPassword: testUserPassword,
      };
      await authentication.loginUser(mockReq, mockRes);
      expect(spies.authenticationServiceValidateUser).toHaveBeenCalledWith(testUserEmail, testUserPassword);
      expect(spies.sessionServiceCreateUserSession).toHaveBeenCalledTimes(0);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return status 500 INTERNAL SERVER ERROR if an error occurs during session creation', async () => {
      const createUserSessionError = new Error('test error');
      const roleInformation: RoleInformation = {
        roleId: 1,
        roleActions: [],
        isAdmin: false,
      };
      spies.roleServiceGetRoleInformation.mockResolvedValueOnce(roleInformation);
      spies.authenticationServiceValidateUser.mockResolvedValueOnce({
        isValidUser: true,
        userLoginInformation: {
          user_email: 'testEmail@test.com',
          user_id: 1,
        },
      } as UserAuth);
      spies.sessionServiceCreateUserSession.mockRejectedValueOnce(createUserSessionError);
      const testUserEmail = 'testEmail@test.com';
      const testUserPassword = 'testPassword';
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: testUserEmail,
        userPassword: testUserPassword,
      };
      await authentication.loginUser(mockReq, mockRes);
      expect(spies.authenticationServiceValidateUser).toHaveBeenCalledWith(testUserEmail, testUserPassword);
      expect(spies.sessionServiceCreateUserSession).toHaveBeenCalledWith(testUserEmail, roleInformation, 1);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return status 200 OK if the user successfully logs in', async () => {
      const sessionId = 'testSession';
      spies.authenticationServiceValidateUser.mockResolvedValueOnce({
        isValidUser: true,
        userLoginInformation: {
          user_email: 'testEmail@test.com',
          user_id: 1,
        },
      } as UserAuth);
      const roleInformation: RoleInformation = {
        roleId: 1,
        roleActions: [],
        isAdmin: false,
      };
      spies.sessionServiceCreateUserSession.mockResolvedValueOnce(sessionId);
      spies.roleServiceGetRoleInformation.mockResolvedValueOnce(roleInformation);
      const testUserEmail = 'testEmail@test.com';
      const testUserPassword = 'testPassword';
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userEmail: testUserEmail,
        userPassword: testUserPassword,
      };
      await authentication.loginUser(mockReq, mockRes);
      expect(spies.authenticationServiceValidateUser).toHaveBeenCalledWith(testUserEmail, testUserPassword);
      expect(spies.sessionServiceCreateUserSession).toHaveBeenCalledWith(testUserEmail, roleInformation, 1);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('oauth2Login', () => {
    it('should return status 400 BAD REQUEST if code was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        state: MOCK_STATE,
        callbackUrl: MOCK_CALLBACK_URL,
      };
      await authentication.oauth2Login(mockReq, mockRes);
      expect(spies.authenticationServiceOauth2Handler).toHaveBeenCalledTimes(0);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return status 400 BAD REQUEST if state was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        code: MOCK_CODE,
        callbackUrl: MOCK_CALLBACK_URL,
      };
      await authentication.oauth2Login(mockReq, mockRes);
      expect(spies.authenticationServiceOauth2Handler).toHaveBeenCalledTimes(0);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return status 400 BAD REQUEST if callbackUrl was not supplied', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        code: MOCK_CODE,
        state: MOCK_STATE,
      };
      await authentication.oauth2Login(mockReq, mockRes);
      expect(spies.authenticationServiceOauth2Handler).toHaveBeenCalledTimes(0);
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return status 500 INTERNAL SERVER ERROR if there was an error', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();
      const expectedError = new Error('Test Error');
      mockReq.body = {
        code: MOCK_CODE,
        state: MOCK_STATE,
        callbackUrl: MOCK_CALLBACK_URL,
      };
      spies.authenticationServiceOauth2Handler.mockRejectedValueOnce(expectedError);
      await authentication.oauth2Login(mockReq, mockRes);

      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return status 200 OK if the user successfully logs in', async () => {
      const sessionId = 'testSession';
      spies.authenticationServiceOauth2Handler.mockResolvedValueOnce(userData[0]);
      const roleInformation: RoleInformation = {
        roleId: 1,
        roleActions: [],
        isAdmin: false,
      };
      spies.sessionServiceCreateUserSession.mockResolvedValueOnce(sessionId);
      spies.roleServiceGetRoleInformation.mockResolvedValueOnce(roleInformation);
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        code: MOCK_CODE,
        state: MOCK_STATE,
        callbackUrl: MOCK_CALLBACK_URL,
      };
      await authentication.oauth2Login(mockReq, mockRes);

      expect(spies.authenticationServiceOauth2Handler).toHaveBeenCalledWith(MOCK_CODE, MOCK_STATE, MOCK_CALLBACK_URL);
      expect(spies.roleServiceGetRoleInformation).toHaveBeenCalledWith(userData[0].user_id);
      expect(spies.sessionServiceCreateUserSession).toHaveBeenCalledWith(
        userData[0].user_email,
        roleInformation,
        userData[0].user_id,
      );
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('logoutUser', () => {
    it('should return status 500 INTERNAL SERVER ERROR if an error occurs while deleting the session', async () => {
      const deleteUserSessionError = new Error('No such session found');
      spies.sessionServiceDeleteUserSession.mockRejectedValueOnce(deleteUserSessionError);
      const testCookie = 'testCookie';
      const mockReq = createRequest({
        cookies: {
          [TROFOS_SESSIONCOOKIE_NAME]: testCookie,
        },
      });
      const mockRes = createResponse();
      await authentication.logoutUser(mockReq, mockRes);
      expect(spies.sessionServiceDeleteUserSession).toHaveBeenCalledWith(testCookie);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return status 200 OK if the user successfully logs out', async () => {
      spies.sessionServiceDeleteUserSession.mockResolvedValueOnce();
      const testCookie = 'testCookie';
      const mockReq = createRequest({
        cookies: {
          [TROFOS_SESSIONCOOKIE_NAME]: testCookie,
        },
      });
      const mockRes = createResponse();
      await authentication.logoutUser(mockReq, mockRes);
      expect(spies.sessionServiceDeleteUserSession).toHaveBeenCalledWith(testCookie);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    });
  });

  describe('getUserInfo', () => {
    it('should return status 500 INTERNAL SERVER ERROR if an error occurs while fetching the user session', async () => {
      const getUserSessionError = new Error('No such session found');
      spies.sessionServiceGetUserSession.mockRejectedValueOnce(getUserSessionError);
      const testCookie = 'testCookie';
      const mockReq = createRequest({
        cookies: {
          [TROFOS_SESSIONCOOKIE_NAME]: testCookie,
        },
      });
      const mockRes = createResponse();
      await authentication.getUserInfo(mockReq, mockRes);
      expect(spies.sessionServiceGetUserSession).toHaveBeenCalledWith(testCookie);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return status 200 OK if the user successfully fetches their userInfo', async () => {
      const sessionServiceResponseObject = {
        session_id: 'testSessionId',
        user_email: 'testUser@test.com',
        session_expiry: new Date('2022-08-31T15:19:39.104Z'),
        user_role_id: 1,
        user_is_admin: false,
        user_id: 1,
      };
      const userRoleInformation = {
        roleId: 1,
        roleActions: [],
        isAdmin: false,
      };
      const user: User = {
        user_id: 1,
        user_email: 'testUser@test.com',
        user_password_hash: 'test',
        user_display_name: 'Test User',
        has_completed_tour: false,
      };
      spies.sessionServiceGetUserSession.mockResolvedValueOnce(sessionServiceResponseObject);
      spies.roleServiceGetRoleInformation.mockResolvedValueOnce(userRoleInformation);
      spies.userServiceGet.mockResolvedValueOnce(user);
      const testCookie = 'testCookie';
      const mockReq = createRequest({
        cookies: {
          [TROFOS_SESSIONCOOKIE_NAME]: testCookie,
        },
      });
      const mockRes = createResponse();
      await authentication.getUserInfo(mockReq, mockRes);
      expect(spies.sessionServiceGetUserSession).toHaveBeenCalledWith(testCookie);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getJSONData()).toEqual({
        userEmail: 'testUser@test.com',
        userId: 1,
        userRoleActions: [],
        userDisplayName: 'Test User',
        hasCompletedTour: false,
        userRoleId: 1,
      });
    });
  });

  describe('changePassword', () => {
    it("should return status 200 OK if the user's password was successfully changes", async () => {
      const changePasswordResponseObject: User = {
        user_email: 'testEmail@test.com',
        user_id: 1,
        user_password_hash: 'testPassword',
        user_display_name: 'Test User',
        has_completed_tour: true,
      };
      spies.accountServiceChangePassword.mockResolvedValueOnce(changePasswordResponseObject);
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userId: 1,
        newUserPassword: 'newTestPassword',
        oldUserPassword: 'oldTestPassword',
      };
      await authentication.changePassword(mockReq, mockRes);
      expect(spies.accountServiceChangePassword).toHaveBeenCalledWith(1, 'oldTestPassword', 'newTestPassword');
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual({ message: 'Password successfully changed' });
    });

    it("should return status 500 INTERNAL SERVER ERROR if an error occured while updating the user's password", async () => {
      const changePasswordError = new Error('Unable to change password');
      spies.accountServiceChangePassword.mockRejectedValueOnce(changePasswordError);
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userId: 1,
        newUserPassword: 'newTestPassword',
        oldUserPassword: 'oldTestPassword',
      };
      await authentication.changePassword(mockReq, mockRes);
      expect(spies.accountServiceChangePassword).toHaveBeenCalledWith(1, 'oldTestPassword', 'newTestPassword');
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockRes._getJSONData()).toEqual({ error: 'Unable to change password' });
    });
  });

  describe('updateUser', () => {
    it("should return status 200 OK if the user's data was successfully updated", async () => {
      const newDisplayName = 'New Test User';
      const updateUserResponseObject: User = {
        user_email: 'testEmail@test.com',
        user_id: 1,
        user_password_hash: 'testPassword',
        user_display_name: newDisplayName,
        has_completed_tour: false,
      };
      spies.accountServiceUpdateUser.mockResolvedValueOnce(updateUserResponseObject);
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userId: 1,
        displayName: newDisplayName,
      };
      const updatedData: UpdateUserData = { user_display_name: newDisplayName };

      await authentication.updateUser(mockReq, mockRes);
      expect(spies.accountServiceUpdateUser).toHaveBeenCalledWith(1, updatedData);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual({ message: 'User info successfully updated' });
    });

    it("should return status 500 INTERNAL SERVER ERROR if an error occured while updating the user's data", async () => {
      const newDisplayName = 'New Test User';
      const changeDisplayNameError = new Error('Unable to update user');
      spies.accountServiceUpdateUser.mockRejectedValueOnce(changeDisplayNameError);
      const mockReq = createRequest();
      const mockRes = createResponse();
      mockReq.body = {
        userId: 1,
        displayName: newDisplayName,
      };
      const updatedData: UpdateUserData = { user_display_name: newDisplayName };

      await authentication.updateUser(mockReq, mockRes);
      expect(spies.accountServiceUpdateUser).toHaveBeenCalledWith(1, updatedData);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockRes._getJSONData()).toEqual({ error: 'Unable to update user' });
    });
  });

  describe('generateSAMLRequest', () => {
    it('should return status 200 OK with a redirect URL', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();

      mockSp.createLoginRequest.mockReturnValue({
        id: '12345',
        context: 'https://example.com/login',
      });

      await authentication.generateSAMLRequest(mockReq, mockRes);

      expect(getCachedSp).toHaveBeenCalled();
      expect(getCachedIdp).toHaveBeenCalled();
      expect(mockSp.createLoginRequest).toHaveBeenCalledWith(mockIdp, 'redirect');
      expect(mockRes.statusCode).toBe(StatusCodes.OK);
      expect(mockRes._getJSONData()).toEqual({ redirectUrl: 'https://example.com/login' });
    });

    it('should return status 500 INTERNAL SERVER ERROR if an error occurs', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();

      (getCachedSp as jest.Mock).mockRejectedValue(new Error('Failed to fetch SP'));

      await authentication.generateSAMLRequest(mockReq, mockRes);

      expect(getCachedSp).toHaveBeenCalled();
      expect(getCachedIdp).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockRes._getJSONData()).toEqual({ error: 'Failed to fetch SP' });
    });
  });

  describe('generateSAMLRequestStaff', () => {
    it('should return status 200 OK with a redirect URL', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();

      mockSp.createLoginRequest.mockReturnValue({
        id: '67890',
        context: 'https://example.com/staff-login',
      });

      await authentication.generateSAMLRequestStaff(mockReq, mockRes);

      expect(getCachedSpStaff).toHaveBeenCalled();
      expect(getCachedIdpStaff).toHaveBeenCalled();
      expect(mockSp.createLoginRequest).toHaveBeenCalledWith(mockIdp, 'redirect');
      expect(mockRes.statusCode).toBe(StatusCodes.OK);
      expect(mockRes._getJSONData()).toEqual({ redirectUrl: 'https://example.com/staff-login' });
    });

    it('should return status 500 INTERNAL SERVER ERROR if an error occurs', async () => {
      const mockReq = createRequest();
      const mockRes = createResponse();

      (getCachedSpStaff as jest.Mock).mockRejectedValue(new Error('Failed to fetch Staff SP'));

      await authentication.generateSAMLRequestStaff(mockReq, mockRes);

      expect(getCachedSpStaff).toHaveBeenCalled();
      expect(getCachedIdpStaff).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockRes._getJSONData()).toEqual({ error: 'Failed to fetch Staff SP' });
    });
  });
});
