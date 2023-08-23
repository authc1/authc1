import { Context } from "hono";
import { ApplicationClient, AuthC1App } from "../../do/AuthC1App";

export const getApplicationByIdController = async (c: Context) => {
  const applicationId = c.req.param("id");
  const id = c.env.AuthC1App.idFromString(applicationId);
  const applicationObj = c.env.AuthC1App.get(id);
  const appClient = new ApplicationClient(applicationObj);
  const appData = await appClient.get();
  return c.json({
    data: {
      ...appData,
    },
  });
};
