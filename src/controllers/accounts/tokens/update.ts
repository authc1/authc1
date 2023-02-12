import { Context } from "hono";
import { D1QB, Raw } from "workers-qb";
import { z } from "zod";

import {
  handleError,
  updateApplicationError,
  applicationNotFoundError,
  refreshTokenNotValidError,
  serverError,
} from "../../../utils/error-responses";
import {
  handleSuccess,
  SuccessResponse,
} from "../../../utils/success-responses";
import { sign } from "../../../middleware/jwt";
import { JwtPayloadToUser } from "../../../models/tokens";
import { ApplicationSetting } from "../../../models/applicationSetting";

export const schema = z.object({
  refresh_token: z.string(),
});

export type SessionUpdate = z.infer<typeof schema>;

async function isRefreshTokenValid(
  db: any,
  refreshToken: string,
  applicationId: string,
  sessionId: string
): Promise<boolean> {
  const fetched = await db.fetchOne({
    tableName: "tokens",
    fields: "count(*) as count",
    where: {
      conditions:
        "refresh_token = ?1 AND application_id = ?2 AND session_id = ?3 AND refresh_token_expiration >= ?4",
      params: [
        refreshToken,
        applicationId,
        sessionId,
        new Raw("CURRENT_TIMESTAMP"),
      ],
    },
  });

  return fetched.results.count > 0;
}

export const updateAccessTokenByRefreshToken = async (c: Context) => {
  try {
    const db = new D1QB(c.env.AUTHC1);
    const body: SessionUpdate = await c.req.valid();
    const applicationId = c.req.param("id");
    const sessionId = c.req.param("sessionId");

    const user: JwtPayloadToUser = c.get("user");
    const { refresh_token: refreshToken } = body;

    const isTokenValid = await isRefreshTokenValid(
      db,
      refreshToken,
      applicationId,
      sessionId
    );

    if (!isTokenValid) {
      return handleError(refreshTokenNotValidError, c);
    }

    const applicationSettings = await db.fetchOne({
      fields: "expires_in, secret, algorithm",
      tableName: "application_settings",
      where: {
        conditions: "application_id = ?1",
        params: [applicationId],
      },
    });

    if (!applicationSettings?.results) {
      return handleError(applicationNotFoundError, c);
    }

    const settings = applicationSettings.results as ApplicationSetting;

    const { expires_in, secret, algorithm } = settings;

    if (!secret) {
      return handleError(serverError, c);
    }

    const accessToken = await sign(
      {
        iss: `${c.env.VERIFY_EMAIL_ENDPOINT}/${applicationId}`,
        aud: user?.aud,
        auth_time: Date.now() / 1000,
        user_id: user?.id,
        exp: Math.floor(Date.now() / 1000) + Number(expires_in),
        iat: Math.floor(Date.now() / 1000),
        email: user.email,
        sign_in_provider: "password",
      },
      secret,
      algorithm
    );

    await db.update({
      tableName: "tokens",
      data: {
        access_token: accessToken,
      },
      where: {
        conditions: "refresh_token = ?1",
        params: [refreshToken],
      },
    });

    const response: SuccessResponse = {
      message: "Session updated successfully",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in,
      },
    };
    return handleSuccess(c, response);
  } catch (err: any) {
    console.log(err);

    return handleError(updateApplicationError, c, err);
  }
};

export default updateAccessTokenByRefreshToken;
