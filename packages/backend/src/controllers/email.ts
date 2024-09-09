import ses from '../aws/ses';
import { Invite } from '@prisma/client';
// import { v4 as uuidv4 } from 'uuid';
import invite from '../services/invite.service';

async function sendEmail(emailDest: string, subject: string, body: string) {
  if (!ses.isSESEnabled()) return;

  ses.sendEmail(emailDest, subject, body);
}

async function createToken(projectId: number, email: string) {
  const res = await invite.getInvite(projectId, email);

  // If current invite is expired
  if (res != null && !isExpired(res!)) {
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

function generateToken() {
  return 'token';
  // return uuidv4();
}

function isExpired(invite: Invite): boolean {
  const now = new Date(Date.now());
  const inviteDate = invite.expiry_date;

  return now > inviteDate;
}

export default {
  sendEmail,
  createToken,
};
