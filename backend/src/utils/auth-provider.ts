import { Context } from "hono";
import { ApplicationRequest } from "../controller/applications/create";
import { AuthResponse, UserClient, UserData } from "../do/AuthC1User";

import {
  clientIdNotProvidedError,
  handleError,
  redirectFailedError,
  redirectUrlNotProvidedError,
} from "./error-responses";
import { generateUniqueIdWithPrefix } from "./string";
import { createRefreshToken } from "./token";
import type { BaseProvider } from "worker-auth-providers";

export async function handleProviderCallback(
  c: Context,
  providerOptions: any
): Promise<Response> {
  const { providerConfig, providerApi, providerUserFields, saveUserOptions } =
    providerOptions;
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const sessionId = c.get("sessionId") as string;
    const applicationId = applicationInfo?.id as string;
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

    const key = `${applicationId}:${providerId}:${email}`;
    const userObjId = c.env.AuthC1User.idFromName(key);
    const stub = c.env.AuthC1User.get(userObjId);
    const userClient = new UserClient(stub);
    const userData = await userClient.getUser();
    const refreshToken = createRefreshToken(c);

    const expiresIn = applicationInfo.settings.expires_in;
    const expiresAt = Math.floor(Date.now() / 1000) + applicationInfo.settings.expires_in

    if (userData?.id) {
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

      return c.redirect(
        `${redirectUrl}?access_token=${accessToken}&refresh_token=${refreshToken}&session_id=${sessionId}&local_id=${userData?.id}&email_verified=${userData?.emailVerified}&expires_at=${expiresAt}&expires_in=${expiresIn}`
      );
    } else {
      const userData: UserData = {
        id: generateUniqueIdWithPrefix(),
        applicationId,
        name,
        email,
        provider: providerId,
        emailVerified: true,
        avatarUrl: avatarUrl as string,
        providerUserId,
      };

      console.log("userData", userData);
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

      return c.redirect(
        `${redirectUrl}?access_token=${accessToken}?refresh_token=${refreshToken}&session_id=${sessionId}&local_id=${userData?.id}&email_verified=${userData?.emailVerified}&expires_at=${expiresAt}&expires_in=${expiresIn}`
      );
    }
  } catch (e: any) {
    console.log("error", e);
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
