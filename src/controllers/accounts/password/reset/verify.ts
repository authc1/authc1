import { Context } from "hono";
import { D1QB } from "workers-qb";
import { z } from "zod";
import { IUsers } from "../../../../models/users";

import {
  emailVerificationError,
  handleError,
  expiredOrInvalidCode,
} from "../../../../utils/error-responses";
import { getSessionById } from "../../../../utils/session";
import {
  handleSuccess,
  SuccessResponse,
} from "../../../../utils/success-responses";

export const resetCodeSchema = z.object({
  code: z.string(),
});

export type ResetCode = z.infer<typeof resetCodeSchema>;

const verifyPasswordResetCodeController = async (c: Context) => {
  try {
    const body: ResetCode = await c.req.valid("json");
    const { code } = body;
    const user: IUsers = c.get("user");
    const sessionId = c.get("sessionId") as string;
    const { email } = user;
    const db = new D1QB(c.env.AUTHC1);

    const session = await getSessionById(c, sessionId, [
      "expiration_timestamp",
      "email_verify_code",
    ]);

    if (
      session.expiration_timestamp < Date.now() / 1000 ||
      session.email_verify_code !== code
    ) {
      return handleError(expiredOrInvalidCode, c);
    }

    const response: SuccessResponse = {
      message: "Reset code verified successfully",
      data: {
        email,
      },
    };
    return handleSuccess(c, response);
  } catch (err) {
    return handleError(emailVerificationError, c, err);
  }
};

export default verifyPasswordResetCodeController;
