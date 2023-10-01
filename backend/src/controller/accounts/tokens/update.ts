import { Context } from "hono";
import { z } from "zod";

import {
  handleError,
  updateApplicationError,
  refreshTokenNotValidError,
} from "../../../utils/error-responses";
import { ApplicationRequest } from "../../applications/create";
import { TokenClient } from "../../../do/AuthC1Token";
import { UserClient } from "../../../do/AuthC1User";
import { generateSessionResponse } from "../../../utils/token";

export const schema = z.object({
  refresh_token: z.string(),
});

export type SessionUpdate = z.infer<typeof schema>;

export const updateAccessTokenByRefreshToken = async (c: Context) => {
  try {
    const body: SessionUpdate = await c.req.valid("json");
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const { settings } = applicationInfo;
    const { refresh_token: refreshToken } = body;

    console.log(refreshToken);

    const tokenObjId = c.env.AuthC1Token.idFromString(refreshToken);
    const stub = c.env.AuthC1Token.get(tokenObjId);
    const tokenClient = new TokenClient(stub);
    const tokenInfo = await tokenClient.getToken();

    if (!tokenInfo?.userId) {
      return handleError(refreshTokenNotValidError, c);
    }

    const { expires_in: expiresIn } = settings;

    const userObjId = c.env.AuthC1User.idFromString(tokenInfo.userId);
    const userStub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(userStub);
    const { accessToken, user } = await userClient.refreshToken(
      tokenInfo.sessionId,
      applicationInfo
    );

    const response = generateSessionResponse({
      accessToken,
      refreshToken,
      expiresIn,
      sessionId: tokenInfo.sessionId,
      userId: user?.id as string,
      provider: user?.provider as string,
      emailVerified: user?.emailVerified as boolean,
      phoneVerified: user?.phoneVerified as boolean,
      email: user?.email as string,
      phone: user?.phone as string,
      name: user?.name as string,
      avatarUrl: user?.avatarUrl as string,
      claims: user?.claims,
    });

    return c.json(response);
  } catch (err: any) {
    console.log(err);

    return handleError(updateApplicationError, c, err);
  }
};

export default updateAccessTokenByRefreshToken;
