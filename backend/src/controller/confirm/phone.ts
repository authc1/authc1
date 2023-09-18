import { Context } from "hono";
import { html } from "hono/html";
import { z } from "zod";
import { UserClient } from "../../do/AuthC1User";
import {
  expiredOrInvalidCode,
  expiredOrInvalidLink,
  handleError,
  registrationError,
} from "../../utils/error-responses";
import { ApplicationRequest } from "../applications/create";

export const phoneConfirmSchema = z.object({
  code: z.string(),
  phone: z.string(),
});

export type ConfirmPhoneRequest = z.infer<typeof phoneConfirmSchema>;

export const phoneConfirmController = async (c: Context) => {
  const body: ConfirmPhoneRequest = await c.req.valid("json");
  const { code, phone } = body;
  try {
    const applicationInfo: ApplicationRequest = c.get("applicationInfo");
    const applicationId = applicationInfo.id as string;
    const key = `${applicationInfo?.id}:phone:${phone}`;

    const userObjId = c.env.AuthC1User.idFromName(key);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);
    const user = await userClient.getUser();

    const promises = await Promise.all([
      userClient.verifyPhoneCodeAndUpdate(code, applicationInfo),
      c.env.AUTHC1_ACTIVITY_QUEUE.send({
        acitivity: "PhoneConfirmedByCode",
        phone,
        id: user.id,
        applicationId,
        created_at: Date.now(),
      }),
    ]);

    const [authDetails] = promises;

    return c.json({
      access_token: authDetails?.accessToken,
      refresh_token: authDetails?.refreshToken,
      expires_in: applicationInfo.settings.expires_in,
      expires_at:
        Math.floor(Date.now() / 1000) + applicationInfo.settings.expires_in,
      name: user?.name,
      local_id: user.id,
      phone: user.phone,
    });
  } catch (err: any) {
    console.log(err);
    if (err.message === expiredOrInvalidCode.error.code) {
      return handleError(expiredOrInvalidCode, c);
    } else {
      return handleError(registrationError, c, err);
    }
  }
};
