import { Context } from "hono";
import { z } from "zod";
import { checkAccess } from "../../../utils/application";

import {
  unauthorizedDataRequestError,
  getApplicationError,
  handleError,
} from "../../../utils/error-responses";
import { getProviderDefaultSettings } from "../../../utils/kv";
import {
  handleSuccess,
  SuccessResponse,
} from "../../../utils/success-responses";
import { ApplicationRequest } from "../create";

export const schema = z.object({
  select: z.string().trim().optional().default("*"),
});

interface Data {
  [key: string]: any;
}

const getApplicationProvidersController = async (c: Context) => {
  try {
    const fields = c.req.query("select");
    const user = c.get("user");
    const applicationId = c.req.param("id");
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    console.log("fields", fields);
    const key = `${applicationId}:email:${user.email}`;
    const hasAccess = checkAccess(c, key, applicationId);
    if (!hasAccess) {
      return handleError(unauthorizedDataRequestError, c);
    }

    if (applicationId === applicationInfo.id) {
      const response: SuccessResponse = {
        message: "Applications fetched successfully",
        data: applicationInfo.providerSettings,
      };
      return handleSuccess(c, response);
    }

    const data = await getProviderDefaultSettings(c, applicationId);

    const response: SuccessResponse = {
      message: "Applications fetched successfully",
      data,
    };
    return handleSuccess(c, response);
  } catch (err) {
    return handleError(getApplicationError, c, err);
  }
};

export default getApplicationProvidersController;
