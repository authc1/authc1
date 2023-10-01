import { Context, MiddlewareHandler, Next } from "hono";
import { ApplicationRequest } from "../controller/applications/create";
import { setUnauthorizedResponse, verify } from "./jwt";
import { ApplicationClient } from "../do/AuthC1App";

export function validateApiKey(): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const apiKey = c.req.headers.get("X-Authc1-Api-Key");
    console.log("validateApiKey-----------", apiKey);
    if (!apiKey) {
      return setUnauthorizedResponse(c);
    }
    const applicationId = c.req.param("appId") as string;
    const id = c.env.AuthC1App.idFromString(applicationId);
    const applicationObj = c.env.AuthC1App.get(id);
    const applicationClient = new ApplicationClient(applicationObj);
    const data = await applicationClient.getApiKeyByKey(apiKey);
    if (!data.id) {
      return setUnauthorizedResponse(c);
    }
    await next();
  };
}
