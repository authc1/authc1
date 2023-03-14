import { Context, Hono } from "hono";
import { IUsers } from "../../../models/users";
import {
  handleError,
  unauthorizedDataRequestError,
} from "../../../utils/error-responses";
import { hasRowAccess } from "../../../utils/hasRowAccess";

const listenController = async (c: Context) => {
  const applicationId = c.req.param("applicationId");
  /* const user: IUsers = c.get("user");
  const hasAccess = await hasRowAccess(
    c,
    "applications",
    "id = ?1 AND user_id = ?2",
    [applicationId, user?.id]
  );

  if (!hasAccess) {
    return handleError(unauthorizedDataRequestError, c);
  } */

  const id = c.env.AuthC1Activity.idFromName(applicationId);
  const obj = c.env.AuthC1Activity.get(id);
  console.log("c.req.url", c.req.url);
  const resp = await obj.fetch(c.req);

  if (resp.status === 404) {
    return c.text("404 Not Found", 404);
  }

  return resp;
};

export default listenController;
