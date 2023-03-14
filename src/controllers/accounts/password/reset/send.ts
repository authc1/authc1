import { Context } from "hono";
import { D1QB } from "workers-qb";
import { z } from "zod";

import {
  userNotFound,
  getUserError,
  handleError,
  emailVerificationDisabled,
} from "../../../../utils/error-responses";
import {
  handleSuccess,
  SuccessResponse,
} from "../../../../utils/success-responses";
import { sendEmail } from "../../../../utils/email";
import { ISendVerificationEmailParams } from "../../../verify/email";
import { IUsers } from "../../../../models/users";
import { generateEmailVerificationCode } from "../../../../utils/string";
import { updateSession } from "../../../../utils/session";

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
// TODO: Immediate
const sendResetCodeController = async (c: Context) => {
  try {
    const { email } = await c.req.valid();
    const db = new D1QB(c.env.AUTHC1);
    const user: IUsers = c.get("user");
    const sessionId = c.get("sessionId") as string;

    const applicationSettings = await db.fetchOne({
      fields: "*",
      tableName: "application_settings",
    });

    if (!applicationSettings?.results) {
      return handleError(getUserError, c);
    }

    const {
      email_verification_enabled: emailVerificationEnabled,
      email_verification_method: emailVerificationMethod,
      email_template_body: emailTemplateBody,
      email_template_subject: emailTemplateSubject,
      sender_email: senderEmail,
    } = applicationSettings.results as any;

    if (!emailVerificationEnabled) {
      return handleError(emailVerificationDisabled, c);
    }

    const emailVerificationCode = generateEmailVerificationCode();

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
      updateSession(c, sessionId, {
        email_verify_code: emailVerificationCode,
        expiration_timestamp: Math.floor(Date.now() / 1000) + 180,
      }),
    ]);

    const response: SuccessResponse = {
      message: "Password reset code sent successfully",
      data: {
        email,
      },
    };
    return handleSuccess(c, response);
  } catch (err) {
    return handleError(getUserError, c, err);
  }
};

export default sendResetCodeController;
