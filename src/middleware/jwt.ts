import jsonwebtoken from "@tsndr/cloudflare-worker-jwt";
import { Context, Next } from "hono";
import { handleError, unauthorizedError } from "../utils/error-responses";

const idContextKey = "jwt-token-cloudflare-id-token-key";

export interface VerifyPayload {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  exp: number;
  iat: number;
  email: string;
  email_verified: boolean;
  sign_in_provider: string;
}

function setJwtDataToContext(c: Context, payload: any, key = idContextKey) {
  return c.set(key, payload);
}

export function setUnauthorizedResponse(c: Context): Response {
  return handleError(unauthorizedError, c);
}

export async function sign(
  payload: any,
  secret: string,
  algorithm: string = "HS256"
): Promise<string> {
  const token = await jsonwebtoken.sign(payload, secret, { algorithm });
  return token;
}

export async function verify(
  ctx: Context,
  token: string,
  secret: string,
  algorithm: string = "HS256"
): Promise<VerifyPayload | null> {
  const isValid = await jsonwebtoken.verify(token, secret, { algorithm });
  if (!isValid) {
    return null;
  }
  const { payload } = jsonwebtoken.decode(token);
  return payload as VerifyPayload;
}

export function getJwtDataToContext(c: Context, key = idContextKey): any {
  const data = c.get(key);
  if (!data) {
    return null;
  }
  return data;
}

export function jwt(options: any) {
  if (!options) {
    throw new Error('JWT auth middleware requires options for "secret');
  }

  return async (ctx: Context, next: Next) => {
    const { contextKey, authorizationHeaderKey, secret, alg } = options;

    const authorization = ctx.req.headers.get(
      authorizationHeaderKey || "Authorization"
    );
    console.log("authorization", authorization);

    if (!authorization) {
      return setUnauthorizedResponse(ctx);
    }
    const token: string = authorization.replace(/Bearer\s+/i, "");
    console.log("token", token);
    try {
      const payload = verify(ctx, token, secret, alg);
      if (contextKey) {
        setJwtDataToContext(ctx, payload, contextKey);
      }
    } catch (e: any) {
      console.log(e);
      return setUnauthorizedResponse(ctx);
    }
    await next();
  };
}
