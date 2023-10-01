import { Context } from "hono";
import { z } from "zod";
import { UserClient } from "../../do/AuthC1User";
import {
  expiredOrInvalidCode,
  expiredOrInvalidLink,
  handleError,
  registrationError,
} from "../../utils/error-responses";
import { ApplicationRequest } from "../applications/create";
import { EventsConfig } from "../../enums/events";

export const confirmEmailByCodeSchema = z.object({
  code: z.string(),
});

export type ConfirmEmailByCodeRequest = z.infer<
  typeof confirmEmailByCodeSchema
>;

export const confirmEmailByLinkSchema = z.object({
  code: z.string(),
  session_id: z.string(),
});

export type ConfirmEmailByLinkRequest = z.infer<
  typeof confirmEmailByLinkSchema
>;

export const confirmEmailControllerByCode = async (c: Context) => {
  const body: ConfirmEmailByCodeRequest = await c.req.valid("json");
  const { code } = body;
  try {
    const applicationInfo: ApplicationRequest = c.get("applicationInfo");
    const applicationId = applicationInfo.id as string;
    const user = c.get("user");

    const userObjId = c.env.AuthC1User.idFromString(user?.user_id);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);

    const promises = await Promise.all([
      userClient.verifyEmailCodeAndUpdate(
        code,
        applicationInfo
      ),
      c.env.AUTHC1_ACTIVITY_QUEUE.send({
        acitivity: EventsConfig.UserEmailVerified,
        id: user?.user_id,
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
      email: user.email,
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
