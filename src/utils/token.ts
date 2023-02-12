import { Context } from "hono";
import { sign } from "../middleware/jwt";
import { generateRandomID, generateUniqueIdWithPrefix } from "./string";

interface Payload {
  id: string;
  sessionId: string;
  expiresIn: number;
  applicationName: string;
  email: string;
  emailVerified: boolean;
  applicationId: string;
  secret: string;
  algorithm: string;
}

export const createAndSaveTokens = async (c: Context, payload: Payload) => {
  const {
    applicationName,
    expiresIn,
    id,
    sessionId,
    email,
    emailVerified = false,
    applicationId,
    secret,
    algorithm,
  } = payload;
  try {
    // TODO: Based on application settings
    const accessToken = await sign(
      {
        iss: `${c.env.VERIFY_EMAIL_ENDPOINT}/${applicationId}`,
        aud: applicationName,
        auth_time: Date.now() / 1000,
        user_id: id,
        exp: Math.floor(Date.now() / 1000) + expiresIn,
        iat: Math.floor(Date.now() / 1000),
        email,
        email_verified: emailVerified,
        sign_in_provider: "password",
      },
      secret,
      algorithm
    );

    const refreshToken = `0x${generateRandomID()}${generateRandomID()}`;

    await c.env.AUTHC1.prepare(
      `INSERT INTO tokens (id, user_id, application_id, session_id, access_token, refresh_token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
      .bind(
        generateUniqueIdWithPrefix(),
        id,
        applicationId,
        sessionId,
        accessToken,
        refreshToken
      )
      .run();

    return {
      accessToken,
      refreshToken,
    };
  } catch (err) {
    throw err;
  }
};
