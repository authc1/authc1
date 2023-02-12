import { Context } from "hono";
import { D1QB } from "workers-qb";
import { JoinTypes } from "workers-qb/dist/types/enums";
import { z } from "zod";

import {
  applicationNotFoundError,
  getApplicationError,
  handleError,
} from "../../utils/error-responses";
import { handleSuccess, SuccessResponse } from "../../utils/success-responses";

export const schema = z.object({
  select: z.string().trim().optional().default("*"),
});

export const applicationSettingsSchema = z.object({
  application_id: z.string().optional(),
  expires_in: z.number().optional().nullable(),
  secret: z.string().optional().nullable(),
  algorithm: z.string().optional().nullable(),
  redirect_uri: z.string().optional().nullable(),
  two_factor_authentication: z.coerce.boolean().optional(),
  session_expiration_time: z.number().optional().nullable(),
  token_expiration_time: z.number().optional().nullable(),
  account_deletion_enabled: z.coerce.boolean().optional(),
  failed_login_attempts: z.number().optional(),
});

export const applicationSchema = z.object({
  id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  name: z.string().optional(),
  user_id: z.string().optional(),
  settings: applicationSettingsSchema,
});

type ApplicationSchema = z.infer<typeof applicationSchema>;
type ApplicationSettingsSchema = z.infer<typeof applicationSettingsSchema>;

const getApplicationByIdController = async (c: Context) => {
  try {
    const applicationId = c.req.param("id");
    const fields = c.req.query("select");
    const db = new D1QB(c.env.AUTHC1);

    console.log("applicationId", applicationId);

    const application = await db.fetchOne({
      tableName: "applications",
      fields: fields || "applications.*, application_settings.*",
      where: {
        conditions: "applications.id = ?1",
        params: [applicationId],
      },
      join: {
        table: "application_settings",
        on: "applications.id = application_settings.application_id",
      },
    });

    if (!application?.results) {
      return handleError(applicationNotFoundError, c);
    }

    const keys = Object.keys(
      applicationSettingsSchema.shape
    ) as (keyof typeof applicationSettingsSchema.shape)[];

    const applicationSettings: {
      [key in keyof typeof applicationSettingsSchema.shape]?: any;
    } = {};

    for (const key of keys) {
      if (!applicationSettingsSchema.hasOwnProperty(key)) {
        applicationSettings[key] = application?.results[key];
      }
    }

    const data: ApplicationSchema = applicationSchema.parse({
      ...application?.results,
      settings: applicationSettings,
    });

    const response: SuccessResponse = {
      message: "Application fetched successfully",
      data,
    };
    return handleSuccess(c, response);
  } catch (err) {
    return handleError(getApplicationError, c, err);
  }
};

export default getApplicationByIdController;
