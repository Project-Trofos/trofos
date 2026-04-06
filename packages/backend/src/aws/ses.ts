import { inviteHTMLSubject, inviteHTMLTemplate, inviteTextTemplate } from '../templates/email';
import sgMail from '@sendgrid/mail';
import { getLogger } from '../logger/loggerProvider';

const logger = getLogger();

sgMail.setApiKey(process.env.EMAIL_KEY || '');

// Disable SES features if in test env or email service is not provided
function isESPEnabled() {
  return process.env.NODE_ENV !== 'test' && process.env.EMAIL_KEY;
}

async function sendEmail(emailDest: string, subject: string, body: string) {
  const msg = {
    to: emailDest,
    from: process.env.AWS_SES_FROM_EMAIL || '',
    subject: subject,
    text: body,
  };
  sgMail.send(msg).then(() => {
    logger.info({ email_dest: emailDest, subject }, 'Email sent');
  }).catch((error) => {
    logger.error({ err: error, email_dest: emailDest, subject }, 'Failed to send email');
  });
}

async function sendInviteEmail(emailDest: string, projectName: string, uniqueToken: string) {
  const msg = {
    to: emailDest,
    from: process.env.AWS_SES_FROM_EMAIL || '',
    subject: inviteHTMLSubject(projectName),
    html: inviteHTMLTemplate(uniqueToken),
    text: inviteTextTemplate(uniqueToken),
  };
  sgMail.send(msg).then(() => {
    logger.info({ email_dest: emailDest, project_name: projectName }, 'Invite email sent');
  }).catch((error) => {
    logger.error({ err: error, email_dest: emailDest, project_name: projectName }, 'Failed to send invite email');
  });
}

export default {
  isESPEnabled,
  sendEmail,
  sendInviteEmail,
};
