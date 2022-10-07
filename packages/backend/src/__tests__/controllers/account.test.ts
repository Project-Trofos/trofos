import express from 'express';
import StatusCodes from 'http-status-codes';
import authentication from '../../controllers/account';
import sessionService from '../../services/session.service';
import authenticationService from '../../services/authentication.service';
import roleService from '../../services/role.service';
import { UserAuth } from '../../services/types/authentication.service.types';
import { createRequest, createResponse } from 'node-mocks-http';
import accountService from '../../services/account.service';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

const authenticationServiceValidateUserSpy = jest.spyOn(authenticationService, 'validateUser');
const sessionServiceCreateUserSessionSpy = jest.spyOn(sessionService, 'createUserSession');
const sessionServiceDeleteUserSessionSpy = jest.spyOn(sessionService, 'deleteUserSession');
const sessionServiceGetUserSessionSpy = jest.spyOn(sessionService, 'getUserSession');
const roleServiceGetUserRoleId = jest.spyOn(roleService, 'getUserRoleId');
const accountServiceChangePasswordSpy = jest.spyOn(accountService, 'changePassword')


beforeEach(() => {
  authenticationServiceValidateUserSpy.mockReset();
  sessionServiceCreateUserSessionSpy.mockReset();
  sessionServiceDeleteUserSessionSpy.mockReset();
  sessionServiceGetUserSessionSpy.mockReset();
  roleServiceGetUserRoleId.mockReset();
  accountServiceChangePasswordSpy.mockReset();
});

describe('authentication.loginUser tests', () => {
  test('UserNotValid_HTTP401Returned', async () => {
    authenticationServiceValidateUserSpy.mockResolvedValueOnce({
      isValidUser : false
    });
    const testUserEmail = 'testEmail@test.com';
    const testUserPassword = 'testPassword';
    const mockRequest = {
      body : {
        userEmail : testUserEmail,
        userPassword : testUserPassword,
      },
    } as express.Request;
    const mockResponse = {
      send() {},
      status(s : number) {this.statusCode = s; return this;},
    } as express.Response;
    await authentication.loginUser(mockRequest, mockResponse);
    expect(authenticationServiceValidateUserSpy).toHaveBeenCalledWith(testUserEmail, testUserPassword);
    expect(sessionServiceCreateUserSessionSpy).toHaveBeenCalledTimes(0);
    expect(mockResponse.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
  });

  test('UserNotValid_ValidateUserThrowsError_HTTP500Returned', async () => {
    const validateUserError = new Error('test error');
    authenticationServiceValidateUserSpy.mockRejectedValueOnce(validateUserError);
    const testUserEmail = 'testEmail@test.com';
    const testUserPassword = 'testPassword';
    const mockRequest = {
      body : {
        userEmail : testUserEmail,
        userPassword : testUserPassword,
      },
    } as express.Request;
    const mockResponse = {
      send() {},
      status(s : number) {this.statusCode = s; return this;},
    } as express.Response;
    await authentication.loginUser(mockRequest, mockResponse);
    expect(authenticationServiceValidateUserSpy).toHaveBeenCalledWith(testUserEmail, testUserPassword);
    expect(sessionServiceCreateUserSessionSpy).toHaveBeenCalledTimes(0);
    expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  test('UserValid_CreateUserSessionThrowsError_HTTP500Returned', async () => {
    const createUserSessionError = new Error('test error');
    roleServiceGetUserRoleId.mockResolvedValueOnce(1);
    authenticationServiceValidateUserSpy.mockResolvedValueOnce({
      isValidUser : true,
      userLoginInformation : {
        user_email : "testEmail@test.com",
        user_id : 1
      }
    } as UserAuth);
    sessionServiceCreateUserSessionSpy.mockRejectedValueOnce(createUserSessionError);
    const testUserEmail = 'testEmail@test.com';
    const testUserPassword = 'testPassword';
    const mockRequest = {
      body : {
        userEmail : testUserEmail,
        userPassword : testUserPassword,
      },
    } as express.Request;
    const mockResponse = {
      send() {},
      status(s : number) {this.statusCode = s; return this;},
    } as express.Response;
    await authentication.loginUser(mockRequest, mockResponse);
    expect(authenticationServiceValidateUserSpy).toHaveBeenCalledWith(testUserEmail, testUserPassword);
    expect(sessionServiceCreateUserSessionSpy).toHaveBeenCalledWith(testUserEmail, 1, 1);
    expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  test('UserValid_SessionReturned', async () => {
    const sessionId = 'testSession';
    authenticationServiceValidateUserSpy.mockResolvedValueOnce({
      isValidUser : true,
      userLoginInformation : {
        user_email : "testEmail@test.com",
        user_id : 1
      }
    } as UserAuth);
    sessionServiceCreateUserSessionSpy.mockResolvedValueOnce(sessionId);
    roleServiceGetUserRoleId.mockResolvedValueOnce(1);
    const testUserEmail = 'testEmail@test.com';
    const testUserPassword = 'testPassword';
    const mockRequest = {
      body : {
        userEmail : testUserEmail,
        userPassword : testUserPassword,
      },
    } as express.Request;
    const mockResponse = {
      send() {},
      status(s : number) {this.statusCode = s; return this;},
      cookie(_name : string, _val : string, _opts : any) {},
    } as express.Response;
    await authentication.loginUser(mockRequest, mockResponse);
    expect(authenticationServiceValidateUserSpy).toHaveBeenCalledWith(testUserEmail, testUserPassword);
    expect(sessionServiceCreateUserSessionSpy).toHaveBeenCalledWith(testUserEmail, 1, 1);
    expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
  });
});

describe('authentication.logoutUser tests', () => {
  test('SessionServiceThrowsError_HTTP500Returned', async () => {
    const deleteUserSessionError = new Error('No such session found');
    sessionServiceDeleteUserSessionSpy.mockRejectedValueOnce(deleteUserSessionError);
    const testCookie = 'testCookie';
    const mockRequest = {
      cookies : {
        [TROFOS_SESSIONCOOKIE_NAME] : testCookie,
      },
    } as express.Request;
    const mockResponse = {
      send() {},
      status(s : number) {this.statusCode = s; return this;},
    } as express.Response;
    await authentication.logoutUser(mockRequest, mockResponse);
    expect(sessionServiceDeleteUserSessionSpy).toHaveBeenCalledWith(testCookie);
    expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  test('ValidSessionId_HTTP200Returned', async () => {
    sessionServiceDeleteUserSessionSpy.mockResolvedValueOnce();
    const testCookie = 'testCookie';
    const mockRequest = {
      cookies : {
        [TROFOS_SESSIONCOOKIE_NAME] : testCookie,
      },
    } as express.Request;
    const mockResponse = {
      send() {},
      status(s : number) {this.statusCode = s; return this;},
    } as express.Response;
    await authentication.logoutUser(mockRequest, mockResponse);
    expect(sessionServiceDeleteUserSessionSpy).toHaveBeenCalledWith(testCookie);
    expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
  });

  test('NoSessionInRequest_HTTP401Returned', async () => {
    const mockRequest = {
      cookies : {
      },
    } as express.Request;
    const mockResponse = {
      send() {},
      status(s : number) {this.statusCode = s; return this;},
    } as express.Response;
    await authentication.logoutUser(mockRequest, mockResponse);
    expect(sessionServiceDeleteUserSessionSpy).toBeCalledTimes(0);
    expect(mockResponse.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
  });
});

describe('authentication.getUserInfo tests', () => {
  test('SessionServiceThrowsError_HTTP500Returned', async () => {
    const getUserSessionError = new Error('No such session found');
    sessionServiceGetUserSessionSpy.mockRejectedValueOnce(getUserSessionError);
    const testCookie = 'testCookie';
    const mockRequest = {
      cookies : {
        [TROFOS_SESSIONCOOKIE_NAME] : testCookie,
      },
    } as express.Request;
    const mockResponse = {
      send() {},
      status(s : number) {this.statusCode = s; return this;},
    } as express.Response;
    await authentication.getUserInfo(mockRequest, mockResponse);
    expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
    expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  test('ValidSessionId_HTTP200Returned', async () => {
    const sessionServiceResponseObjecet = {
      session_id : 'testSessionId',
      user_email : 'testUser@test.com',
      session_expiry : new Date('2022-08-31T15:19:39.104Z'),
      user_role_id: 1,
      user_id: 1
    };
    sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObjecet);
    const testCookie = 'testCookie';
    const mockRequest = {
      cookies : {
        [TROFOS_SESSIONCOOKIE_NAME] : testCookie,
      },
    } as express.Request;
    const mockResponse = {
      send() {},
      json(j: any) { this.json = j; return this; },
      status(s : number) {this.statusCode = s; return this;},
    } as express.Response;
    await authentication.getUserInfo(mockRequest, mockResponse);
    expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
    expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
    expect(mockResponse.json).toEqual({ userEmail : 'testUser@test.com', userId: 1, userRole : 1});
  });

  describe("changePassword", () => {
    it("should return status 200 OK if the user's password was successfully changes", async () => {
    const changePasswordResponseObject = {
      user_email: "testEmail@test.com",
      user_id: 1,
      user_password_hash: "testPassword"
    }
    accountServiceChangePasswordSpy.mockResolvedValueOnce(changePasswordResponseObject)
    const mockReq = createRequest()
    const mockRes = createResponse()
    mockReq.body = {
      userId : 1,
      newUserPassword : "testPassword"
    }
    await authentication.changePassword(mockReq, mockRes);
    expect(accountServiceChangePasswordSpy).toHaveBeenCalledWith(1, "testPassword")
    expect(mockRes.statusCode).toEqual(StatusCodes.OK)
    expect(mockRes._getData()).toEqual({ message : "Password successfully changed" });
    })

    it("should return status 500 INTERNAL SERVER ERROR if an error occured while updating the user's password", async () => {
      const changePasswordError = new Error('Unable to change password');
      accountServiceChangePasswordSpy.mockRejectedValueOnce(changePasswordError)
      const mockReq = createRequest()
      const mockRes = createResponse()
      mockReq.body = {
        userId : 1,
        newUserPassword : "testPassword"
      }
      await authentication.changePassword(mockReq, mockRes);
      expect(accountServiceChangePasswordSpy).toHaveBeenCalledWith(1, "testPassword")
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(mockRes._getData()).toEqual({ error : "Error while changing password" });
    })
  })
});