import { Context } from "hono";
import { z } from "zod";
import { invalidPassword } from "../../../../utils/error-responses";
import { hash } from "../../../../utils/hash";

import {
  expiredOrInvalidCode,
  handleError,
} from "../../../../utils/error-responses";
import { ApplicationRequest } from "../../../applications/create";
import { UserClient } from "../../../../do/AuthC1User";
import { validatePassword } from "../../../email/register";

export const confirmRestPasswordSchema = z.object({
  code: z.string().trim(),
  password: z.string().trim(),
});

const sessionSchema = z.object({
  id: z.string().optional(),
  created_at: z.string().optional(),
  user_id: z.string().optional(),
  application_id: z.string().optional(),
  name: z.string().optional(),
  session_id: z.string().optional(),
  metadata: z.string().optional(),
  ip: z.string().optional(),
  user_agent: z.string().optional(),
  region: z.string().optional(),
  expiration_timestamp: z.string().optional(),
  email_verify_code: z.string().optional(),
  phone_verify_code: z.string().optional(),
});

type SessionSchema = z.infer<typeof sessionSchema>;
type ConfirmEmailPassword = z.infer<typeof confirmRestPasswordSchema>;

const confirmEmailResetController = async (c: Context) => {
  try {
    const { code, password }: ConfirmEmailPassword = await c.req.valid("json");
    const user = c.get("user");
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const sessionId = user.sessionId as string;

    const { password_regex: passwordRegex } = applicationInfo.providerSettings;

    const isValidPassword = validatePassword(password, passwordRegex);

    if (passwordRegex && !isValidPassword) {
      return handleError(invalidPassword, c);
    }

    const key = `${applicationInfo?.id}:email:${user?.email}`;
    console.log("key", key);

    const userObjId = c.env.AuthC1User.idFromName(key);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);
    const hashPassword = await hash().make(password);
    const session = await userClient.resetPassword(
      code,
      hashPassword,
      applicationInfo,
      sessionId
    );

    if (!session) {
      return handleError(expiredOrInvalidCode, c);
    }

    // await c.env.AUTHC1_USER_DETAILS.put(user?.id, salt);
  } catch (err: any) {
    console.log(err);
  }
};

export default confirmEmailResetController;
