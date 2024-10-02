import { Action } from '@prisma/client';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { createRequest, createResponse } from 'node-mocks-http';
import { hasAuth, hasAuthForCourse, hasAuthForExternalApi, hasAuthForProject } from '../../middleware/auth.middleware';
import roleService from '../../services/role.service';
import sessionService from '../../services/session.service';
import policyEngine from '../../policies/policyEngine';
import { PolicyOutcome } from '../../policies/policyTypes';
import { UserRoleActionsForCourse } from '../../services/types/role.service.types';
import apiKeyService from '../../services/apiKey.service';
import { ApiKeyAuth, ApiKeyAuthIsValid } from '../../services/types/apiKey.service.types';

const TROFOS_SESSIONCOOKIE_NAME = 'trofos_sessioncookie';

const sessionServiceGetUserSessionSpy = jest.spyOn(sessionService, 'getUserSession');
const roleServiceIsActionAllowed = jest.spyOn(roleService, 'isActionAllowed');
const roleServiceGetUserRoleActionsForCourse = jest.spyOn(roleService, 'getUserRoleActionsForCourse');
const roleServiceGetUserRoleActionsForProject = jest.spyOn(roleService, 'getUserRoleActionsForProject');
const policyEngineSpy = jest.spyOn(policyEngine, 'execute');
const apiKeyServiceAuthApiKeySpy = jest.spyOn(apiKeyService, 'authenticateApiKey');
const policyEngineExternalApiCallSpy = jest.spyOn(policyEngine, 'executeExternalApiCall');

beforeEach(() => {
  sessionServiceGetUserSessionSpy.mockReset();
  roleServiceIsActionAllowed.mockReset();
  roleServiceGetUserRoleActionsForCourse.mockReset();
  roleServiceGetUserRoleActionsForProject.mockReset();
  policyEngineSpy.mockReset();
  apiKeyServiceAuthApiKeySpy.mockReset();
  policyEngineExternalApiCallSpy.mockReset();
});

// Mock data
const sessionServiceResponseObject = {
  session_id: 'testSessionId',
  user_email: 'testUser@test.com',
  session_expiry: new Date('2022-08-31T15:19:39.104Z'),
  user_role_id: 1,
  user_is_admin: false,
  user_id: 1,
};
const roleServiceUserRoleActionsForCourseObject: UserRoleActionsForCourse = {
  id: 1,
  user_id: 1,
  role_id: 1,
  course_id: 1,
  role: {
    id: 1,
    role_name: 'TEST_ROLE',
    actions: [
      {
        role_id: 1,
        action: Action.read_course,
      },
    ],
  },
};

describe('auth.middleware tests', () => {
  describe('when an api request is made', () => {
    it('should reject the request is there is no session token', async () => {
      const mockRequest = {
        cookies: {},
      } as express.Request;
      const mockResponse = {
        send() {},
        status(s: number) {
          this.statusCode = s;
          return this;
        },
      } as express.Response;
      const mockNext = jest.fn() as express.NextFunction;
      await hasAuth(Action.read_course, null)(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toBeCalledTimes(0);
      expect(roleServiceIsActionAllowed).toBeCalledTimes(0);
      expect(mockResponse.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    });

    it('should reject the request if there is no such session', async () => {
      const getUserSessionError = new Error('No such session found');
      sessionServiceGetUserSessionSpy.mockRejectedValueOnce(getUserSessionError);
      const testCookie = 'testCookie';
      const mockRequest = {
        cookies: {
          [TROFOS_SESSIONCOOKIE_NAME]: testCookie,
        },
      } as unknown as express.Request;
      const mockResponse = {
        send() {},
        status(s: number) {
          this.statusCode = s;
          return this;
        },
      } as express.Response;
      const mockNext = jest.fn() as express.NextFunction;
      await hasAuth(Action.read_course, null)(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceIsActionAllowed).toBeCalledTimes(0);
      expect(mockResponse.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should reject the request if the user does not have the premissions to perform the action', async () => {
      const roleServiceResponseObject = false;
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObject);
      roleServiceIsActionAllowed.mockResolvedValueOnce(roleServiceResponseObject);
      const testCookie = 'testCookie';
      const mockRequest = {
        cookies: {
          [TROFOS_SESSIONCOOKIE_NAME]: testCookie,
        },
      } as unknown as express.Request;
      const mockResponse = {
        send() {},
        json(j) {
          this.json = j;
          return this;
        },
        status(s: number) {
          this.statusCode = s;
          return this;
        },
      } as express.Response;
      const mockNext = jest.fn() as express.NextFunction;
      await hasAuth(Action.read_course, null)(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceIsActionAllowed).toHaveBeenCalledWith(1, Action.read_course);
      expect(mockResponse.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
    });

    it('should call the next function if the session is valid and the user does not need permissions', async () => {
      const roleServiceResponseObject = true;
      const policyEngineResponseObject = {
        isPolicyValid: true,
      } as PolicyOutcome;
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObject);
      roleServiceIsActionAllowed.mockResolvedValueOnce(roleServiceResponseObject);
      policyEngineSpy.mockResolvedValueOnce(policyEngineResponseObject);
      const testCookie = 'testCookie';
      const mockRequest = {
        cookies: {
          [TROFOS_SESSIONCOOKIE_NAME]: testCookie,
        },
      } as unknown as express.Request;
      const mockResponse = {
        send() {},
        json(j) {
          this.json = j;
          return this;
        },
        status(s: number) {
          this.statusCode = s;
          return this;
        },
        locals: {},
      } as express.Response;
      const mockNext = jest.fn() as express.NextFunction;
      await hasAuth(null, null)(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceIsActionAllowed).toHaveBeenCalledWith(1, null);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject the request if the user does not have permission to perform actions on this data', async () => {
      const roleServiceResponseObject = true;
      const policyEngineResponseObject = {
        isPolicyValid: false,
      } as PolicyOutcome;
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObject);
      roleServiceIsActionAllowed.mockResolvedValueOnce(roleServiceResponseObject);
      policyEngineSpy.mockResolvedValueOnce(policyEngineResponseObject);
      const testCookie = 'testCookie';
      const mockRequest = {
        cookies: {
          [TROFOS_SESSIONCOOKIE_NAME]: testCookie,
        },
      } as unknown as express.Request;
      const mockResponse = {
        send() {},
        json(j) {
          this.json = j;
          return this;
        },
        status(s: number) {
          this.statusCode = s;
          return this;
        },
        locals: {},
      } as express.Response;
      const mockNext = jest.fn() as express.NextFunction;
      await hasAuth(Action.read_course, 'TEST_POLICY')(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceIsActionAllowed).toHaveBeenCalledWith(1, Action.read_course);
      expect(policyEngineSpy).toHaveBeenCalledWith(mockRequest, sessionServiceResponseObject, 'TEST_POLICY');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call the next function if the session is valid and the user has permissions to perform actions on this data', async () => {
      const roleServiceResponseObject = true;
      const policyEngineResponseObject = {
        isPolicyValid: true,
      } as PolicyOutcome;
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObject);
      roleServiceIsActionAllowed.mockResolvedValueOnce(roleServiceResponseObject);
      policyEngineSpy.mockResolvedValueOnce(policyEngineResponseObject);
      const testCookie = 'testCookie';
      const mockRequest = {
        cookies: {
          [TROFOS_SESSIONCOOKIE_NAME]: testCookie,
        },
      } as unknown as express.Request;
      const mockResponse = {
        send() {},
        json(j) {
          this.json = j;
          return this;
        },
        status(s: number) {
          this.statusCode = s;
          return this;
        },
        locals: {},
      } as express.Response;
      const mockNext = jest.fn() as express.NextFunction;
      await hasAuth(Action.read_course, 'TEST_POLICY')(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceIsActionAllowed).toHaveBeenCalledWith(1, Action.read_course);
      expect(policyEngineSpy).toHaveBeenCalledWith(mockRequest, sessionServiceResponseObject, 'TEST_POLICY');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('when an api request is made for a particular course', () => {
    it('should reject the request if the user does not have permission to perform actions on this course', async () => {
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObject);
      roleServiceGetUserRoleActionsForCourse.mockResolvedValueOnce(roleServiceUserRoleActionsForCourseObject);

      const testCookie = 'testCookie';
      const mockRequest = createRequest();
      mockRequest.cookies[TROFOS_SESSIONCOOKIE_NAME] = testCookie;
      mockRequest.params.courseId = '1';
      const mockResponse = createResponse();

      const mockNext = jest.fn() as express.NextFunction;
      await hasAuthForCourse(Action.create_course, 'TEST_POLICY')(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceGetUserRoleActionsForCourse).toHaveBeenCalledWith(1, 1);
      expect(policyEngineSpy).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call the next function if the session is valid and the user has permissions to perform actions on this course', async () => {
      const policyEngineResponseObject = {
        isPolicyValid: true,
      } as PolicyOutcome;
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObject);
      roleServiceGetUserRoleActionsForCourse.mockResolvedValueOnce(roleServiceUserRoleActionsForCourseObject);
      policyEngineSpy.mockResolvedValueOnce(policyEngineResponseObject);
      const testCookie = 'testCookie';
      const mockRequest = createRequest();

      mockRequest.cookies[TROFOS_SESSIONCOOKIE_NAME] = testCookie;
      mockRequest.params.courseId = '1';
      const mockResponse = createResponse();

      const mockNext = jest.fn() as express.NextFunction;
      await hasAuthForCourse(Action.read_course, 'TEST_POLICY')(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceGetUserRoleActionsForCourse).toHaveBeenCalledWith(1, 1);
      expect(policyEngineSpy).toHaveBeenCalledWith(mockRequest, sessionServiceResponseObject, 'TEST_POLICY');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('when an api request is made for a particular project', () => {
    it('should reject the request if the user does not have permission to perform actions on this project', async () => {
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObject);
      roleServiceGetUserRoleActionsForProject.mockResolvedValueOnce(roleServiceUserRoleActionsForCourseObject);

      const testCookie = 'testCookie';
      const mockRequest = createRequest();
      mockRequest.cookies[TROFOS_SESSIONCOOKIE_NAME] = testCookie;
      mockRequest.params.projectId = '1';
      const mockResponse = createResponse();

      const mockNext = jest.fn() as express.NextFunction;
      await hasAuthForProject(Action.read_project, 'TEST_POLICY')(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceGetUserRoleActionsForProject).toHaveBeenCalledWith(1, 1);
      expect(policyEngineSpy).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call the next function if the session is valid and the user has permissions to perform actions on this project', async () => {
      const policyEngineResponseObject = {
        isPolicyValid: true,
      } as PolicyOutcome;
      sessionServiceGetUserSessionSpy.mockResolvedValueOnce(sessionServiceResponseObject);
      roleServiceGetUserRoleActionsForProject.mockResolvedValueOnce(roleServiceUserRoleActionsForCourseObject);
      policyEngineSpy.mockResolvedValueOnce(policyEngineResponseObject);
      const testCookie = 'testCookie';
      const mockRequest = createRequest();

      mockRequest.cookies[TROFOS_SESSIONCOOKIE_NAME] = testCookie;
      mockRequest.params.projectId = '1';
      const mockResponse = createResponse();

      const mockNext = jest.fn() as express.NextFunction;
      await hasAuthForProject(Action.read_course, 'TEST_POLICY')(mockRequest, mockResponse, mockNext);
      expect(sessionServiceGetUserSessionSpy).toHaveBeenCalledWith(testCookie);
      expect(roleServiceGetUserRoleActionsForProject).toHaveBeenCalledWith(1, 1);
      expect(policyEngineSpy).toHaveBeenCalledWith(mockRequest, sessionServiceResponseObject, 'TEST_POLICY');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('when an external api request is made', () => {
    it('should reject the request if the api key is not valid', async () => {
      const mockRequest = createRequest();
      const mockResponse = createResponse();
      const mockNext = jest.fn() as express.NextFunction;
      const notValidObj = {
        isValidUser: false,
      } as ApiKeyAuth;
      apiKeyServiceAuthApiKeySpy.mockResolvedValueOnce(notValidObj);
      await hasAuthForExternalApi(null, null)(mockRequest, mockResponse, mockNext);
      expect(apiKeyServiceAuthApiKeySpy).toHaveBeenCalledTimes(1);
      expect(mockResponse.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(mockNext).not.toHaveBeenCalled();
    });

    const validApiKeyAuth = {
      isValidUser: true,
      user_id: 1,
      user_email: 'test',
      role_id: 1,
      user_is_admin: false,
    } as ApiKeyAuthIsValid;

    it('should reject the request if it is not a valid action by role', async () => {
      const mockRequest = createRequest();
      const mockResponse = createResponse();
      const mockNext = jest.fn() as express.NextFunction;
      apiKeyServiceAuthApiKeySpy.mockResolvedValueOnce(validApiKeyAuth);
      roleServiceIsActionAllowed.mockResolvedValueOnce(false);
      await hasAuthForExternalApi(Action.read_course, 'TEST_POLICY')(mockRequest, mockResponse, mockNext);
      expect(apiKeyServiceAuthApiKeySpy).toHaveBeenCalledTimes(1);
      expect(roleServiceIsActionAllowed).toHaveBeenCalledTimes(1);
      expect(mockResponse.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject the request if the policy is not valid', async () => {
      const mockRequest = createRequest();
      const mockResponse = createResponse();
      const mockNext = jest.fn() as express.NextFunction;
      apiKeyServiceAuthApiKeySpy.mockResolvedValueOnce(validApiKeyAuth);
      roleServiceIsActionAllowed.mockResolvedValueOnce(true);
      policyEngineExternalApiCallSpy.mockResolvedValueOnce({ isPolicyValid: false } as PolicyOutcome);
      await hasAuthForExternalApi(Action.read_course, 'TEST_POLICY')(mockRequest, mockResponse, mockNext);
      expect(apiKeyServiceAuthApiKeySpy).toHaveBeenCalledTimes(1);
      expect(roleServiceIsActionAllowed).toHaveBeenCalledTimes(1);
      expect(policyEngineExternalApiCallSpy).toHaveBeenCalledTimes(1);
      expect(mockResponse.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call the next function if the api key is valid and the user has permissions to perform actions on this data', async () => {
      const policyEngineResponseObject = {
        isPolicyValid: true,
      } as PolicyOutcome;
      const mockRequest = createRequest();
      const mockResponse = createResponse();
      const mockNext = jest.fn() as express.NextFunction;
      apiKeyServiceAuthApiKeySpy.mockResolvedValueOnce(validApiKeyAuth);
      roleServiceIsActionAllowed.mockResolvedValueOnce(true);
      policyEngineExternalApiCallSpy.mockResolvedValueOnce(policyEngineResponseObject);
      await hasAuthForExternalApi(Action.read_course, 'TEST_POLICY')(mockRequest, mockResponse, mockNext);
      expect(apiKeyServiceAuthApiKeySpy).toHaveBeenCalledTimes(1);
      expect(roleServiceIsActionAllowed).toHaveBeenCalledTimes(1);
      expect(policyEngineExternalApiCallSpy).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalled();
    });
  })
});
