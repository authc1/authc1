import { Context } from "hono";
import { z } from "zod";
import { UserClient, UserData } from "../../do/AuthC1User";
import {
  phoneVerificationDisabled,
  handleError,
} from "../../utils/error-responses";
import { generatPhoneVerificationCode } from "../../utils/string";
import { ApplicationRequest } from "../applications/create";
import { handleSNSErrors, sendPhoneOTP } from "../../utils/phone";

export const phoneVerifySchema = z.object({
  phone: z.string(),
});

export const phoneVerifyController = async (c: Context) => {
  try {
    const applicationInfo: ApplicationRequest = c.get("applicationInfo");
    const applicationId = applicationInfo.id as string;
    console.log("applicationId------------", applicationId);
    const {
      phone_provider_enabled: phoneVerificationEnabled,
      text_template_body: textTemplateBody,
      is_dev_mode: isDevMode,
      dev_mode_code: devModeCode,
    } = applicationInfo.providerSettings;

    if (!phoneVerificationEnabled) {
      return handleError(phoneVerificationDisabled, c);
    }

    const { phone } = await c.req.valid("json");
    const key = `${applicationInfo?.id}:phone:${phone}`;

    const userObjId = c.env.AuthC1User.idFromName(key);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);
    const user = await userClient.getUser();
    console.log("user", user);
    if (!user?.id) {
      const userData: UserData = {
        id: userObjId.toString(),
        applicationId,
        provider: "phone",
        emailVerified: false,
        phone,
      };
      console.log("userData", userData);
      await userClient.createUser(userData, applicationInfo);
    }

    const phoneVerificationCode = !isDevMode ? generatPhoneVerificationCode() : devModeCode;
    const text = textTemplateBody.replace("{{code}}", phoneVerificationCode);
    console.log(text);
    await Promise.all([
      !isDevMode ? sendPhoneOTP(c, phone, text) : null,
      userClient.updateUser({
        phoneVerifyCode: phoneVerificationCode,
        expirationTimestamp: Math.floor(Date.now() / 1000) + 180,
      }),
    ]);

    await c.env.AUTHC1_ACTIVITY_QUEUE.send({
      acitivity: "RequestPhoneVerification",
      phone,
      applicationId,
      created_at: Date.now(),
    });

    return c.json({
      phone,
    });
  } catch (err) {
    console.log(err);
    return handleSNSErrors(c, err);
  }
};
