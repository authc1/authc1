import { Context } from "hono";
import { boolean, z } from "zod";
import {
  handleError,
  invalidCredentials,
  loginError,
  userNotFound,
} from "../../utils/error-responses";
import { checkHash } from "../../utils/hash";
import { createSession } from "../../utils/session";
import { createAndSaveTokens } from "../../utils/token";
import { getUserByEmailWithProviderId } from "../../utils/user";
import { ApplicationSchema } from "../applications/getById";

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type LoginRequest = z.infer<typeof loginSchema>;

async function verifyPassword(
  password: string,
  salt: string,
  hash: string
): Promise<boolean> {
  console.log(password, salt, hash);
  const isValid = await checkHash(password, salt, hash);
  console.log(isValid);
  return isValid;
}

const emailLoginController = async (c: Context) => {
  const body: LoginRequest = c.req.valid("json");

  const { email, password } = body;
  const applicationName = c.get("applicationName") as string;
  const applicationId = c.get("applicationId") as string;

  try {
    const user = await getUserByEmailWithProviderId(
      c,
      email as string,
      applicationId,
      1,
      ["id", "password", "email_verified", "name"]
    );

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
    const applicationInfo = c.get("applicationInfo") as ApplicationSchema;
    console.log("applicationInfo", applicationInfo);
    const passwordMatched = await verifyPassword(
      password as string,
      salt as string,
      storedPassword as string
    );

    if (!passwordMatched) {
      return handleError(invalidCredentials, c);
    }

    const sessionId = await createSession(c, applicationId, id as string);

    const {
      expires_in: expiresIn,
      secret,
      algorithm,
    } = applicationInfo?.settings;

    const tokenData = {
      applicationName,
      expiresIn: expiresIn as number,
      id: id as string,
      sessionId,
      email,
      emailVerified: Boolean(emailVerified),
      applicationId,
      secret: secret as string,
      algorithm: algorithm as string,
    };
    console.log("tokenData", tokenData);

    const { accessToken, refreshToken } = await createAndSaveTokens(
      c,
      tokenData
    );

    console.log("refreshToken", refreshToken);

    await c.env.AUTHC1_ACTIVITY_QUEUE.send({
      acitivity: "LoggedIn",
      userId: id,
      applicationId,
      name,
      email,
      created_at: new Date(),
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
    console.log(JSON.stringify(err));
    return handleError(loginError, c, err);
  }
};

export default emailLoginController;
