import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { Context } from "hono";
import {
  accountSuspendedError,
  configurationSetDoesNotExistError,
  credentialsError,
  handleError,
  invalidParameterValueError,
  mailFromDomainNotVerifiedError,
  messageRejectedError,
  emailVerificationError,
} from "./error-responses";

export async function sendEmail(
  c: Context,
  to: string,
  subject: string,
  body: string,
  sender: string = "system@authc1.com"
) {
  const client = new SESClient({
    region: "ap-south-1",
    credentials: {
      accessKeyId: c.env.ACCESS_KEY_ID,
      secretAccessKey: c.env.SECRET_ACCESS_KEY,
    },
  });
  try {
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: body,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: sender,
    });
    await client.send(command);
    console.log("Email sent!");
  } catch (err) {
    console.log("Error sending email", err);
    throw err;
  }
}

export function handleSESError(c: Context, err: any) {
  switch (err.code) {
    case "MessageRejected":
      return handleError(messageRejectedError, c, err);
    case "InvalidParameterValue":
      return handleError(invalidParameterValueError, c, err);
    case "CredentialsError":
      return handleError(credentialsError, c, err);
    case "MailFromDomainNotVerifiedException":
      return handleError(mailFromDomainNotVerifiedError, c, err);
    case "AccountSuspended":
      return handleError(accountSuspendedError, c, err);
    case "ConfigurationSetDoesNotExist":
      return handleError(configurationSetDoesNotExistError, c, err);
    default:
      return handleError(emailVerificationError, c, err);
  }
}
