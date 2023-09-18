import { Context } from "hono";
import { z } from "zod";

import {
  handleError,
  updateApplicationError,
  refreshTokenNotValidError,
} from "../../../utils/error-responses";
import {
  handleSuccess,
  SuccessResponse,
} from "../../../utils/success-responses";
import { sign } from "../../../middleware/jwt";
import { ApplicationRequest } from "../../applications/create";
import { TokenClient } from "../../../do/AuthC1Token";
import { UserClient } from "../../../do/AuthC1User";

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

    return c.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      expires_at:
        Math.floor(Date.now() / 1000) + applicationInfo.settings.expires_in,
      session_id: tokenInfo.sessionId,
      local_id: tokenInfo?.userId,
      email_verified: user?.emailVerified,
    });
  } catch (err: any) {
    console.log(err);

    return handleError(updateApplicationError, c, err);
  }
};

export default updateAccessTokenByRefreshToken;
