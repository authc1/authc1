import { Context } from "hono";
import { z } from "zod";
import { UserClient, UserData } from "../../do/AuthC1User";
import {
  phoneVerificationDisabled,
  handleError,
} from "../../utils/error-responses";
import {
  generatPhoneVerificationCode,
  generateUniqueIdWithPrefix,
} from "../../utils/string";
import { ApplicationRequest } from "../applications/create";
import { handleSNSErrors, sendPhoneOTP } from "../../utils/phone";
import { EventsConfig } from "../../enums/events";

export const phoneVerifySchema = z.object({
  phone: z.string(),
});

export const phoneVerifyController = async (c: Context) => {
  try {
    const applicationInfo: ApplicationRequest = c.get("applicationInfo");
    const applicationId = applicationInfo.id as string;
    const {
      phone_provider_enabled: phoneVerificationEnabled,
      text_template_body: textTemplateBody,
    } = applicationInfo.providerSettings;

    const { is_dev_mode: isDevMode, dev_mode_code: devModeCode } =
      applicationInfo.settings;

    if (!phoneVerificationEnabled) {
      return handleError(phoneVerificationDisabled, c);
    }

    const { phone } = await c.req.valid("json");
    const key = `${applicationInfo?.id}:phone:${phone}`;

    const userObjId = c.env.AuthC1User.idFromName(key);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);
    const user = await userClient.getUser();
    if (!user?.id) {
      const userData: UserData = {
        id: userObjId.toString(),
        applicationId,
        provider: "phone",
        emailVerified: false,
        phone,
        phoneVerified: false,
      };
      console.log("JSON----------------", JSON.stringify(userData));
      await Promise.all([
        userClient.createUser(userData, applicationInfo),
        c.env.AUTHC1_ACTIVITY_QUEUE.send({
          acitivity: EventsConfig.UserRegistered,
          userId: userData?.id,
          applicationId,
          name: applicationInfo.name,
          phone,
          created_at: new Date(),
          provider: "phone",
        }),
      ]);
    }

    const phoneVerificationCode = !isDevMode
      ? generatPhoneVerificationCode()
      : devModeCode;
    const text = textTemplateBody.replace("{{code}}", phoneVerificationCode);
    const sessionId = generateUniqueIdWithPrefix();
    await Promise.all([
      !isDevMode ? sendPhoneOTP(c, phone, text) : null,
      userClient.updateUser(applicationInfo, sessionId, {
        phoneVerifyCode: phoneVerificationCode,
        expirationTimestamp: Math.floor(Date.now() / 1000) + 180,
      }),
    ]);

    await c.env.AUTHC1_ACTIVITY_QUEUE.send({
      acitivity: EventsConfig.UserPhoneVerificationSent,
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
