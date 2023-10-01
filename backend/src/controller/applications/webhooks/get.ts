import { Context } from "hono";
import { checkAccess } from "../../../utils/application";
import {
  handleError,
  unauthorizedDataRequestError,
} from "../../../utils/error-responses";
import { ApplicationClient } from "../../../do/AuthC1App";

export const getApplicationWebhookController = async (c: Context) => {
  const user = c.get("user");
  const applicationId = c.req.param("id");
  const hasAccess = await checkAccess(c, user.user_id, applicationId);
  if (!hasAccess) {
    return handleError(unauthorizedDataRequestError, c);
  }

  const id = c.env.AuthC1App.idFromString(applicationId);
  const obj = c.env.AuthC1App.get(id);
  const appClient = new ApplicationClient(obj);

  const data = await appClient.getWebhookEndpoints();

  return c.json({
    data,
  });
};
