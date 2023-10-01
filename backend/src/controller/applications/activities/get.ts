import { Context } from "hono";
import { checkAccess } from "../../../utils/application";
import {
  handleError,
  unauthorizedDataRequestError,
} from "../../../utils/error-responses";
import { AuthC1ActivityClient } from "../../../do/AuthC1Activity";

export const applicationActivitiesController = async (c: Context) => {
  const user = c.get("user");
  const applicationId = c.req.param("id");
  const hasAccess = await checkAccess(c, user.user_id, applicationId);
  if (!hasAccess) {
    return handleError(unauthorizedDataRequestError, c);
  }

  const id = c.env.AuthC1Activity.idFromName(applicationId);
  const obj = c.env.AuthC1Activity.get(id);
  const activityClient = new AuthC1ActivityClient(obj);

  const data = await activityClient.getActivities();

  return c.json({
    data,
  });
};
