import { Context, Hono } from "hono";
import { AuthC1ActivityClient } from "../../../do/AuthC1Activity";

const listenController = async (c: Context) => {
  const applicationId = c.req.param("applicationId");
  const id = c.env.AuthC1Activity.idFromName(applicationId);
  const obj = c.env.AuthC1Activity.get(id);
  const originalHeaders = c.req.raw.headers;
  const headers = new Headers();
  originalHeaders.forEach((value, key) => {
    headers.append(key, value);
  });
  const activityClient = new AuthC1ActivityClient(obj);

  const data = await activityClient.listen(applicationId, headers);

  return data;
};

export default listenController;
