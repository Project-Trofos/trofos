import express from 'express';
import StatusCodes from 'http-status-codes';
import authentication from '../../controllers/authentication';
import sessionService from '../../services/session.service';
import authenticationService from '../../services/authentication.service';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

const authenticationServiceValidateUserSpy = jest.spyOn(authenticationService, 'validateUser');
const sessionServiceCreateUserSessionSpy = jest.spyOn(sessionService, 'createUserSession');
const sessionServiceDeleteUserSessionSpy = jest.spyOn(sessionService, 'deleteUserSession');
const sessionServiceGetUserSessionSpy = jest.spyOn(sessionService, 'getUserSession');

beforeEach(() => {
  authenticationServiceValidateUserSpy.mockReset()
  sessionServiceCreateUserSessionSpy.mockReset()
  sessionServiceDeleteUserSessionSpy.mockReset()
  sessionServiceGetUserSessionSpy.mockReset()
})

describe('authentication.loginUser tests', () => {
  test('UserNotValid_HTTP401Returned', async () => {
    authenticationServiceValidateUserSpy.mockResolvedValueOnce(false);
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
    authenticationServiceValidateUserSpy.mockResolvedValueOnce(true);
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
    expect(sessionServiceCreateUserSessionSpy).toHaveBeenCalledWith(testUserEmail);
    expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  test('UserValid_SessionReturned', async () => {
    const sessionId = 'testSession';
    authenticationServiceValidateUserSpy.mockResolvedValueOnce(true);
    sessionServiceCreateUserSessionSpy.mockResolvedValueOnce(sessionId);
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
    expect(sessionServiceCreateUserSessionSpy).toHaveBeenCalledWith(testUserEmail);
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
    }
    sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObjecet);
    const testCookie = 'testCookie';
    const mockRequest = {
      cookies : {
        [TROFOS_SESSIONCOOKIE_NAME] : testCookie,
      },
    } as express.Request;
    const mockResponse = {
      send() {},
      json(j: any) { this.json = j; return this },
      status(s : number) {this.statusCode = s; return this;},
    } as express.Response;
    await authentication.getUserInfo(mockRequest, mockResponse);
    expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
    expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
    expect(mockResponse.json).toEqual({ userEmail : 'testUser@test.com' })
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
    await authentication.getUserInfo(mockRequest, mockResponse);
    expect(sessionServiceGetUserSessionSpy).toBeCalledTimes(0);
    expect(mockResponse.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
  });
});