import { Context } from "hono";
import { D1QB } from "workers-qb";
import {
  getApplicationProviderSettings,
  getProviderSettingsForProvider,
} from "./application";
import {
    clientIdNotProvidedError,
  handleError,
  redirectFailedError,
  redirectUrlNotProvidedError,
} from "./error-responses";
import { getUserByEmail, getUserByIdAndProviderUserId } from "./user";
import { createAndSaveTokens } from "./token";
import { createSession } from "./session";
import { generateUniqueIdWithPrefix } from "./string";
import { ApplicationSchema } from "../controllers/applications/getById";

export interface ProviderUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

interface ProviderRedirectOptions {
  clientId: string;
  redirectUri?: string;
  scope?: string;
}

interface User {
  name: string;
  email: string;
  provider_id: number;
  provider_user_id: string;
  application_id: string;
  email_verified: number;
  avatar_url: string;
}

export const saveUser = async (c: Context, user: User): Promise<string> => {
  try {
    const id = generateUniqueIdWithPrefix();
    const db = new D1QB(c.env.AUTHC1);
    await db.insert({
      tableName: "users",
      data: {
        id,
        ...user,
      },
    });
    return id;
  } catch (err: any) {
    throw err;
  }
};

export async function handleProviderCallback(
  c: Context,
  providerOptions: any
): Promise<Response> {
  const { providerConfig, providerApi, providerUserFields, saveUserOptions } =
    providerOptions;
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationSchema;
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

    const allowMultipleAccounts =
      applicationInfo?.settings?.allow_multiple_accounts;
    let userData: any;

    if (allowMultipleAccounts) {
      userData = await getUserByIdAndProviderUserId(
        c,
        email,
        providerUserId as string,
        applicationId,
        ["id"]
      );
    } else {
      userData = await getUserByEmail(c, email as string, applicationId, [
        "id",
      ]);
    }

    const {
      expires_in: expiresIn,
      secret,
      algorithm,
    } = applicationInfo?.settings;

    if (userData?.id) {
      const sessionId = await createSession(c, applicationId, userData?.id);
      const { accessToken, refreshToken } = await createAndSaveTokens(c, {
        applicationName: applicationInfo?.name as string,
        expiresIn: expiresIn as number,
        id: userData?.id,
        sessionId,
        email: email as string,
        emailVerified: true,
        applicationId,
        secret: secret as string,
        algorithm: algorithm as string,
      });

      await c.env.AUTHC1_ACTIVITY_QUEUE.send({
        acitivity: "LoggedIn",
        userId: providerUserId,
        applicationId,
        name,
        email,
        created_at: new Date(),
      });

      return c.redirect(
        `${redirectUrl}?access_token=${accessToken}&refresh_token=${refreshToken}`
      );
    } else {
      const id = await saveUser(c, {
        name: name as string,
        email,
        provider_id: providerId,
        provider_user_id: providerUserId,
        application_id: applicationId,
        email_verified: 1,
        avatar_url: avatarUrl as string,
      });

      const sessionId = await createSession(c, applicationId, id);

      const { accessToken, refreshToken } = await createAndSaveTokens(c, {
        applicationName: applicationInfo?.name as string,
        expiresIn: expiresIn as number,
        id,
        sessionId,
        email: email as string,
        emailVerified: true,
        applicationId,
        secret: secret as string,
        algorithm: algorithm as string,
      });

      await c.env.AUTHC1_ACTIVITY_QUEUE.send({
        acitivity: "Registered",
        userId: providerUserId,
        applicationId,
        name,
        email,
        created_at: new Date(),
      });

      return c.redirect(
        `${redirectUrl}?access_token=${accessToken}?refresh_token=${refreshToken}`
      );
    }

    return c.redirect(
      `${redirectUrl}?error_code=EMAIL_IN_USE&error_message=The email you entered is already in use, please try another one.`
    );
  } catch (e: any) {
    console.log("error", e);
    return handleError(redirectFailedError, c, e);
  }
}

export async function providerRedirect(
  c: Context,
  provider: any,
  options: ProviderRedirectOptions
) {
  try {
    const sessionId = c.get("sessionId") as string;
    const redirectUrl = c.req.queries("redirect_url");

    const location = await provider.redirect({
      options,
    });

    await c.env.AUTHC1_USER_DETAILS.put(
      sessionId,
      JSON.stringify({
        redirect_url: redirectUrl,
      })
    );

    return c.json({
      url: location,
    });
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
