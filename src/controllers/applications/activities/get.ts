import { Context } from "hono";
import { JwtPayloadToUser } from "../../../models/tokens";
import {
  handleError,
  unauthorizedDataRequestError,
} from "../../../utils/error-responses";
import { hasRowAccess } from "../../../utils/hasRowAccess";

export const applicationActivitiesController = async (c: Context) => {
  const applicationId = c.req.param("id");
  const id = c.env.AuthC1Activity.idFromName(applicationId);
  const obj = c.env.AuthC1Activity.get(id);
  const user: JwtPayloadToUser = c.get("user");

  const hasAccess = await hasRowAccess(
    c,
    "applications",
    "id = ?1 AND user_id = ?2",
    [applicationId, user?.id]
  );

  if (!hasAccess) {
    return handleError(unauthorizedDataRequestError, c);
  }

  const res = await obj.fetch(
    `http://activity/api/v1/webhook/${applicationId}/activities`
  );

  const data = await res.json();

  return c.json({
    data,
  });
};
