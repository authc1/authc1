import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { Context } from "hono";
import {
  accountSuspendedError,
  configurationSetDoesNotExistError,
  credentialsError,
  handleError,
  invalidParameterValueError,
  mailFromDomainNotVerifiedError,
  messageRejectedError,
  failedToSendVerificationCode,
} from "./error-responses";

export async function sendPhoneOTP(
  c: Context,
  phone: string,
  body: string
) {
  const params = {
    Message: body,
    PhoneNumber: phone,
  };
  const client = new SNSClient({
    region: "ap-south-1", // TODO: @subh to make this configurable
    credentials: {
      accessKeyId: c.env.ACCESS_KEY_ID,
      secretAccessKey: c.env.SECRET_ACCESS_KEY,
    },
  });
  try {
    const command = new PublishCommand(params);
    const data = await client.send(command);
  } catch (err) {
    console.log("Error sending verification code", err);
    throw err;
  }
}

export function handleSNSErrors(c: Context, err: any) {
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
      return handleError(failedToSendVerificationCode, c, err);
  }
}
