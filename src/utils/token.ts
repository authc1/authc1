import { Context } from "hono";
import { D1QB, Raw } from "workers-qb";
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
    const db = new D1QB(c.env.AUTHC1);
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

    await db.insert({
      tableName: "tokens",
      data: {
        id: generateUniqueIdWithPrefix(),
        user_id: id,
        application_id: applicationId,
        session_id: sessionId,
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (err) {
    throw err;
  }
};
