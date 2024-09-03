import ses from '../aws/ses';

async function sendEmail(emailDest: string, subject: string, body: string) {
  if (!ses.isSESEnabled()) return;

  ses.sendEmail(emailDest, subject, body);
}

export default {
  sendEmail,
};
