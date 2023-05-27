import { Context } from "hono";
import { UserClient } from "../../do/AuthC1User";
import { handleSESError, sendEmail } from "../../utils/email";
import {
  emailVerificationDisabled,
  handleError,
  userEmailAlreadyVerified,
  userNotFound,
} from "../../utils/error-responses";
import { generateEmailVerificationCode } from "../../utils/string";
import { ApplicationRequest } from "../applications/create";

export interface ISendVerificationEmailParams {
  email: string;
  emailVerificationMethod: string;
  emailTemplateBody: string;
  emailTemplateSubject: string;
  senderEmail: string;
  emailVerificationCode: string;
  sessionId?: string;
}

const sendVerificationEmail = async (
  c: Context,
  params: ISendVerificationEmailParams
) => {
  const {
    email,
    emailVerificationMethod,
    emailTemplateBody,
    emailTemplateSubject,
    senderEmail,
    emailVerificationCode,
    sessionId,
  } = params;

  const code =
    emailVerificationMethod === "link"
      ? `${c.env.VERIFY_EMAIL_ENDPOINT}/${c.env.API_VERSION}/confirm/email?code=${emailVerificationCode}&session_id=${sessionId}`
      : emailVerificationCode;
  const subject = emailTemplateSubject.replace("{{code}}", code);
  const body = emailTemplateBody.replace("{{code}}", code);
  return sendEmail(c, email, subject, body, senderEmail);
};

export const emailValidationController = async (c: Context) => {
  try {
    const applicationInfo: ApplicationRequest = c.get("applicationInfo");
    const applicationId = applicationInfo.id as string;
    const user = c.get("user");
    const { email, user_id: userId, session_id: sessionId } = user;

    if (user.email_verified) {
      return handleError(userEmailAlreadyVerified, c);
    }

    const {
      email_verification_enabled: emailVerificationEnabled,
      email_verification_method: emailVerificationMethod,
      email_template_body: emailTemplateBody,
      email_template_subject: emailTemplateSubject,
      sender_email: senderEmail,
    } = applicationInfo.providerSettings;

    if (!emailVerificationEnabled) {
      return handleError(emailVerificationDisabled, c);
    }
    const emailVerificationCode = generateEmailVerificationCode();

    const userObjId = c.env.AuthC1User.idFromString(userId);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);

    console.log("emailVerificationCode", emailVerificationCode);

    await Promise.all([
      sendVerificationEmail(c, {
        email,
        emailVerificationMethod,
        emailTemplateBody,
        emailTemplateSubject,
        senderEmail,
        emailVerificationCode,
        sessionId,
      }),
      userClient.updateUser({
        emailVerifyCode: emailVerificationCode,
        expirationTimestamp: Math.floor(Date.now() / 1000) + 180,
      }),
    ]);

    await c.env.AUTHC1_ACTIVITY_QUEUE.send({
      acitivity: "RequestEmailVerification",
      id: userId,
      applicationId,
      created_at: Date.now(),
    });

    return c.json({
      email,
    });
  } catch (err) {
    console.log(err);
    return handleSESError(c, err);
  }
};
