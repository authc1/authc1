import { Context, Hono } from "hono";

const listenController = async (c: Context) => {
  const applicationId = c.req.param("applicationId");
  const id = c.env.AuthC1Activity.idFromName(applicationId);
  const obj = c.env.AuthC1Activity.get(id);
  const originalHeaders = c.req.raw.headers;
  const headers = new Headers();
  originalHeaders.forEach((value, key) => {
    headers.append(key, value);
  });
  const resp = await obj.fetch(`https://activity/listen/${applicationId}`, {
    headers,
  });

  if (resp.status === 404) {
    return c.text("404 Not Found", 404);
  }

  return resp;
};

export default listenController;
