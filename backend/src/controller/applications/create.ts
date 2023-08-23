import { Context } from "hono";
import { z } from "zod";
import { ApplicationClient, AuthC1App } from "../../do/AuthC1App";
import { AccessedApp, UserClient } from "../../do/AuthC1User";
import { ProviderSettingsSchema } from "../../models/provider";
import {
  createApplicationError,
  handleError,
  unauthorizedError,
} from "../../utils/error-responses";
import { defaultSettings } from "../../utils/kv";
import {
  generateRandomID,
  generateUniqueIdWithAuthC1App,
  generateUniqueIdWithPrefix,
} from "../../utils/string";
import { handleSuccess, SuccessResponse } from "../../utils/success-responses";
import { getUserFromToken } from "../../utils/token";

function getCurrentDateTime(): string {
  return new Date().toISOString();
}

export const applicationSettingsSchema = z
  .object({
    expires_in: z.number().default(86400),
    secret: z.string().default(() => generateRandomID() + generateRandomID()),
    algorithm: z.string().default("HS256"),
    redirect_uri: z.array(z.string().url()).optional(),
    two_factor_authentication: z.boolean().default(false),
    allow_multiple_accounts: z.boolean().default(false),
    session_expiration_time: z.number().default(3600),
    account_deletion_enabled: z.boolean().default(false),
    failed_login_attempts: z.number().default(5),
    allow_registration: z.boolean().optional(),
  })
  .default({});

export const schema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  created_at: z.string().datetime().default(getCurrentDateTime),
  updated_at: z.string().datetime().default(getCurrentDateTime),
  settings: applicationSettingsSchema,
  providerSettings: ProviderSettingsSchema.default(defaultSettings),
});

export type ApplicationRequest = z.infer<typeof schema>;
export type ApplicationSettingsSchema = z.infer<
  typeof applicationSettingsSchema
>;

export const createApplicationController = async (c: Context) => {
  try {
    const applicationInfo: ApplicationRequest = c.get("applicationInfo");
    const body: ApplicationRequest = await c.req.valid("json");
    const { name } = body;
    const applicationId = generateUniqueIdWithAuthC1App(c);
    const id = c.env.AuthC1App.idFromString(applicationId);
    const applicationObj = c.env.AuthC1App.get(id);
    const appClient = new ApplicationClient(applicationObj);

    const payload = await getUserFromToken(c, applicationInfo.settings.secret);

    if (payload instanceof Response) {
      return payload;
    }

    const key = `${applicationInfo?.id}:${payload.provider}:${payload?.email}`;
    const userObjId = c.env.AuthC1User.idFromName(key);
    const stub = c.env.AuthC1User.get(userObjId);

    const userClient = new UserClient(stub);
    const user = await userClient.getUser();

    if (!user?.id) {
      return handleError(unauthorizedError, c);
    }
    await appClient.create(
      {
        id: applicationId,
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        providerSettings: defaultSettings,
      },
      {
        id: user.id,
        name: user.name,
        email: user.name,
        invited: false,
      }
    );

    await userClient.setAccess(
      {
        id: applicationId,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        accessType: "owner",
      } as AccessedApp,
      applicationInfo
    );

    const response: SuccessResponse = {
      message: "Application created successfully",
      data: {
        id: applicationId,
        name,
      },
    };
    return handleSuccess(c, response);
  } catch (err: any) {
    console.log(err);
    return handleError(createApplicationError, c, err);
  }
};
