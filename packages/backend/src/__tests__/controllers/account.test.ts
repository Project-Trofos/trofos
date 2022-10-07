import express from 'express';
import StatusCodes from 'http-status-codes';
import authentication from '../../controllers/account';
import sessionService from '../../services/session.service';
import authenticationService from '../../services/authentication.service';
import roleService from '../../services/role.service';
import { UserAuth } from '../../services/types/authentication.service.types';
import { createRequest, createResponse } from 'node-mocks-http';
import accountService from '../../services/account.service';
import cookieParser from 'cookie-parser';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

const spies = {
  authenticationServiceValidateUser : jest.spyOn(authenticationService, 'validateUser'),
  sessionServiceCreateUserSession : jest.spyOn(sessionService, 'createUserSession'),
  sessionServiceDeleteUserSession : jest.spyOn(sessionService, 'deleteUserSession'),
  sessionServiceGetUserSession : jest.spyOn(sessionService, 'getUserSession'),
  roleServiceGetUserRoleId : jest.spyOn(roleService, 'getUserRoleId'),
  accountServiceChangePassword : jest.spyOn(accountService, 'changePassword')
}

afterEach(() => {
  jest.clearAllMocks();
});

describe("account.controller tests", () => {


  describe("loginUser", () => {
    it("should return status 401 UNAUTHORISED if the user is not valid", async () => {
      spies.authenticationServiceValidateUser.mockResolvedValueOnce({
        isValidUser : false
      });
      const testUserEmail = 'testEmail@test.com';
      const testUserPassword = 'testPassword';
      const mockReq = createRequest()
      const mockRes = createResponse()
      mockReq.body = {
        userEmail : testUserEmail,
        userPassword : testUserPassword,
      }
      await authentication.loginUser(mockReq, mockRes);
      expect(spies.authenticationServiceValidateUser).toHaveBeenCalledWith(testUserEmail, testUserPassword);
      expect(spies.sessionServiceCreateUserSession).toHaveBeenCalledTimes(0);
      expect(mockRes.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    })

    it("should return status 500 INTERNAL SERVER ERROR if an error occurs during validation", async () => {
      const validateUserError = new Error('test error');
      spies.authenticationServiceValidateUser.mockRejectedValueOnce(validateUserError);
      const testUserEmail = 'testEmail@test.com';
      const testUserPassword = 'testPassword';
      const mockReq = createRequest()
      const mockRes = createResponse()
      mockReq.body = {
        userEmail : testUserEmail,
        userPassword : testUserPassword,
      }
      await authentication.loginUser(mockReq, mockRes);
      expect(spies.authenticationServiceValidateUser).toHaveBeenCalledWith(testUserEmail, testUserPassword);
      expect(spies.sessionServiceCreateUserSession).toHaveBeenCalledTimes(0);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    })

    it("should return status 500 INTERNAL SERVER ERROR if an error occurs during session creation", async () => {
      const createUserSessionError = new Error('test error');
      spies.roleServiceGetUserRoleId.mockResolvedValueOnce(1);
      spies.authenticationServiceValidateUser.mockResolvedValueOnce({
        isValidUser : true,
        userLoginInformation : {
          user_email : "testEmail@test.com",
          user_id : 1
        }
      } as UserAuth);
      spies.sessionServiceCreateUserSession.mockRejectedValueOnce(createUserSessionError);
      const testUserEmail = 'testEmail@test.com';
      const testUserPassword = 'testPassword';
      const mockReq = createRequest()
      const mockRes = createResponse()
      mockReq.body = {
        userEmail : testUserEmail,
        userPassword : testUserPassword,
      }
      await authentication.loginUser(mockReq, mockRes);
      expect(spies.authenticationServiceValidateUser).toHaveBeenCalledWith(testUserEmail, testUserPassword);
      expect(spies.sessionServiceCreateUserSession).toHaveBeenCalledWith(testUserEmail, 1, 1);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    })

    it("should return status 200 OK if the user successfully logs in", async () => {
      const sessionId = 'testSession';
      spies.authenticationServiceValidateUser.mockResolvedValueOnce({
        isValidUser : true,
        userLoginInformation : {
          user_email : "testEmail@test.com",
          user_id : 1
        }
      } as UserAuth);
      spies.sessionServiceCreateUserSession.mockResolvedValueOnce(sessionId);
      spies.roleServiceGetUserRoleId.mockResolvedValueOnce(1);
      const testUserEmail = 'testEmail@test.com';
      const testUserPassword = 'testPassword';
      const mockReq = createRequest()
      const mockRes = createResponse()
      mockReq.body = {
        userEmail : testUserEmail,
        userPassword : testUserPassword,
      }
      await authentication.loginUser(mockReq, mockRes);
      expect(spies.authenticationServiceValidateUser).toHaveBeenCalledWith(testUserEmail, testUserPassword);
      expect(spies.sessionServiceCreateUserSession).toHaveBeenCalledWith(testUserEmail, 1, 1);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    })
  })

  describe("logoutUser", () => {
    it("should return status 500 INTERNAL SERVER ERROR if an error occurs while deleting the session", async () => {
      const deleteUserSessionError = new Error('No such session found');
      spies.sessionServiceDeleteUserSession.mockRejectedValueOnce(deleteUserSessionError);
      const testCookie = 'testCookie';
      const mockReq = createRequest({
        cookies : {
          [TROFOS_SESSIONCOOKIE_NAME] : testCookie
        }
      })
      const mockRes = createResponse()
      await authentication.logoutUser(mockReq, mockRes);
      expect(spies.sessionServiceDeleteUserSession).toHaveBeenCalledWith(testCookie);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    })

    it("should return status 200 OK if the user successfully logs out", async () => {
      spies.sessionServiceDeleteUserSession.mockResolvedValueOnce();
      const testCookie = 'testCookie';
      const mockReq = createRequest({
        cookies : {
          [TROFOS_SESSIONCOOKIE_NAME] : testCookie
        }
      })
      const mockRes = createResponse()
      await authentication.logoutUser(mockReq, mockRes);
      expect(spies.sessionServiceDeleteUserSession).toHaveBeenCalledWith(testCookie);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
    })
  })

  describe("getUserInfo", () => {
    it("should return status 500 INTERNAL SERVER ERROR if an error occurs while fetching the user session", async () => {
      const getUserSessionError = new Error('No such session found');
      spies.sessionServiceGetUserSession.mockRejectedValueOnce(getUserSessionError);
      const testCookie = 'testCookie';
      const mockReq = createRequest({
        cookies : {
          [TROFOS_SESSIONCOOKIE_NAME] : testCookie
        }
      })
      const mockRes = createResponse()
      await authentication.getUserInfo(mockReq, mockRes);
      expect(spies.sessionServiceGetUserSession).toHaveBeenCalledWith(testCookie);
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    })

    it("should return status 200 OK if the user successfully fetches their userInfo", async () => {
      const sessionServiceResponseObjecet = {
        session_id : 'testSessionId',
        user_email : 'testUser@test.com',
        session_expiry : new Date('2022-08-31T15:19:39.104Z'),
        user_role_id: 1,
        user_id: 1
      };
      spies.sessionServiceGetUserSession.mockResolvedValueOnce(sessionServiceResponseObjecet);
      const testCookie = 'testCookie';
      const mockReq = createRequest({
        cookies : {
          [TROFOS_SESSIONCOOKIE_NAME] : testCookie
        }
      })
      const mockRes = createResponse()
      await authentication.getUserInfo(mockReq, mockRes);
      expect(spies.sessionServiceGetUserSession).toHaveBeenCalledWith(testCookie);
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getJSONData()).toEqual({ userEmail : 'testUser@test.com', userId: 1, userRole : 1});
    })
  })

  describe("changePassword", () => {
    it("should return status 200 OK if the user's password was successfully changes", async () => {
    const changePasswordResponseObject = {
      user_email: "testEmail@test.com",
      user_id: 1,
      user_password_hash: "testPassword"
    }
    spies.accountServiceChangePassword.mockResolvedValueOnce(changePasswordResponseObject)
    const mockReq = createRequest()
    const mockRes = createResponse()
    mockReq.body = {
      userId : 1,
      newUserPassword : "testPassword"
    }
    await authentication.changePassword(mockReq, mockRes);
    expect(spies.accountServiceChangePassword).toHaveBeenCalledWith(1, "testPassword")
    expect(mockRes.statusCode).toEqual(StatusCodes.OK)
    expect(mockRes._getData()).toEqual({ message : "Password successfully changed" });
    })

    it("should return status 500 INTERNAL SERVER ERROR if an error occured while updating the user's password", async () => {
      const changePasswordError = new Error('Unable to change password');
      spies.accountServiceChangePassword.mockRejectedValueOnce(changePasswordError)
      const mockReq = createRequest()
      const mockRes = createResponse()
      mockReq.body = {
        userId : 1,
        newUserPassword : "testPassword"
      }
      await authentication.changePassword(mockReq, mockRes);
      expect(spies.accountServiceChangePassword).toHaveBeenCalledWith(1, "testPassword")
      expect(mockRes.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(mockRes._getData()).toEqual({ error : "Error while changing password" });
    })
  })
})