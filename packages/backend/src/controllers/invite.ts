import ses from '../aws/ses';
import express from 'express';
import { Invite } from '@prisma/client';
import { BadRequestError, getDefaultErrorRes } from '../helpers/error';
import { StatusCodes } from 'http-status-codes';
import invite from '../services/invite.service';
import user from '../services/user.service';
import project from '../services/project.service';
import course from '../services/course.service';
import { assertProjectIdIsValid, assertTokenIsValid, assertEmailIsValid } from '../helpers/error/assertions';
import { randomUUID } from 'crypto';

async function createToken(projectId: number, email: string) {
  const res = await invite.getInvite(projectId, email);

  const token = generateToken();

  if (res == null) {
    return await invite.createInvite(projectId, email, token);
  } else {
    return await invite.updateInvite(projectId, email, token);
  }
}

async function sendInvite(req: express.Request, res: express.Response) {
  try {
    const { projectId } = req.params;
    const { destEmail } = req.body;
    assertProjectIdIsValid(projectId);
    assertEmailIsValid(destEmail);

    if (!ses.isESPEnabled()) {
      throw new BadRequestError('Email service not enabled');
    }

    const token = await createToken(Number(projectId), destEmail);

    const projectName = (await project.getById(Number(projectId))).pname;

    try {
      await ses.sendInviteEmail(destEmail, projectName, token.unique_token);
    } catch (error) {
      // Delete token if email sending fails
      await invite.deleteInvite(Number(projectId), destEmail);
      return getDefaultErrorRes(error, res);
    }

    if (token) {
      token.unique_token = '';
    }

    return res.status(StatusCodes.OK).json(token);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function processInvite(req: express.Request, res: express.Response) {
  try {
    const { token } = req.params;
    assertTokenIsValid(token);

    const inviteRes = await invite.getInviteByToken(token);
    await checkIfExpired(inviteRes);

    const projectRes = await project.getById(inviteRes.project_id);

    // Check if user is already in associated course
    const courseUsers = await course.getUsers(projectRes.course_id);
    const userRes = await user.getByEmail(inviteRes.email);

    if (!courseUsers.some((user) => user.user_id == userRes.user_id)) {
      await course.addUser(projectRes.course_id, inviteRes.email);
    }
    await project.addUserByInvite(inviteRes.project_id, inviteRes.email);

    const result = await invite.deleteInvite(inviteRes.project_id, inviteRes.email);
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

async function getInfoFromInvite(req: express.Request, res: express.Response) {
  try {
    const { token } = req.params;
    assertTokenIsValid(token);

    const inviteRes = await invite.getInviteByToken(token);
    const userRes = await user.findByEmail(inviteRes.email);
    return res.status(StatusCodes.OK).json({ exists: userRes != null, email: inviteRes.email });
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

function generateToken() {
  return randomUUID();
}

async function checkIfExpired(inviteObj: Invite) {
  if (isExpired(inviteObj.expiry_date)) {
    throw new BadRequestError('Invalid invite');
  }
}

function isExpired(inviteDate: Date) {
  const now = new Date(Date.now());
  return now > inviteDate;
}

export default {
  sendInvite,
  processInvite,
  getInfoFromInvite,
  getInfoFromProjectId,
};
