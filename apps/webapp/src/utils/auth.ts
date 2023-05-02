import type { Cookie } from "@builder.io/qwik-city";
import jsonwebtoken from "@tsndr/cloudflare-worker-jwt";
import type { AuthState, ErrorResponse } from "./fetch";
import { getAccessTokenFromCookie } from "./fetch";
import { callApi } from "./fetch";
import type { JwtUser } from "~/types";
export const AUTHTOKEN_NAME: string = "fugit.app:user";

import type { Session } from "@authc1/auth-js";
import { createAuthc1Client } from "./authc1-client";

export const isUserAuthenticated = async (cookie: Cookie) => {
  return cookie.has(AUTHTOKEN_NAME);
};

export function decodeAccessToken(token: string): JwtUser {
  const { payload } = jsonwebtoken.decode(token);
  return payload as JwtUser;
}

interface EmailAuth {
  name?: string;
  email: string;
  password: string;
}

interface EmailConfirm {
  code: string;
}

export const signIn = async (
  { email, password }: EmailAuth,
  cookie: Cookie,
  appId: string
): Promise<Session | ErrorResponse> => {
  try {
    const client = createAuthc1Client(cookie, appId);
    const data = await client.signInWithEmail(email, password);
    return data;
  } catch (e: any) {
    console.log(e);
    return e;
  }
};

export const register = async (
  { name, email, password }: EmailAuth,
  cookie: Cookie,
  baseUrl: string,
  appId: string,
): Promise<JwtPayloadToUser | ErrorResponse> => {
  try {
    const data: any = await callApi(
      {
        endpoint: "/register/email",
        method: "POST",
        body: {
          name,
          email,
          password,
        },
      },
      baseUrl,
      appId
    );

    if (!data.error) {
      cookie.set(AUTHTOKEN_NAME, JSON.stringify(data), {
        httpOnly: true,
        maxAge: [data.expires_in, "seconds"],
        path: "/",
      });
      return data;
    }

    throw new Error(data?.message);
  } catch (e: any) {
    return e;
  }
};

export const verify = async (
  cookie: Cookie,
  appId: string,
): Promise<void | ErrorResponse> => {
  try {
    const client = createAuthc1Client(cookie, appId);
    const data = await client.sendEmailVerification();
    return data;
  } catch (e: any) {
    return e;
  }
};

export const confirm = async (
  { code }: EmailConfirm,
  cookie: Cookie,
  appId: string,
): Promise<void | ErrorResponse> => {
  try {
    const client = createAuthc1Client(cookie, appId);
    const data = await client.confirmEmailWithOtp(code);
    return data;
  } catch (e: any) {
    return e;
  }
};

export const signOut = async (cookie: Cookie) => {
  await cookie.delete(AUTHTOKEN_NAME, { path: "/" });
  return null;
};

export interface JwtPayloadToUser {
  iss: string;
  aud: string | undefined;
  auth_time: number;
  id: string;
  exp: number;
  iat: number;
  email: string;
  sign_in_provider: string;
}

export async function refreshAccessToken(
  authState: AuthState,
  baseUrl: string,
  appId: string,
): Promise<AuthState | null> {
  const refreshToken = authState.refresh_token;

  try {
    const body = {
      refresh_token: refreshToken,
    };
    const responseData: any = await callApi(
      {
        endpoint: "/accounts/access-token",
        method: "POST",
        body,
      },
      baseUrl,
      appId
    );
    return responseData?.data as AuthState;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}

export async function refreshAndSaveAccessToken(
  cookie: Cookie,
  appId: string,
): Promise<AuthState | null> {
  const authState = getAccessTokenFromCookie(cookie, appId);
  const refreshToken = authState.refresh_token;
  try {
    const body = {
      refresh_token: refreshToken,
    };

    const responseData: any = await callApi(
      {
        endpoint: "/accounts/access-token",
        method: "POST",
        body,
      },
      baseUrl,
      appId
    );

    const tokenData: AuthState = responseData?.data;
    cookie.set(AUTHTOKEN_NAME, JSON.stringify(tokenData), {
      httpOnly: true,
      maxAge: [tokenData.expires_in as number, "seconds"],
      path: "/",
    });
    return tokenData;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
}
