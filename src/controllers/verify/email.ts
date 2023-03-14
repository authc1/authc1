import { Context } from "hono";
import { IUsers } from "../../models/users";
import { getApplicationProviderSettings } from "../../utils/application";
import { handleSESError, sendEmail } from "../../utils/email";
import {
  emailVerificationDisabled,
  handleError,
  userEmailAlreadyVerified,
  userNotFound,
} from "../../utils/error-responses";
import { updateSession } from "../../utils/session";
import { generateEmailVerificationCode } from "../../utils/string";
import { getUserById } from "../../utils/user";

export interface ISendVerificationEmailParams {
  email: string;
  emailVerificationMethod: string;
  emailTemplateBody: string;
  emailTemplateSubject: string;
  senderEmail: string;
  emailVerificationCode: string;
  sessionId: string;
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

const emailValidationController = async (c: Context) => {
  try {
    const applicationId = c.get("applicationId") as string;
    const user: IUsers = c.get("user");
    const sessionId = c.get("sessionId") as string;
    const { email, id } = user;

    const userData = await getUserById(c, id, applicationId, [
      "email_verified",
    ]);

    if (userData instanceof Response) {
      return handleError(userNotFound, c);
    }

    if (userData.email_verified) {
      return handleError(userEmailAlreadyVerified, c);
    }

    const {
      email_verification_enabled: emailVerificationEnabled,
      email_verification_method: emailVerificationMethod,
      email_template_body: emailTemplateBody,
      email_template_subject: emailTemplateSubject,
      sender_email: senderEmail,
    } = await getApplicationProviderSettings(c, applicationId);
    if (!emailVerificationEnabled) {
      return handleError(emailVerificationDisabled, c);
    }
    const emailVerificationCode = generateEmailVerificationCode();

    console.log("emailVerificationCode", emailVerificationCode);

    await Promise.all([
      /* sendVerificationEmail(c, {
        email,
        emailVerificationMethod,
        emailTemplateBody,
        emailTemplateSubject,
        senderEmail,
        emailVerificationCode,
        sessionId,
      }), */
      updateSession(c, sessionId, {
        email_verify_code: emailVerificationCode,
        expiration_timestamp: Math.floor(Date.now() / 1000) + 180,
      }),
    ]);

    await c.env.AUTHC1_ACTIVITY_QUEUE.send({
      acitivity: "RequestEmailVerification",
      id,
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

export default emailValidationController;
