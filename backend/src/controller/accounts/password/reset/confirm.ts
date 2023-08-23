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
  email: z.string().trim(),
  code: z.string().trim(),
  password: z.string().trim(),
});

type ConfirmEmailPassword = z.infer<typeof confirmRestPasswordSchema>;

const confirmEmailResetController = async (c: Context) => {
  try {
    const { code, password, email }: ConfirmEmailPassword = await c.req.valid(
      "json"
    );
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;

    const { password_regex: passwordRegex } = applicationInfo.providerSettings;

    const isValidPassword = validatePassword(password, passwordRegex);

    if (passwordRegex && !isValidPassword) {
      return handleError(invalidPassword, c);
    }

    const key = `${applicationInfo?.id}:email:${email}`;

    const userObjId = c.env.AuthC1User.idFromName(key);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);
    const hashPassword = await hash().make(password);
    const session = await userClient.resetPassword(
      code,
      hashPassword,
      applicationInfo
    );

    if (!session) {
      return handleError(expiredOrInvalidCode, c);
    }
    return c.json({
      email,
    });
  } catch (err: any) {
    console.log(err);
  }
};

export default confirmEmailResetController;
