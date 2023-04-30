import { Context } from "hono";
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
import { generateEmailVerificationCode } from "../../../../utils/string";
import { VerifyPayload } from "../../../../middleware/jwt";
import { ApplicationRequest } from "../../../applications/create";
import { UserClient } from "../../../../do/AuthC1User";

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
    const user = c.get("user");
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const { sessionId } = user;

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

    const key = `${applicationInfo?.id}:email:${email}`;
    console.log("key", key);

    const userObjId = c.env.AuthC1User.idFromName(key);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);

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
      userClient.updateSession(sessionId, {
        emailVerifyCode: emailVerificationCode,
        expirationTimestamp: Math.floor(Date.now() / 1000) + 180,
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
