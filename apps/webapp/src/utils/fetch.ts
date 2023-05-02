import type { Cookie } from "@builder.io/qwik-city";
import { refreshAndSaveAccessToken } from "./auth";
import { createAuthc1Client } from "./authc1-client";

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: { [key: string]: any };
  };
  status: number;
}

interface ApiOptions {
  endpoint: string;
  method: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

type AccessToken = string;

export interface AuthState {
  access_token: AccessToken | null;
  refresh_token: string;
  expires_in?: number;
  expires_at: number;
  email_verified?: boolean;
}

export const getAccessTokenFromCookie = (
  cookie: Cookie,
  appId: string
): AuthState => {
  const client = createAuthc1Client(cookie, appId);
  const data = client.getSession();
  return {
    access_token: data?.accessToken as string,
    refresh_token: data?.refreshToken as string,
    expires_in: data?.expiresIn as number,
    expires_at: data?.expiresAt as number,
    email_verified: data?.emailVerified as boolean,
  };
};

export async function callApi<T>(
  options: ApiOptions,
  baseUrl: string,
  appId: string,
  cookie?: Cookie
): Promise<T> {
  try {
    const { endpoint, method, headers, body } = options;
    const apiUrl = `${baseUrl}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers || {}),
    };

    if (cookie) {
      const cookieData = getAccessTokenFromCookie(cookie, appId);
      const currentTime = Math.floor(Date.now() / 1000);
      if (cookieData?.expires_at < currentTime) {
        const authState = await refreshAndSaveAccessToken(cookie, baseUrl, appId);
        if (!authState) {
          throw new Error("Unable to refresh access token.");
        }
        requestHeaders["Authorization"] = `Bearer ${authState.access_token}`;
      } else {
        requestHeaders["Authorization"] = `Bearer ${cookieData.access_token}`;
      }
    }

    const response = await fetch(apiUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = (await response.json()) as T;
    return data;
  } catch (e: any) {
    console.log(e);
    return e;
  }
}
