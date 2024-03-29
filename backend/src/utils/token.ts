import jsonwebtoken from "@tsndr/cloudflare-worker-jwt";
import { Context } from "hono";
import { setUnauthorizedResponse, verify } from "../middleware/jwt";
import { generateRandomID } from "./string";

type Payload = {
  userId: string;
  expiresIn: number;
  applicationName: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  applicationId: string;
  secret: string;
  algorithm: string;
  sessionId: string;
  provider: string;
  name?: string;
  email?: string;
  phone?: string;
  claims: any;
  segments: any;
};

interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

type UserFromTokenResult =
  | {
      iss: string;
      aud: string;
      auth_time: number;
      user_id: string;
      exp: number;
      iat: number;
      email: string;
      email_verified: boolean;
      provider: string;
    }
  | Response;

export async function createAccessToken(payload: Payload): Promise<string> {
  const {
    userId,
    applicationName,
    applicationId,
    email,
    phone,
    expiresIn,
    emailVerified,
    secret,
    algorithm,
    sessionId,
    provider = "email",
    name,
    claims,
    segments,
  } = payload;

  const accessToken = await sign(
    {
      iss: `https://authc1.com/${applicationId}`,
      aud: applicationName,
      auth_time: Date.now() / 1000,
      user_id: userId,
      exp: Math.floor(Date.now() / 1000) + expiresIn,
      iat: Math.floor(Date.now() / 1000),
      email,
      email_verified: emailVerified,
      phone,
      provider,
      session_id: sessionId,
      name,
      claims,
      segments,
    },
    secret,
    algorithm
  );
  return accessToken;
}

export function createRefreshToken(c: Context): string {
  const refreshToken = c.env.AuthC1Token.newUniqueId();
  // const refreshToken = `0x${generateRandomID()}${generateRandomID()}`;
  return refreshToken.toString();
}

export async function sign(
  payload: any,
  secret: string,
  algorithm: string = "HS256"
): Promise<string> {
  const token = await jsonwebtoken.sign(payload, secret, { algorithm });
  return token;
}

export async function getUserFromToken(
  c: Context,
  secret: string
): Promise<UserFromTokenResult> {
  const authorization = c.req.headers.get("Authorization");
  if (!authorization) {
    return setUnauthorizedResponse(c);
  }

  const token: string = authorization.replace(/Bearer\s+/i, "");
  const payload = await verify(c, token, secret as string);
  if (payload instanceof Response) {
    return payload;
  }

  return payload;
}

type SessionRequestArgs = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  sessionId: string;
  provider: string;
  userId: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  email: string;
  phone: string;
  name: string;
  avatarUrl: string;
  claims: any;
  segments: any;
};

export interface SessionResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  session_id: string;
  provider: string;
  user: {
    local_id: string | null;
    email_verified: boolean | null;
    email: string | null;
    phone: string | null;
    name: string | null;
    phone_verified: boolean | null;
    avatar_url: string | null;
  };
  claims: any;
  segments: any;
}

export function generateSessionResponse({
  accessToken,
  refreshToken,
  expiresIn,
  sessionId,
  userId,
  provider,
  emailVerified,
  phoneVerified,
  email,
  phone,
  name,
  avatarUrl,
  claims,
  segments,
}: SessionRequestArgs): SessionResponse {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    expires_at: expiresAt,
    session_id: sessionId,
    provider,
    user: {
      local_id: userId,
      email_verified: emailVerified || false,
      phone_verified: phoneVerified || false,
      email: email || null,
      phone: phone || null,
      name: name || null,
      avatar_url: avatarUrl || null,
    },
    claims: claims || {},
    segments: segments || {},
  };
}
