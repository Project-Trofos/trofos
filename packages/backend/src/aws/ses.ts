import { inviteHTMLSubject, inviteHTMLTemplate, inviteTextTemplate } from '../templates/email';
import sgMail from '@sendgrid/mail';

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
    console.log('Email sent');
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
    console.log('Email sent');
  });
}

export default {
  isESPEnabled,
  sendEmail,
  sendInviteEmail,
};
