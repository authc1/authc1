import { Context } from "hono";
import { ApplicationClient } from "../../../do/AuthC1App";

export const getApplicationWebhookByIdController = async (c: Context) => {
  const applicationId = c.req.param("id");
  const webhookId = c.req.param("webhookId");
  const id = c.env.AuthC1App.idFromString(applicationId);
  const applicationObj = c.env.AuthC1App.get(id);
  const appClient = new ApplicationClient(applicationObj);
  const appData = await appClient.getWebhookEndpoint(webhookId);
  return c.json({
    data: {
      ...appData,
    },
  });
};
