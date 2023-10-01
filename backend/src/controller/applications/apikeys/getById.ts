import { Context } from "hono";
import { ApplicationClient } from "../../../do/AuthC1App";

export const getApiKeyByIdController = async (c: Context) => {
  const applicationId = c.req.param("id");
  const apiKeyId = c.req.param("apiKeyId");
  const id = c.env.AuthC1App.idFromString(applicationId);
  const applicationObj = c.env.AuthC1App.get(id);
  const appClient = new ApplicationClient(applicationObj);
  const appData = await appClient.getApiKey(apiKeyId);
  return c.json({
    data: {
      ...appData,
    },
  });
};
