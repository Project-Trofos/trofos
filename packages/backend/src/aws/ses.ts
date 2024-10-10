import {
  CreateTemplateCommand,
  ListTemplatesCommand,
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
} from '@aws-sdk/client-ses';
import { inviteHTMLTemplate } from '../templates/email';

const sesClient = new SESClient({
  region: 'ap-southeast-1',
});

const TEMPLATE_NAME = 'TROFOS_INVITE';

// Disable SES features if in test env or email service is not provided
function isSESEnabled() {
  return process.env.NODE_ENV !== 'test' && process.env.EMAIL_SERVICE === 'AWS_SES';
}

async function sendEmail(emailDest: string, subject: string, body: string) {
  const params = {
    Destination: {
      ToAddresses: [emailDest],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    },
    Source: process.env.AWS_SES_FROM_EMAIL || '',
  };

  const command = new SendEmailCommand(params);
  const sesRes = await sesClient.send(command);
  console.log(sesRes);
}

async function sendInviteEmail(emailDest: string, projectName: string, uniqueToken: string) {
  await tryCreateEmailTemplate(TEMPLATE_NAME);

  const params = {
    Source: process.env.AWS_SES_FROM_EMAIL || '',
    Destination: {
      ToAddresses: [emailDest],
    },
    Template: TEMPLATE_NAME,
    TemplateData: JSON.stringify({
      projectName: projectName,
      invitationToken: uniqueToken,
    }),
  };

  const command = new SendTemplatedEmailCommand(params);
  const sesRes = await sesClient.send(command);
  console.log(sesRes);
}

async function tryCreateEmailTemplate(templateName: string) {
  const listTemplatesCommand = new ListTemplatesCommand({});
  const response = await sesClient.send(listTemplatesCommand);

  if (response.TemplatesMetadata?.find((metadata) => metadata.Name == templateName)) {
    return;
  }

  // Create email template if not existing
  const input = {
    Template: {
      TemplateName: templateName,
      SubjectPart: 'Trofos - Invitation to join project {{projectName}}',
      HtmlPart: inviteHTMLTemplate,
    },
  };

  const createTemplateCommand = new CreateTemplateCommand(input);
  await sesClient.send(createTemplateCommand);
}

export default {
  isSESEnabled,
  sendEmail,
  sendInviteEmail,
};
