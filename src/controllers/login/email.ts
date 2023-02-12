import { Context, Validator } from "hono";
import { getApplicationSettings } from "../../utils/application";
import {
  handleError,
  invalidCredentials,
  loginError,
  userNotFound,
} from "../../utils/error-responses";
import { checkHash } from "../../utils/hash";
import { createSession } from "../../utils/session";
import { createAndSaveTokens } from "../../utils/token";
import { getUserByEmail } from "../../utils/user";

type LoginRequest = {
  email: string;
  password: string;
};

export function validator(v: Validator) {
  return {
    email: v.json("email").isRequired(),
    password: v.json("password").isRequired(),
  };
}

async function verifyPassword(
  password: string,
  salt: string,
  hash: string
): Promise<boolean> {
  const isValid = await checkHash(password, salt, hash);
  console.log(isValid);
  return isValid;
}

const emailLoginController = async (c: Context) => {
  const body = await c.req.json<LoginRequest>();
  const { email, password } = body;
  const applicationName = c.get("applicationName") as string;
  const applicationId = c.get("applicationId") as string;
  try {
    const user = await getUserByEmail(c, email as string, applicationId, [
      "id",
      "password",
      "email_verified",
      "name",
    ]);
    if (!user) {
      return handleError(userNotFound, c);
    }
    const {
      id,
      password: storedPassword,
      email_verified: emailVerified,
      name,
    } = user;
    const salt = await c.env.AUTHC1_USER_DETAILS?.get(id);
    console.log("salt", salt);
    const passwordMatched = await verifyPassword(
      password as string,
      salt as string,
      storedPassword as string
    );

    if (!passwordMatched) {
      return handleError(invalidCredentials, c);
    }

    const sessionId = await createSession(c, applicationId, id);

    const {
      expires_in: expiresIn,
      secret,
      algorithm,
    } = await getApplicationSettings(c, applicationId, [
      "expires_in",
      "secret",
      "algorithm",
    ]);

    console.log(secret, algorithm);

    const { accessToken, refreshToken } = await createAndSaveTokens(c, {
      applicationName,
      expiresIn,
      id,
      sessionId,
      email,
      emailVerified,
      applicationId,
      secret,
      algorithm,
    });

    return c.json({
      access_token: accessToken,
      email,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      local_id: id,
      name,
    });
  } catch (err: any) {
    console.log(err);
    return handleError(loginError, c, err);
  }
};

export default emailLoginController;
