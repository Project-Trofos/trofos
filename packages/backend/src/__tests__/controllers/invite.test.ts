import { createRequest, createResponse } from 'node-mocks-http';
import { UsersOnProjects } from '@prisma/client';
import StatusCodes from 'http-status-codes';
import ses from '../../aws/ses';
import invite from '../../services/invite.service';
import project from '../../services/project.service';
import inviteController from '../../controllers/invite';
import {
  expiredInviteData,
  mockInviteInfoFromProjId,
  updatedInviteData,
  validInviteData,
  validInviteProject,
  validUser,
} from '../mocks/inviteData';

const spies = {
  getInviteByToken: jest.spyOn(invite, 'getInviteByToken'),
  getInviteByProjectId: jest.spyOn(invite, 'getInviteByProjectId'),
  createInvite: jest.spyOn(invite, 'createInvite'),
  updateInvite: jest.spyOn(invite, 'updateInvite'),
  getById: jest.spyOn(project, 'getById'),
  addUserToProject: jest.spyOn(project, 'addUserByInvite'),
  isESPEnabled: jest.spyOn(ses, 'isESPEnabled'),
  sendInviteEmail: jest.spyOn(ses, 'sendInviteEmail'),
};

describe('invite controller tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const usersProjectData: UsersOnProjects = {
    project_id: 1,
    user_id: 1,
    created_at: new Date(Date.now()),
  };

  describe('createOrGetInviteLink', () => {
    it('creates an invite link when none exists', async () => {
      spies.getInviteByProjectId.mockResolvedValue(null);
      spies.createInvite.mockResolvedValue(validInviteData);
      const req = createRequest({ params: { projectId: validInviteData.project_id } });
      const res = createResponse();

      await inviteController.createOrGetInviteLink(req, res);

      expect(spies.createInvite).toHaveBeenCalledWith(validInviteData.project_id, expect.any(String));
      expect(spies.updateInvite).not.toHaveBeenCalled();
      expect(spies.sendInviteEmail).not.toHaveBeenCalled();
      expect(res.statusCode).toEqual(StatusCodes.OK);
      expect(res._getData()).toEqual(JSON.stringify(validInviteData));
    });

    it('emails the reusable project link when a destination email is supplied', async () => {
      spies.getInviteByProjectId.mockResolvedValue(null);
      spies.createInvite.mockResolvedValue(validInviteData);
      spies.getById.mockResolvedValue(validInviteProject);
      spies.isESPEnabled.mockReturnValueOnce('email-key');
      spies.sendInviteEmail.mockResolvedValueOnce();
      const destEmail = validUser.user_email;
      const req = createRequest({
        params: { projectId: validInviteData.project_id },
        body: { destEmail },
      });
      const res = createResponse();

      await inviteController.createOrGetInviteLink(req, res);

      expect(spies.sendInviteEmail).toHaveBeenCalledWith(
        destEmail,
        validInviteProject.pname,
        validInviteData.unique_token,
      );
      expect(res.statusCode).toEqual(StatusCodes.OK);
      expect(res._getData()).toEqual(JSON.stringify(validInviteData));
    });

    it('rejects legacy email delivery when the email service is disabled', async () => {
      spies.isESPEnabled.mockReturnValueOnce(false);
      const req = createRequest({
        params: { projectId: validInviteData.project_id },
        body: { destEmail: validUser.user_email },
      });
      const res = createResponse();

      await inviteController.createOrGetInviteLink(req, res);

      expect(spies.createInvite).not.toHaveBeenCalled();
      expect(spies.sendInviteEmail).not.toHaveBeenCalled();
      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getData()).toEqual(JSON.stringify({ error: 'Email service not enabled' }));
    });

    it('reuses an unexpired invite link', async () => {
      spies.getInviteByProjectId.mockResolvedValue(validInviteData);
      const req = createRequest({ params: { projectId: validInviteData.project_id } });
      const res = createResponse();

      await inviteController.createOrGetInviteLink(req, res);

      expect(spies.createInvite).not.toHaveBeenCalled();
      expect(spies.updateInvite).not.toHaveBeenCalled();
      expect(res._getData()).toEqual(JSON.stringify(validInviteData));
    });

    it('replaces an expired invite link', async () => {
      spies.getInviteByProjectId.mockResolvedValue(expiredInviteData);
      spies.updateInvite.mockResolvedValue(updatedInviteData);
      const req = createRequest({ params: { projectId: expiredInviteData.project_id } });
      const res = createResponse();

      await inviteController.createOrGetInviteLink(req, res);

      expect(spies.updateInvite).toHaveBeenCalledWith(expiredInviteData.project_id, expect.any(String));
      expect(spies.createInvite).not.toHaveBeenCalled();
      expect(res.statusCode).toEqual(StatusCodes.OK);
      expect(res._getData()).toEqual(JSON.stringify(updatedInviteData));
    });
  });

  describe('processInvite', () => {
    it('delegates atomic membership creation to the project service', async () => {
      spies.getInviteByToken.mockResolvedValue(validInviteData);
      spies.addUserToProject.mockResolvedValue(usersProjectData);
      const req = createRequest({ params: { token: validInviteData.unique_token } });
      const res = createResponse();
      res.locals.userSession = { user_email: validUser.user_email };

      await inviteController.processInvite(req, res);

      expect(spies.addUserToProject).toHaveBeenCalledWith(validInviteData.project_id, validUser.user_email);
      expect(res.statusCode).toEqual(StatusCodes.OK);
      expect(res._getData()).toEqual(JSON.stringify({ projectId: validInviteData.project_id }));
    });

    it('rejects an expired invite link', async () => {
      spies.getInviteByToken.mockResolvedValue(expiredInviteData);
      const req = createRequest({ params: { token: expiredInviteData.unique_token } });
      const res = createResponse();

      await inviteController.processInvite(req, res);

      expect(spies.addUserToProject).not.toHaveBeenCalled();
      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });

    it('rejects an unknown invite link with a bad request response', async () => {
      spies.getInviteByToken.mockResolvedValue(null);
      const req = createRequest({ params: { token: 'unknown-token' } });
      const res = createResponse();

      await inviteController.processInvite(req, res);

      expect(spies.addUserToProject).not.toHaveBeenCalled();
      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getData()).toEqual(JSON.stringify({ error: 'Invalid invite' }));
    });
  });

  describe('getInfoFromInvite', () => {
    it('returns project information for a valid invite link', async () => {
      spies.getInviteByToken.mockResolvedValue(validInviteData);
      spies.getById.mockResolvedValue(validInviteProject);
      const req = createRequest({ params: { token: validInviteData.unique_token } });
      const res = createResponse();

      await inviteController.getInfoFromInvite(req, res);

      expect(res.statusCode).toEqual(StatusCodes.OK);
      expect(res._getData()).toEqual(
        JSON.stringify({
          projectId: validInviteData.project_id,
          projectName: validInviteProject.pname,
          expiresAt: validInviteData.expiry_date,
        }),
      );
    });

    it('rejects an unknown invite link with a bad request response', async () => {
      spies.getInviteByToken.mockResolvedValue(null);
      const req = createRequest({ params: { token: 'unknown-token' } });
      const res = createResponse();

      await inviteController.getInfoFromInvite(req, res);

      expect(spies.getById).not.toHaveBeenCalled();
      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res._getData()).toEqual(JSON.stringify({ error: 'Invalid invite' }));
    });
  });

  describe('getInfoFromProjectId', () => {
    it('returns the project invite link', async () => {
      spies.getInviteByProjectId.mockResolvedValue(mockInviteInfoFromProjId);
      const req = createRequest({ params: { projectId: mockInviteInfoFromProjId.project_id } });
      const res = createResponse();

      await inviteController.getInfoFromProjectId(req, res);

      expect(spies.getInviteByProjectId).toHaveBeenCalledWith(mockInviteInfoFromProjId.project_id);
      expect(res.statusCode).toEqual(StatusCodes.OK);
      expect(res._getData()).toEqual(JSON.stringify(mockInviteInfoFromProjId));
    });
  });
});
