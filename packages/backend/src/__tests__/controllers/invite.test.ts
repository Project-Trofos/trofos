import { createRequest, createResponse } from 'node-mocks-http';
import invite from '../../services/invite.service';
import project from '../../services/project.service';
import course from '../../services/course.service';
import user from '../../services/user.service';
import inviteController from '../../controllers/invite';
import { UsersOnRolesOnCourses, UsersOnProjects } from '@prisma/client';
import { STUDENT_ROLE_ID } from '../../helpers/constants';
import {
  expiredInviteData,
  mockInviteInfoFromProjId,
  updatedInviteData,
  validInviteData,
  validInviteProject,
  validUser,
} from '../mocks/inviteData';
import ses from '../../aws/ses';
import StatusCodes from 'http-status-codes';

const spies = {
  getInvite: jest.spyOn(invite, 'getInvite'),
  getInviteByToken: jest.spyOn(invite, 'getInviteByToken'),
  getInviteByProjectId: jest.spyOn(invite, 'getInviteByProjectId'),
  createInvite: jest.spyOn(invite, 'createInvite'),
  updateInvite: jest.spyOn(invite, 'updateInvite'),
  deleteInvite: jest.spyOn(invite, 'deleteInvite'),

  getById: jest.spyOn(project, 'getById'),
  addUserToProj: jest.spyOn(project, 'addUserByInvite'),
  addUserToCourse: jest.spyOn(course, 'addUser'),
  getCourseUsers: jest.spyOn(course, 'getUsers'),
  getByEmail: jest.spyOn(user, 'getByEmail'),
  findByEmail: jest.spyOn(user, 'findByEmail'),

  isSESEnabled: jest.spyOn(ses, 'isSESEnabled'),
  sendInviteEmail: jest.spyOn(ses, 'sendInviteEmail'),
};

describe('invite controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const senderData = {
    senderName: 'senderMock',
    senderEmail: 'mockSender@test.com',
  };

  // Mock data for users on courses
  const usersCourseData: UsersOnRolesOnCourses = { id: 1, course_id: 1, user_id: 1, role_id: STUDENT_ROLE_ID };

  // Mock data for users on projects
  const usersProjectData: UsersOnProjects = { project_id: 1, user_id: 1, created_at: new Date(Date.now()) };

  describe('sendInvite', () => {
    it('should create invite', async () => {
      spies.getInvite.mockResolvedValue(null);
      spies.getById.mockResolvedValue(validInviteProject);
      spies.createInvite.mockResolvedValue(validInviteData);

      // Pretend send email
      spies.isSESEnabled.mockReturnValue(true);
      spies.sendInviteEmail.mockImplementation(async (email, pname, token) => {});

      const mockReq = createRequest({
        params: {
          projectId: validInviteData.project_id,
        },
        body: {
          senderName: senderData.senderName,
          senderEmail: senderData.senderEmail,
          destEmail: validInviteData.email,
        },
      });
      const mockRes = createResponse();

      await inviteController.sendInvite(mockReq, mockRes);

      expect(spies.createInvite).toHaveBeenCalled();
      expect(spies.updateInvite).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(validInviteData));
    });

    it('should update invite', async () => {
      spies.getInvite.mockResolvedValue(expiredInviteData);
      spies.getById.mockResolvedValue(validInviteProject);
      spies.updateInvite.mockResolvedValue(updatedInviteData);

      // Pretend send email
      spies.isSESEnabled.mockReturnValue(true);
      spies.sendInviteEmail.mockImplementation(async (email, pname, token) => {});

      const mockReq = createRequest({
        params: {
          projectId: validInviteData.project_id,
        },
        body: {
          senderName: senderData.senderName,
          senderEmail: senderData.senderEmail,
          destEmail: validInviteData.email,
        },
      });
      const mockRes = createResponse();

      await inviteController.sendInvite(mockReq, mockRes);

      expect(spies.updateInvite).toHaveBeenCalled();
      expect(spies.createInvite).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(updatedInviteData));

      // New token generated
      expect(mockRes._getData().unique_token).not.toEqual(expiredInviteData.unique_token);
    });
  });

  describe('processInvite', () => {
    it('should add user to course and project', async () => {
      spies.getInviteByToken.mockResolvedValue(validInviteData);
      spies.getById.mockResolvedValue(validInviteProject);
      spies.getCourseUsers.mockResolvedValue(Array.of());
      spies.getByEmail.mockResolvedValue(validUser);
      spies.addUserToCourse.mockResolvedValue(usersCourseData);
      spies.addUserToProj.mockResolvedValue(usersProjectData);
      spies.deleteInvite.mockResolvedValue(validInviteData);

      const mockReq = createRequest({
        params: {
          token: validInviteData.unique_token,
        },
      });
      const mockRes = createResponse();

      await inviteController.processInvite(mockReq, mockRes);

      expect(spies.addUserToCourse).toHaveBeenCalled();
      expect(spies.addUserToProj).toHaveBeenCalled();
      expect(spies.deleteInvite).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(validInviteData));
    });

    it('should reject expired invite', async () => {
      spies.getInviteByToken.mockResolvedValue(expiredInviteData);

      // Mock delete invite
      const mockReq = createRequest({
        params: {
          token: expiredInviteData.unique_token,
        },
      });
      const mockRes = createResponse();

      await inviteController.processInvite(mockReq, mockRes);

      expect(spies.addUserToCourse).not.toHaveBeenCalled();
      expect(spies.addUserToProj).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('should return error if no token provided', async () => {
      const mockReq = createRequest({
        params: {},
      });
      const mockRes = createResponse();

      await inviteController.processInvite(mockReq, mockRes);

      expect(spies.addUserToCourse).not.toHaveBeenCalled();
      expect(spies.addUserToProj).not.toHaveBeenCalled();
      expect(spies.deleteInvite).not.toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
  });

  describe('getInfoFromInvite', () => {
    it('should return existing info', async () => {
      spies.getInviteByToken.mockResolvedValue(validInviteData);
      spies.findByEmail.mockResolvedValue(validUser);
      const mockReq = createRequest({
        params: {
          token: validInviteData.unique_token,
        },
      });
      const mockRes = createResponse();

      await inviteController.getInfoFromInvite(mockReq, mockRes);

      const expected = {
        exists: true,
        email: validInviteData.email,
      };

      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(expected));
    });

    it('should return non existing info', async () => {
      spies.getInviteByToken.mockResolvedValue(validInviteData);
      spies.findByEmail.mockResolvedValue(null);
      const mockReq = createRequest({
        params: {
          token: validInviteData.unique_token,
        },
      });
      const mockRes = createResponse();

      await inviteController.getInfoFromInvite(mockReq, mockRes);

      const expected = {
        exists: false,
        email: validInviteData.email,
      };

      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(expected));
    });
  });

  describe('getInfoFromProjectId', () => {
    it('should return all invites of a project', async () => {
      spies.getInviteByProjectId.mockResolvedValue(mockInviteInfoFromProjId);

      const mockReq = createRequest({
        params: {
          projectId: mockInviteInfoFromProjId[0].project_id,
        },
      });
      const mockRes = createResponse();

      await inviteController.getInfoFromProjectId(mockReq, mockRes);

      expect(spies.getInviteByProjectId).toHaveBeenCalled();
      expect(mockRes.statusCode).toEqual(StatusCodes.OK);
      expect(mockRes._getData()).toEqual(JSON.stringify(mockInviteInfoFromProjId));
    });
  });
});
