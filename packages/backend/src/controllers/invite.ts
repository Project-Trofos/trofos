import ses from '../aws/ses';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Invite } from '@prisma/client';
import { getDefaultErrorRes } from '../helpers/error';
import { StatusCodes } from 'http-status-codes';
import invite from '../services/invite.service';
import user from '../services/user.service';
import project from '../services/project.service';
import course from '../services/course.service';
import { assertTokenIsValid } from '../helpers/error/assertions';

async function sendEmail(emailDest: string, subject: string, body: string) {
  if (!ses.isSESEnabled()) return;

  ses.sendEmail(emailDest, subject, body);
}

async function createToken(projectId: number, email: string) {
  const res = await invite.getInvite(projectId, email);

  // If there is a current invite that is not expired
  if (res != null && !isExpired(res!.expiry_date)) {
    throw new Error('User is already invited');
  }

  const token = generateToken();

  if (res == null) {
    await invite.createInvite(projectId, email, token);
  } else {
    await invite.updateInvite(projectId, email, token);
  }

  return token;
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
    await project.addUser(inviteRes.project_id, inviteRes.email);

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

function generateToken() {
  return uuidv4();
}

async function checkIfExpired(inviteObj: Invite) {
  if (isExpired(inviteObj.expiry_date)) {
    await invite.deleteInvite(inviteObj.project_id, inviteObj.email);

    throw new Error('Invalid invite');
  }
}

function isExpired(inviteDate: Date) {
  const now = new Date(Date.now());
  return now > inviteDate;
}

export default {
  sendEmail,
  createToken,
  processInvite,
  getInfoFromInvite,
};
