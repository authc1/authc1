import type { Cookie } from "@builder.io/qwik-city";
import { AUTHTOKEN_NAME, refreshAndSaveAccessToken } from "./auth";

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

export const getAccessTokenFromCookie = (cookie: Cookie): AuthState => {
  const cookieData = cookie.get(AUTHTOKEN_NAME)?.value as string;
  const data = cookieData ? JSON.parse(cookieData) : {};
  return {
    access_token: data?.access_token,
    refresh_token: data?.refresh_token,
    expires_in: data?.expires_in,
    expires_at: data?.expires_at,
    email_verified: data?.email_verified,
  };
};

export async function callApi<T>(
  options: ApiOptions,
  baseUrl: string,
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
      const cookieData = getAccessTokenFromCookie(cookie);
      const currentTime = Math.floor(Date.now() / 1000);
      if (cookieData?.expires_at < currentTime) {
        const authState = await refreshAndSaveAccessToken(cookie, baseUrl);
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
