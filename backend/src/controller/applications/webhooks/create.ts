import { Context } from "hono";
import { checkAccess } from "../../../utils/application";
import {
  createWebhookEndpointError,
  handleError,
  unauthorizedDataRequestError,
} from "../../../utils/error-responses";
import { z } from "zod";
import { ApplicationClient } from "../../../do/AuthC1App";
import {
  SuccessResponse,
  handleSuccess,
} from "../../../utils/success-responses";
import { generateUniqueIdWithPrefix } from "../../../utils/string";

export const WebhookEndpointSchema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
  events: z.array(z.string()),
});

export type WebhookEndpoint = z.infer<typeof WebhookEndpointSchema>;

export const createApplicationWebhookController = async (c: Context) => {
  const body = await c.req.valid("json") as Partial<WebhookEndpoint>;
  const user = c.get("user");
  const applicationId = c.req.param("id");
  const hasAccess = await checkAccess(c, user.user_id, applicationId);

  if (!hasAccess) {
    return handleError(unauthorizedDataRequestError, c);
  }

  const id = c.env.AuthC1App.idFromString(applicationId);
  const obj = c.env.AuthC1App.get(id);
  const appClient = new ApplicationClient(obj);

  try {
    const webhookId = generateUniqueIdWithPrefix();
    const data = { ...body, id: webhookId };
    await appClient.addWebhookEndpoint(data);
    const response: SuccessResponse = {
      message: "Webhook endpoint created successfully",
      data: {
        id: webhookId,
      },
    };
    return handleSuccess(c, response);
  } catch (err) {
    console.log(err);
    return handleError(createWebhookEndpointError, c, err);
  }
};
