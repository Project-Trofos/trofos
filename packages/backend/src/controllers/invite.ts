import { randomUUID } from 'crypto';
import express from 'express';
import { Invite } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, getDefaultErrorRes } from '../helpers/error';
import ses from '../aws/ses';
import invite from '../services/invite.service';
import project from '../services/project.service';
import { assertEmailIsValid, assertProjectIdIsValid, assertTokenIsValid } from '../helpers/error/assertions';

function generateToken() {
  return randomUUID();
}

function isExpired(inviteDate: Date) {
  const now = new Date(Date.now());
  return now > inviteDate;
}

function assertInviteIsValid(inviteObj: Invite | null): asserts inviteObj is Invite {
  if (!inviteObj || isExpired(inviteObj.expiry_date)) {
    throw new BadRequestError('Invalid invite');
  }
}

async function createToken(projectId: number) {
  const existingInvite = await invite.getInviteByProjectId(projectId);

  if (existingInvite && !isExpired(existingInvite.expiry_date)) {
    return existingInvite;
  }

  const token = generateToken();
  return existingInvite ? invite.updateInvite(projectId, token) : invite.createInvite(projectId, token);
}

async function createOrGetInviteLink(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const { destEmail } = req.body ?? {};
    assertProjectIdIsValid(projectId);

    if (destEmail !== undefined) {
      assertEmailIsValid(destEmail);
      if (!ses.isESPEnabled()) {
        throw new BadRequestError('Email service not enabled');
      }
    }

    const result = await createToken(Number(projectId));

    if (destEmail !== undefined) {
      const projectName = (await project.getById(Number(projectId))).pname;
      await ses.sendInviteEmail(destEmail, projectName, result.unique_token);
    }

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function processInvite(req: express.Request, res: express.Response) {
  try {
    const { token } = req.params;
    assertTokenIsValid(token);

    const inviteRes = await invite.getInviteByToken(token);
    assertInviteIsValid(inviteRes);

    const userEmail = res.locals.userSession.user_email;

    await project.addUserByInvite(inviteRes.project_id, userEmail);

    return res.status(StatusCodes.OK).json({ projectId: inviteRes.project_id });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getInfoFromInvite(req: express.Request, res: express.Response) {
  try {
    const { token } = req.params;
    assertTokenIsValid(token);

    const inviteRes = await invite.getInviteByToken(token);
    assertInviteIsValid(inviteRes);
    const projectRes = await project.getById(inviteRes.project_id);

    return res.status(StatusCodes.OK).json({
      projectId: inviteRes.project_id,
      projectName: projectRes.pname,
      expiresAt: inviteRes.expiry_date,
    });
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getInfoFromProjectId(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    assertProjectIdIsValid(projectId);

    const result = await invite.getInviteByProjectId(Number(projectId));
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  createOrGetInviteLink,
  processInvite,
  getInfoFromInvite,
  getInfoFromProjectId,
};
