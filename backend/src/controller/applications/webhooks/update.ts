import { Context } from "hono";
import { checkAccess } from "../../../utils/application";
import {
  createWebhookEndpointError,
  handleError,
  unauthorizedDataRequestError,
  updateWebhookEndpointError,
} from "../../../utils/error-responses";
import { z } from "zod";
import { ApplicationClient } from "../../../do/AuthC1App";
import {
  SuccessResponse,
  handleSuccess,
} from "../../../utils/success-responses";

const WebhookEndpointSchema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
  events: z.array(z.string()),
  enabled: z.boolean(),
  encryptionKey: z.string(),
});

export const WebhookUpdateSchema = WebhookEndpointSchema.partial();

export type WebhookEndpoint = z.infer<typeof WebhookUpdateSchema>;

export const updateApplicationWebhookController = async (c: Context) => {
  const body = await c.req.valid("json");
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
    if (!body) {
      throw new Error("Invalid request body");
    }
    await appClient.updateWebhookEndpoint(webhookId, body);
    const response: SuccessResponse = {
      message: "Webhook endpoint updated successfully",
      data: {
        id: webhookId,
      },
    };
    return handleSuccess(c, response);
  } catch (err) {
    console.log(err);
    return handleError(updateWebhookEndpointError, c, err);
  }
};
