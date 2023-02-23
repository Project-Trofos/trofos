import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: 'ap-southeast-1' });

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

  try {
    const sesRes = await sesClient.send(command);
    console.log(sesRes);
  } catch (error) {
    console.error(error);
  }
}

export default {
  sendEmail,
};
