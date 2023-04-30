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
    const key = `${applicationInfo?.id}:email:${user?.email}`;
    console.log("key", key, user);

    const userObjId = c.env.AuthC1User.idFromName(key);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);

    await Promise.all([
      userClient.verifyEmailCodeAndUpdate(
        user.session_id as string,
        code,
        applicationInfo
      ),
      c.env.AUTHC1_ACTIVITY_QUEUE.send({
        acitivity: "EmailConfirmedByCode",
        id: user?.id,
        applicationId,
        created_at: Date.now(),
      }),
    ]);

    return c.json({
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
