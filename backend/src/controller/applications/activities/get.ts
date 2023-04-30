import { Context } from "hono";
import { UserClient } from "../../../do/AuthC1User";
import { checkAccess } from "../../../utils/application";
import {
  handleError,
  unauthorizedDataRequestError,
} from "../../../utils/error-responses";

export const applicationActivitiesController = async (c: Context) => {
  const user = c.get("user");
  const applicationId = c.req.param("id");
  const key = `${applicationId}:email:${user.email}`;
  const hasAccess = checkAccess(c, key, applicationId);
  if (!hasAccess) {
    return handleError(unauthorizedDataRequestError, c);
  }

  const id = c.env.AuthC1Activity.idFromName(applicationId);
  const obj = c.env.AuthC1Activity.get(id);

  const res = await obj.fetch(`http://activity/activities`);

  const data = await res.json();

  return c.json({
    data,
  });
};
