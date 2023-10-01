import { Context } from "hono";
import { checkAccess } from "../../../utils/application";
import {
  apiKeyNotFoundError,
  deleteApiKeyError,
  deleteWebhookEndpointError,
  handleError,
  unauthorizedDataRequestError,
  webhookNotFoundError,
} from "../../../utils/error-responses";
import { ApplicationClient } from "../../../do/AuthC1App";
import {
  SuccessResponse,
  handleSuccess,
} from "../../../utils/success-responses";

export const deleteApiKeyController = async (c: Context) => {
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
    const response = await appClient.deleteApiKey(apiKeyId);

    if (response.status === 200 || response.status === 204) {
      const successResponse: SuccessResponse = {
        message: "API key endpoint deleted successfully",
        data: {
          id: apiKeyId,
        },
      };
      return handleSuccess(c, successResponse);
    } else if (response.status === 404) {
      return handleError(apiKeyNotFoundError, c);
    } else {
      // Handle other error cases
      return handleError(deleteApiKeyError, c);
    }
  } catch (err) {
    console.log(err);
    return handleError(deleteApiKeyError, c, err);
  }
};
