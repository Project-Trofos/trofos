import ses from '../aws/ses';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Invite } from '@prisma/client';
import { getDefaultErrorRes } from '../helpers/error';
import { StatusCodes } from 'http-status-codes';
import invite from '../services/invite.service';
import project from '../services/project.service';
import course from '../services/course.service';

async function sendEmail(emailDest: string, subject: string, body: string) {
  if (!ses.isSESEnabled()) return;

  ses.sendEmail(emailDest, subject, body);
}

async function createToken(projectId: number, email: string) {
  const res = await invite.getInvite(projectId, email);

  // If current invite is expired
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
    const inviteRes = await invite.getInviteByToken(token);
    await checkIfExpired(inviteRes);

    const projectRes = await project.getById(inviteRes.project_id);

    const userOnCourseRes = await course.addUser(projectRes.course_id, inviteRes.email);
    const userOnProjRes = await project.addUser(inviteRes.project_id, inviteRes.email);

    const result = await invite.deleteInvite(inviteRes.project_id, inviteRes.email);
    return res.status(StatusCodes.OK).json(result);
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
};
