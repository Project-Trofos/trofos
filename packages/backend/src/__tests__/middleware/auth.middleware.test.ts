import { Action } from '@prisma/client';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { isAuthorizedRequest } from '../../middleware/auth.middleware';
import roleService from '../../services/role.service';
import sessionService from '../../services/session.service';


const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

const sessionServiceGetUserSessionSpy = jest.spyOn(sessionService, 'getUserSession');
const roleServiceGeRoleActions = jest.spyOn(roleService, 'getRoleActions');

beforeEach(() => {
  sessionServiceGetUserSessionSpy.mockReset();
  roleServiceGeRoleActions.mockReset();
});



describe('auth.middleware tests', () => {
  describe('when an api request is made', () => {
    it('should reject the request is there is no session token', async () => {
      const mockRequest = {
        cookies : {
        },
      } as express.Request;
      const mockResponse = {
        send() {},
        status(s : number) {this.statusCode = s; return this;},
      } as express.Response;
      const mockNext = (jest.fn()) as express.NextFunction;
      await isAuthorizedRequest(Action.read_course)(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toBeCalledTimes(0);
      expect(roleServiceGeRoleActions).toBeCalledTimes(0);
      expect(mockResponse.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    });

    it('should reject the request if there is no such session', async () => {
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
      const mockNext = (jest.fn()) as express.NextFunction;
      await isAuthorizedRequest(Action.read_course)(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceGeRoleActions).toBeCalledTimes(0);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    }); 

    it('should reject the request if the user does not have the premissions to perform the action', async () => {
      const sessionServiceResponseObjecet = {
        session_id : 'testSessionId',
        user_email : 'testUser@test.com',
        session_expiry : new Date('2022-08-31T15:19:39.104Z'),
        user_role_id: 1,
      };
      const roleServiceResponseObject = [Action.create_course];
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObjecet);
      roleServiceGeRoleActions.mockResolvedValueOnce(roleServiceResponseObject);
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
      const mockNext = (jest.fn()) as express.NextFunction;
      await isAuthorizedRequest(Action.read_course)(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceGeRoleActions).toHaveBeenCalledWith(1);
      expect(mockResponse.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    });

    it('should call the next function if the session is valid and the user has the correct permissions', async () => {
      const sessionServiceResponseObjecet = {
        session_id : 'testSessionId',
        user_email : 'testUser@test.com',
        session_expiry : new Date('2022-08-31T15:19:39.104Z'),
        user_role_id: 1,
      };
      const roleServiceResponseObject : Action[] = [];
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObjecet);
      roleServiceGeRoleActions.mockResolvedValueOnce(roleServiceResponseObject);
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
      const mockNext = (jest.fn()) as express.NextFunction;
      await isAuthorizedRequest(null)(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceGeRoleActions).toHaveBeenCalledWith(1);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call the next function if the session is valid and the user has the correct permissions', async () => {
      const sessionServiceResponseObjecet = {
        session_id : 'testSessionId',
        user_email : 'testUser@test.com',
        session_expiry : new Date('2022-08-31T15:19:39.104Z'),
        user_role_id: 1,
      };
      const roleServiceResponseObject = [Action.read_course];
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObjecet);
      roleServiceGeRoleActions.mockResolvedValueOnce(roleServiceResponseObject);
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
      const mockNext = (jest.fn()) as express.NextFunction;
      await isAuthorizedRequest(Action.read_course)(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceGeRoleActions).toHaveBeenCalledWith(1);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});