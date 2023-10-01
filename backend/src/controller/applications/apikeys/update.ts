import { Context } from "hono";
import { checkAccess } from "../../../utils/application";
import {
  handleError,
  unauthorizedDataRequestError,
  updateApiKeyError,
} from "../../../utils/error-responses";
import { ApplicationClient } from "../../../do/AuthC1App";
import {
  SuccessResponse,
  handleSuccess,
} from "../../../utils/success-responses";

export const updateApiKeyController = async (c: Context) => {
  const body = await c.req.valid("json");
  const applicationId = c.req.param("id");
  const user = c.get("user");
  const apiKeyId = c.req.param("apiKeyId");
  const hasAccess = await checkAccess(c, user.user_id, applicationId);
  if (!hasAccess) {
    return handleError(unauthorizedDataRequestError, c);
  }

  const id = c.env.AuthC1App.idFromString(applicationId);
  const obj = c.env.AuthC1App.get(id);
  const appClient = new ApplicationClient(obj);

  try {
    if (!body) {
      throw new Error("Invalid request body");
    }
    await appClient.updateApiKey(apiKeyId, body);
    const response: SuccessResponse = {
      message: "API key updated successfully",
      data: {
        id: apiKeyId,
      },
    };
    return handleSuccess(c, response);
  } catch (err) {
    console.log(err);
    return handleError(updateApiKeyError, c, err);
  }
};
