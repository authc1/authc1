import { Context, Validator } from "hono";
import { IUsers } from "../../models/users";
import { D1QB } from "workers-qb";
import { z } from "zod";

import {
  handleError,
  createApplicationError,
} from "../../utils/error-responses";
import {
  generateRandomID,
  generateUniqueIdWithPrefix,
} from "../../utils/string";
import { handleSuccess, SuccessResponse } from "../../utils/success-responses";
import { storeProviderSettings } from "../../utils/kv";
import { ProviderSettings } from "../../models/provider";

export const schema = z.object({
  name: z.string(),
  settings: z
    .object({
      expires_in: z.number().default(86400),
      secret: z.string().default(() => generateRandomID() + generateRandomID()),
      algorithm: z.string().default("HS256"),
      redirect_uri: z.string().optional(),
      two_factor_authentication: z.coerce.string().optional(),
      session_expiration_time: z.number().default(3600),
      token_expiration_time: z.number().default(86400),
      account_deletion_enabled: z.coerce.string().optional(),
      failed_login_attempts: z.number().optional(),
    })
    .default({}),
});

export type ApplicationRequest = z.infer<typeof schema>;

export const createApplicationController = async (c: Context) => {
  try {
    const db = new D1QB(c.env.AUTHC1);
    const body: ApplicationRequest = await c.req.valid();
    const user: IUsers = c.get("user");
    const { name, settings = {} } = body;
    const id = generateUniqueIdWithPrefix();
    const applicationData = {
      id,
      name,
      user_id: user.id,
    };
    const settingsData = {
      application_id: id,
      ...settings,
    };

    await Promise.all([
      db.insert({
        tableName: "applications",
        data: applicationData,
      }),
      db.insert({
        tableName: "application_settings",
        data: settingsData,
      }),
      storeProviderSettings(c, id),
    ]);
    const response: SuccessResponse = {
      message: "Application created successfully",
      data: {
        id,
        name,
      },
    };
    return handleSuccess(c, response);
  } catch (err: any) {
    console.log(err);
    return handleError(createApplicationError, c, err);
  }
};

export default createApplicationController;
