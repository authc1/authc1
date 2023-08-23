import { Context } from "hono";
import { z } from "zod";
import { TokenClient } from "../../do/AuthC1Token";
import { UserClient } from "../../do/AuthC1User";
import {
  handleError,
  invalidCredentials,
  userNotFound,
} from "../../utils/error-responses";

import { generateUniqueIdWithPrefix } from "../../utils/string";
import { createRefreshToken } from "../../utils/token";
import { ApplicationRequest } from "../applications/create";
import { hash } from "../../utils/hash";

export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

async function verifyPassword(
  password: string,
  hashPassword: string
): Promise<boolean> {
  const isValid = await hash().check(password, hashPassword);
  return isValid;
}

async function addRefreshToken(
  c: Context,
  refreshToken: string,
  sessionId: string,
  applicationId: string,
  userId: string
) {
  const userObjId = c.env.AuthC1Token.idFromString(refreshToken);
  const stub = c.env.AuthC1Token.get(userObjId);
  const tokenClient = new TokenClient(stub);
  return tokenClient.createToken(
    sessionId,
    refreshToken,
    userId,
    applicationId
  );
}

export async function emailLoginController(c: Context) {
  const { email, password } = await c.req.json();
  const applicationInfo: ApplicationRequest = c.get("applicationInfo");
  const key = `${applicationInfo?.id}:email:${email}`;

  const userObjId = c.env.AuthC1User.idFromName(key);
  const stub = c.env.AuthC1User.get(userObjId);
  const userClient = new UserClient(stub);

  const user = await userClient.getUser();

  if (!user?.id) {
    console.log("user not found, send error");
    return handleError(userNotFound, c);
  }

  const passwordMatched = await verifyPassword(
    password,
    user.password as string
  );

  if (!passwordMatched) {
    return handleError(invalidCredentials, c);
  }

  const sessionId = generateUniqueIdWithPrefix();
  const refreshToken = createRefreshToken(c);

  const promises = await Promise.all([
    userClient.createSession(applicationInfo, sessionId, refreshToken),
    addRefreshToken(
      c,
      refreshToken,
      sessionId,
      applicationInfo.id as string,
      user.id as string
    ),
    c.env.AUTHC1_ACTIVITY_QUEUE.send({
      acitivity: "LoggedIn",
      userId: user?.id,
      applicationId: applicationInfo?.id,
      name: applicationInfo.name,
      email,
      created_at: new Date(),
    }),
  ]);

  const [authDetails] = promises;

  const { accessToken } = authDetails;

  return c.json({
    access_token: accessToken,
    email,
    refresh_token: refreshToken,
    expires_in: applicationInfo.settings.expires_in,
    expires_at:
      Math.floor(Date.now() / 1000) + applicationInfo.settings.expires_in,
    local_id: user.id,
    name: user?.name,
  });
}
