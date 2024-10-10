import {
  CreateTemplateCommand,
  DeleteTemplateCommand,
  GetTemplateCommand,
  ListTemplatesCommand,
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
} from '@aws-sdk/client-ses';
import { inviteHTMLTemplate } from '../templates/email';

const sesClient = new SESClient({
  region: 'ap-southeast-1',
});

// templates will defer by FRONTEND_BASE_URL env var
const TEMPLATE_NAME = `TROFOS_INVITE_${process.env.FRONTEND_BASE_URL}`;

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

  // Check if template exists and matches html template
  // This ensures that we can easily update html template if needed
  if (response.TemplatesMetadata?.find((metadata) => metadata.Name == templateName)) {
    const getTemplateCommand = new GetTemplateCommand({
      TemplateName: templateName,
    });
    const res = await sesClient.send(getTemplateCommand);

    if (res.Template?.HtmlPart == inviteHTMLTemplate) {
      return;
    }

    const deleteTemplateCommand = new DeleteTemplateCommand({
      TemplateName: templateName,
    });
    await sesClient.send(deleteTemplateCommand);
  }

  // Create email template
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
