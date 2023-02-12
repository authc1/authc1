import { Context } from "hono";
import { D1QB } from "workers-qb";
import { z } from "zod";
import { IUsers } from "../../../../models/users";
import { getApplicationProviderSettings, getApplicationSettings } from "../../../../utils/application";
import { invalidPassword } from "../../../../utils/error-responses";
import { createHash } from "../../../../utils/hash";
import { validatePassword } from "../../../register/email";

import {
    expiredOrInvalidCode,
  handleError,
} from "../../../../utils/error-responses";
import { handleSuccess, SuccessResponse } from "../../../../utils/success-responses";

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
    const { code, password }: ConfirmEmailPassword = await c.req.valid();
    const user: IUsers = c.get("user");
    const applicationId = c.get("applicationId") as string;
    const sessionId = c.get("sessionId") as string;
    const db = new D1QB(c.env.AUTHC1);

    const {
      password_regex: passwordRegex,
    } = await getApplicationProviderSettings(c, applicationId);

    const isValidPassword = validatePassword(password, passwordRegex);

    if (passwordRegex && !isValidPassword) {
      return handleError(invalidPassword, c);
    }

    const session = await db.fetchOne({
      tableName: "sessions",
      fields: "*",
      where: {
        conditions: "id = ?1 AND email_verify_code = ?2",
        params: [sessionId, code],
      },
    });

    if (!session?.results) {
      return handleError(expiredOrInvalidCode, c);
    }

    const { salt, hash } = await createHash(password);
    await db.update({
      tableName: "users",
      data: {
        password: hash,
      },
      where: {
        conditions: "id = ?1",
        params: [user?.id],
      },
    });
    await c.env.AUTHC1_USER_DETAILS.put(user?.id, salt);
  } catch (err: any) {}
};

export default confirmEmailResetController;
