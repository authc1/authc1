import { Context } from "hono";
import { D1QB, Raw } from "workers-qb";
import { z } from "zod";

import {
  handleError,
  updateApplicationError,
  applicationNotFoundError,
  refreshTokenNotValidError,
  serverError,
  userNotFound,
} from "../../../utils/error-responses";
import {
  handleSuccess,
  SuccessResponse,
} from "../../../utils/success-responses";
import { sign } from "../../../middleware/jwt";
import { JwtPayloadToUser } from "../../../models/tokens";
import { ApplicationSchema } from "../../applications/getById";
import { getUserById } from "../../../utils/user";

export const schema = z.object({
  refresh_token: z.string(),
});

export type SessionUpdate = z.infer<typeof schema>;

async function getRefreshTokenData(
  db: any,
  refreshToken: string,
  applicationId: string
): Promise<any> {
  console.log("refreshToken, applicationId", refreshToken, applicationId);
  const fetched = await db.fetchOne({
    tableName: "tokens",
    fields: "users.*",
    where: {
      conditions: "tokens.refresh_token = ?1 AND tokens.application_id = ?2",
      params: [refreshToken, applicationId],
    },
    join: {
      table: "users",
      on: "tokens.user_id = users.id",
    },
  });

  return fetched.results;
}

export const updateAccessTokenByRefreshToken = async (c: Context) => {
  try {
    const db = new D1QB(c.env.AUTHC1);
    const body: SessionUpdate = await c.req.valid("json");
    const applicationInfo = c.get("applicationInfo") as ApplicationSchema;
    const { settings, name, id: applicationId } = applicationInfo;
    const { refresh_token: refreshToken } = body;

    const tokenData = await getRefreshTokenData(
      db,
      refreshToken,
      applicationId as string
    );

    if (!tokenData) {
      return handleError(refreshTokenNotValidError, c);
    }

    const { expires_in: expiresIn, secret, algorithm } = settings;

    if (!secret) {
      return handleError(serverError, c);
    }

    const userData = await getUserById(
      c,
      tokenData?.id,
      applicationId as string,
      ["email_verified"]
    );

    if (userData instanceof Response) {
      return handleError(userNotFound, c);
    }

    const accessToken = await sign(
      {
        iss: `${c.env.VERIFY_EMAIL_ENDPOINT}/${applicationId}`,
        aud: name,
        auth_time: Date.now() / 1000,
        user_id: tokenData?.id,
        exp: Math.floor(Date.now() / 1000) + Number(expiresIn),
        iat: Math.floor(Date.now() / 1000),
        email: tokenData?.email,
        email_verified: userData?.email_verified || false,
        sign_in_provider: "password",
      },
      secret,
      algorithm as string
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
        expires_in: expiresIn,
      },
    };
    return handleSuccess(c, response);
  } catch (err: any) {
    console.log(err);

    return handleError(updateApplicationError, c, err);
  }
};

export default updateAccessTokenByRefreshToken;
