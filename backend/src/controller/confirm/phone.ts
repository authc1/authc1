import { Context } from "hono";
import { z } from "zod";
import { UserClient } from "../../do/AuthC1User";
import {
  expiredOrInvalidCode,
  handleError,
  registrationError,
} from "../../utils/error-responses";
import { ApplicationRequest } from "../applications/create";
import { EventsConfig } from "../../enums/events";
import { generateSessionResponse } from "../../utils/token";

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
        acitivity: EventsConfig.UserPhoneVerified,
        phone,
        id: user.id,
        applicationId,
        created_at: Date.now(),
      }),
      c.env.AUTHC1_ACTIVITY_QUEUE.send({
        acitivity: EventsConfig.UserLoggedIn,
        phone,
        id: user.id,
        applicationId,
        created_at: Date.now(),
      }),
    ]);

    const [authDetails] = promises;

    const response = generateSessionResponse({
      accessToken: authDetails?.accessToken,
      refreshToken: authDetails?.refreshToken,
      expiresIn: applicationInfo.settings.expires_in,
      sessionId: authDetails?.sessionId,
      userId: user?.id as string,
      provider: user?.provider as string,
      emailVerified: user?.emailVerified as boolean,
      phoneVerified: user?.phoneVerified as boolean,
      email: user?.email as string,
      phone: user?.phone as string,
      name: user?.name as string,
      avatarUrl: user?.avatarUrl as string,
      claims: user?.claims,
      segments: user?.segments,
    });

    return c.json(response);
  } catch (err: any) {
    console.log(err);
    if (err.message === expiredOrInvalidCode.error.code) {
      return handleError(expiredOrInvalidCode, c);
    } else {
      return handleError(registrationError, c, err);
    }
  }
};
