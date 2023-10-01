import { Context } from "hono";
import { z } from "zod";

import {
  handleError,
  createApplicationError,
  nameOrSettingsRequired,
  updateApplicationError,
  unauthorizedDataRequestError,
} from "../../utils/error-responses";
import { handleSuccess, SuccessResponse } from "../../utils/success-responses";
import { ApplicationClient } from "../../do/AuthC1App";
import { checkAccess } from "../../utils/application";
import { ProviderSettings } from "../../models/provider";
import { ApplicationRequest } from "./create";

export const schema = z.object({
  name: z.string().optional(),
  settings: z
    .object({
      expires_in: z.number().optional(),
      secret: z.string().optional(),
      algorithm: z.string().optional(),
      is_dev_mode: z.boolean().default(true),
      dev_mode_code: z.string().default("333333"),
      redirect_uri: z.array(z.string().url()).optional(),
      two_factor_authentication: z.boolean().optional(),
      allow_multiple_accounts: z.boolean().optional(),
      session_expiration_time: z.number().optional(),
      account_deletion_enabled: z.boolean().optional(),
      failed_login_attempts: z.number().optional(),
    })
    .optional(),
});

export const updateApplicationController = async (c: Context) => {
  try {
    const body: Partial<ApplicationRequest> = await c.req.valid("json");
    const applicationId = c.req.param("id");
    const user = c.get("user");
    const hasAccess = await checkAccess(c, user.user_id, applicationId);

    if (!hasAccess) {
      return handleError(unauthorizedDataRequestError, c);
    }

    const id = c.env.AuthC1App.idFromString(applicationId);
    const applicationObj = c.env.AuthC1App.get(id);
    const appClient = new ApplicationClient(applicationObj);

    await appClient.update(body);

    const response: SuccessResponse = {
      message: "Application updated successfully",
      data: {
        id: applicationId,
        ...body,
      },
    };
    return handleSuccess(c, response);
  } catch (err: any) {
    console.log(err);

    return handleError(updateApplicationError, c, err);
  }
};

export default updateApplicationController;
