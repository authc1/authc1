import { Context } from "hono";
import { IUsers } from "../../models/users";
import { D1QB, Raw } from "workers-qb";
import { z } from "zod";

import {
  handleError,
  createApplicationError,
  nameOrSettingsRequired,
  updateApplicationError,
  applicationNotFoundError,
} from "../../utils/error-responses";
import { handleSuccess, SuccessResponse } from "../../utils/success-responses";
import { hasRowAccess } from "../../utils/hasRowAccess";

export const schema = z.object({
  name: z.string().optional(),
  settings: z
    .object({
      expires_in: z.number().optional(),
      secret: z.string().optional(),
      algorithm: z.string().optional(),
      redirect_uri: z.string().optional(),
      two_factor_authentication: z.coerce.string().optional(),
      session_expiration_time: z.number().optional(),
      token_expiration_time: z.number().optional(),
      account_deletion_enabled: z.coerce.string().optional(),
      failed_login_attempts: z.number().optional(),
    })
    .optional(),
});

export type ApplicationRequest = z.infer<typeof schema>;

export const updateApplicationController = async (c: Context) => {
  try {
    const db = new D1QB(c.env.AUTHC1);
    const body: ApplicationRequest = await c.req.valid();
    const applicationId = c.req.param("id");

    const user: IUsers = c.get("user");
    const { name, settings } = body;
    if (!name && !settings) {
      return handleError(nameOrSettingsRequired, c);
    }

    const hasAccess = await hasRowAccess(
      c,
      "applications",
      "id = ?1 AND user_id = ?2",
      [applicationId, user?.id]
    );

    if (!hasAccess) {
      return handleError(applicationNotFoundError, c);
    }

    const promises = [];
    if (name) {
      promises.push(
        db.update({
          tableName: "applications",
          data: { name, updated_at: new Raw("CURRENT_TIMESTAMP") },
          where: { conditions: "id = ?1", params: [applicationId] },
        })
      );
    }

    if (settings) {
      promises.push(
        db.update({
          tableName: "application_settings",
          data: { ...settings, updated_at: new Raw("CURRENT_TIMESTAMP") },
          where: { conditions: "application_id = ?1", params: [applicationId] },
        })
      );
    }

    await Promise.all(promises);
    const response: SuccessResponse = {
      message: "Application updated successfully",
      data: {
        id: applicationId,
        name,
        ...settings,
      },
    };
    return handleSuccess(c, response);
  } catch (err: any) {
    console.log(err);

    return handleError(updateApplicationError, c, err);
  }
};

export default updateApplicationController;
