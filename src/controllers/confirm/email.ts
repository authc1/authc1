import { Context, Validator } from "hono";
import { html } from "hono/html";
import { D1QB, Raw } from "workers-qb";
import {
  expiredOrInvalidCode,
  expiredOrInvalidLink,
  handleError,
  registrationError,
} from "../../utils/error-responses";
import { getSessionById } from "../../utils/session";
import { getUserBySessionId, updateUser } from "../../utils/user";

type ConfirmEmailByCodeRequest = {
  code: string;
};

export function confirmEmailByCodeValidator(v: Validator) {
  return {
    code: v.json("code").isOptional(),
  };
}

export function confirmEmailByLinkValidator(v: Validator) {
  return {
    code: v.query("code").isRequired().message("code is required!"),
    session_id: v
      .query("session_id")
      .isRequired()
      .message("session_id is required!"),
  };
}

export const confirmEmailControllerByCode = async (c: Context) => {
  const body = await c.req.json<ConfirmEmailByCodeRequest>();
  const { code } = body;
  try {
    const db = new D1QB(c.env.AUTHC1);
    const sessionId = c.get("sessionId") as string;
    const user = c.get("user");
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

    await db.update({
      tableName: "users",
      data: {
        email_verified: "true",
        confirmed_at: new Raw("CURRENT_TIMESTAMP"),
      },
      where: { conditions: "id = ?1", params: [user?.id] },
    });

    return c.json({
      local_id: user.id,
      email: user.email,
    });
  } catch (err) {
    console.log(err);
    return handleError(registrationError, c, err);
  }
};

export const confirmEmailControllerByLink = async (c: Context) => {
  const code = await c.req.query("code");
  const sessionId = await c.req.query("session_id");
  const db = new D1QB(c.env.AUTHC1);
  try {
    const session = await getSessionById(c, sessionId, [
      "expiration_timestamp",
      "email_verify_code",
    ]);

    if (
      session.expiration_timestamp < Date.now() / 1000 ||
      session.email_verify_code !== code
    ) {
      return handleError(expiredOrInvalidLink, c);
    }

    const user = await getUserBySessionId(c, "some_session_id", [
      "id",
      "name",
      "email",
    ]);

    if (!user) {
      return c.html(
        html`<!DOCTYPE html>
          <html>
            <head>
              <title>Error</title>
            </head>
            <body>
              <h1>Error</h1>
              <p>
                The provided email address or token could not be found in our
                system.
              </p>
            </body>
          </html> `,
        404
      );
    }

    await db.update({
      tableName: "users",
      data: {
        email_verified: "true",
        confirmed_at: new Raw("CURRENT_TIMESTAMP"),
      },
      where: { conditions: "id = ?1", params: [user?.id] },
    });

    return c.html(
      html`<!DOCTYPE html>
        <html>
          <head>
            <title>Email Verification Success</title>
          </head>
          <body>
            <h1>Email Verified Successfully</h1>
            <p>
              Your email has been successfully verified. You can now go back to
              the application.
            </p>
          </body>
        </html> `
    );
  } catch (err) {
    console.log(err);
    return handleError(registrationError, c, err);
  }
};
