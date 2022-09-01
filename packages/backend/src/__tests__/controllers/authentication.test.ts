import express from 'express';
import StatusCodes from 'http-status-codes';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import authentication from '../../controllers/authentication';
import sessionService from '../../services/session.service';
import authenticationService from '../../services/authentication.service';



const authenticationServiceValidateUserSpy = jest.spyOn(authenticationService, 'validateUser');
const sessionServiceCreateUserSessionSpy = jest.spyOn(sessionService, 'createUserSession');
const prismaMock = mockDeep<PrismaClient>();

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
    await authentication.loginUser(mockRequest, mockResponse, prismaMock);
    expect(authenticationServiceValidateUserSpy).toHaveBeenCalledWith(testUserEmail, testUserPassword, prismaMock);
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
    await authentication.loginUser(mockRequest, mockResponse, prismaMock);
    expect(authenticationServiceValidateUserSpy).toHaveBeenCalledWith(testUserEmail, testUserPassword, prismaMock);
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
    await authentication.loginUser(mockRequest, mockResponse, prismaMock);
    expect(authenticationServiceValidateUserSpy).toHaveBeenCalledWith(testUserEmail, testUserPassword, prismaMock);
    expect(sessionServiceCreateUserSessionSpy).toHaveBeenCalledWith(testUserEmail, prismaMock);
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
    await authentication.loginUser(mockRequest, mockResponse, prismaMock);
    expect(authenticationServiceValidateUserSpy).toHaveBeenCalledWith(testUserEmail, testUserPassword, prismaMock);
    expect(sessionServiceCreateUserSessionSpy).toHaveBeenCalledWith(testUserEmail, prismaMock);
    expect(mockResponse.statusCode).toEqual(StatusCodes.OK);
  });
});