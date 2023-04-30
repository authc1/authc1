import { Context } from "hono";
import { UserClient } from "../../do/AuthC1User";
import { VerifyPayload } from "../../middleware/jwt";
import { ApplicationRequest } from "./create";

export const listApplicationController = async (c: Context) => {
  const user = c.get("user") as VerifyPayload;

  const userObjId = c.env.AuthC1User.idFromString(user.user_id);
  const stub = c.env.AuthC1User.get(userObjId);
  const userClient = new UserClient(stub);
  const userAccessData = await userClient.getAccess();

  return c.json({
    ...userAccessData,
  });
};
