import { Context } from "hono";
import { ApplicationRequest } from "../controller/applications/create";
import { AuthResponse, UserClient, UserData } from "../do/AuthC1User";

import {
  clientIdNotProvidedError,
  handleError,
  redirectFailedError,
  unauthorizedError,
  redirectUrlNotProvidedError,
} from "./error-responses";
import { createRefreshToken } from "./token";
import type { BaseProvider, SocialProvider } from "worker-auth-providers";

interface ProviderOptions<T extends SocialProvider> {
  providerConfig: {
    clientId: string;
    clientSecret: string;
    providerId: string;
  };
  providerApi: T;
  providerUserFields: {
    providerUserId: string;
    email: string;
    name: string;
    avatarUrl: string;
  };
}

interface UserAuthenticationData {
  user: UserData;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  expiresIn: number;
}

interface UserAuthenticationResponse {
  access_token: string;
  refresh_token: string;
  session_id: string;
  local_id: string;
  email_verified: boolean;
  expires_at: number;
  expires_in: number;
}

async function handleUserCreationOrUpdate(
  c: Context,
  applicationInfo: ApplicationRequest,
  providerId: string,
  email: string,
  name: string,
  avatarUrl: string,
  providerUserId: string,
  sessionId: string
): Promise<UserAuthenticationData> {
  const applicationId = applicationInfo?.id as string;
  const key = `${applicationId}:${providerId}:${email}`;
  const userObjId = c.env.AuthC1User.idFromName(key);
  const stub = c.env.AuthC1User.get(userObjId);
  const userClient = new UserClient(stub);
  const userData = await userClient.getUser();
  const refreshToken = createRefreshToken(c);
  const expiresIn = applicationInfo.settings.expires_in;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  // TODO: @subh to remove hardcoded id length change
  if (userData?.id && userData.id.length === 64) {
    const promises = await Promise.all([
      userClient.createSession(applicationInfo, sessionId, refreshToken),
      c.env.AUTHC1_ACTIVITY_QUEUE.send({
        acitivity: "LoggedIn",
        userId: userData?.id,
        applicationId: applicationInfo?.id,
        name: applicationInfo.name,
        email,
        created_at: new Date(),
      }),
    ]);

    const [authDetails] = promises;
    const { accessToken } = authDetails;

    return {
      user: userData,
      accessToken,
      refreshToken,
      expiresAt,
      expiresIn,
    };
  } else {
    const userData = {
      id: userObjId.toString(),
      applicationId,
      name,
      email,
      provider: providerId,
      emailVerified: true,
      avatarUrl,
      providerUserId,
    };
    const promises = await Promise.all([
      userClient.createUser(userData, applicationInfo),
      c.env.AUTHC1_ACTIVITY_QUEUE.send({
        acitivity: "LoggedIn",
        userId: userData?.id,
        applicationId,
        name: applicationInfo.name,
        email,
        created_at: new Date(),
      }),
    ]);

    const [authDetails] = promises;
    const { accessToken, refreshToken } = authDetails as AuthResponse;

    return {
      user: userData,
      accessToken,
      refreshToken,
      expiresAt,
      expiresIn,
    };
  }
}

export async function handleProviderCallback<T extends SocialProvider>(
  c: Context,
  providerOptions: ProviderOptions<T>
): Promise<Response> {
  const { providerConfig, providerApi, providerUserFields } = providerOptions;
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const sessionId = c.get("sessionId") as string;
    const { clientId, clientSecret, providerId } = providerConfig;

    const sessionData = await c.env.AUTHC1_USER_DETAILS.get(sessionId, {
      type: "json",
    });

    const { redirect_url: redirectUrl } = sessionData;

    if (!redirectUrl) {
      return handleError(redirectUrlNotProvidedError, c);
    }

    const { user: providerUser } = await providerApi.users({
      options: { clientSecret, clientId },
      request: c.req as any,
    });

    const providerUserId = providerUser[providerUserFields.providerUserId];
    const email = providerUser[providerUserFields.email];
    const name = providerUser[providerUserFields.name];
    const avatarUrl = providerUser[providerUserFields.avatarUrl];

    const { accessToken, refreshToken, expiresAt, expiresIn, user } =
      await handleUserCreationOrUpdate(
        c,
        applicationInfo,
        providerId,
        email,
        name,
        avatarUrl,
        providerUserId,
        sessionId
      );
    return c.redirect(
      `${redirectUrl}?access_token=${accessToken}&refresh_token=${refreshToken}&session_id=${sessionId}&local_id=${user?.id}&email_verified=${user?.emailVerified}&expires_at=${expiresAt}&expires_in=${expiresIn}`
    );
  } catch (e: any) {
    console.log("error", e);
    return handleError(redirectFailedError, c, e);
  }
}
export async function handleProviderToken<T extends SocialProvider>(
  c: Context,
  providerOptions: ProviderOptions<T>,
  token: string
): Promise<UserAuthenticationResponse | Response> {
  const { providerConfig, providerApi, providerUserFields } = providerOptions;
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const sessionId = c.get("sessionId") as string;
    const { providerId } = providerConfig;

    const providerUser = await providerApi.getUser(token);
    if (providerUser.error) {
      return handleError(unauthorizedError, c, providerUser.error);
    }
    const providerUserId = providerUser[providerUserFields.providerUserId];
    const email = providerUser[providerUserFields.email];
    const name = providerUser[providerUserFields.name];
    const avatarUrl = providerUser[providerUserFields.avatarUrl];

    const data = await handleUserCreationOrUpdate(
      c,
      applicationInfo,
      providerId,
      email,
      name,
      avatarUrl,
      providerUserId,
      sessionId
    );
    return {
      access_token: data.accessToken,
      refresh_token: data.refreshToken as string,
      session_id: sessionId,
      local_id: data.user.id,
      email_verified: data.user.emailVerified,
      expires_in: data.expiresIn,
      expires_at: data.expiresAt,
    };
  } catch (e: any) {
    console.log(e);
    return handleError(redirectFailedError, c, e);
  }
}

export async function providerRedirect(
  c: Context,
  provider: any,
  options: BaseProvider.RedirectOptions
) {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const location = await provider.redirect(options);
    const sessionId = c.get("sessionId") as string;
    const redirectUrl = c.req.query("redirect_url") as string;
    const allowedRedirectUrls: string[] =
      applicationInfo?.settings?.redirect_uri || [];

    await c.env.AUTHC1_USER_DETAILS.put(
      sessionId,
      JSON.stringify({
        redirect_url: redirectUrl || allowedRedirectUrls[0],
      })
    );

    return location;
  } catch (e: any) {
    console.log("error", e.message);
    if (e.message === "No client id passed") {
      return handleError(clientIdNotProvidedError, c);
    }
    return handleError(redirectFailedError, c);
    // throw new HTTPException(401, { message: e.message });
  }
}

export default providerRedirect;
