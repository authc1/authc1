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
import { createRefreshToken, generateSessionResponse } from "../../utils/token";
import { ApplicationRequest } from "../applications/create";
import { hash } from "../../utils/hash";
import { EventsConfig } from "../../enums/events";

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
      acitivity: EventsConfig.UserLoggedIn,
      userId: user?.id,
      applicationId: applicationInfo?.id,
      name: applicationInfo.name,
      email,
      created_at: new Date(),
    }),
  ]);

  const [authDetails] = promises;

  const { accessToken } = authDetails;

  const response = generateSessionResponse({
    accessToken,
    refreshToken,
    expiresIn: applicationInfo.settings.expires_in,
    sessionId,
    userId: user.id,
    provider: user.provider,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    email: user.email as string,
    phone: user.phone as string,
    name: user.name as string,
    avatarUrl: user.avatarUrl as string,
    claims: user.claims,
  });

  return c.json(response);
}
