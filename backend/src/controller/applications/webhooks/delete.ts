import { Context } from "hono";
import { checkAccess } from "../../../utils/application";
import {
  deleteWebhookEndpointError,
  handleError,
  unauthorizedDataRequestError,
  webhookNotFoundError,
} from "../../../utils/error-responses";
import { z } from "zod";
import { ApplicationClient } from "../../../do/AuthC1App";
import {
  SuccessResponse,
  handleSuccess,
} from "../../../utils/success-responses";

export const WebhookEndpointSchema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
  events: z.array(z.string()),
});

export type WebhookEndpoint = z.infer<typeof WebhookEndpointSchema>;

export const deleteApplicationWebhookController = async (c: Context) => {
  const applicationId = c.req.param("id");
  const user = c.get("user");
  const webhookId = c.req.param("webhookId");
  const hasAccess = await checkAccess(c, user.user_id, applicationId);
  if (!hasAccess) {
    return handleError(unauthorizedDataRequestError, c);
  }

  const id = c.env.AuthC1App.idFromString(applicationId);
  const obj = c.env.AuthC1App.get(id);
  const appClient = new ApplicationClient(obj);
  try {
    const response = await appClient.deleteWebhookEndpoint(webhookId);

    // Check the status code of the response
    if (response.status === 200 || response.status === 204) {
      const successResponse: SuccessResponse = {
        message: "Webhook endpoint deleted successfully",
        data: {
          id: webhookId,
        },
      };
      return handleSuccess(c, successResponse);
    } else if (response.status === 404) {
      // If the webhook was not found, send a 404 response
      return handleError(webhookNotFoundError, c);
    } else {
      // Handle other error cases
      return handleError(deleteWebhookEndpointError, c);
    }
  } catch (err) {
    console.log(err);
    return handleError(deleteWebhookEndpointError, c, err);
  }
};
