import { Context, MiddlewareHandler, Next } from "hono";
import { ApplicationClient } from "../do/AuthC1App";
import { setUnauthorizedResponse } from "./jwt";

interface ApplicationInfo {
  applicationId: string;
  name: string;
}

export function authenticateApplication(id?: string): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const applicationId = c.req.param("appId") as string;
    console.log("applicationId", applicationId);
    const id = c.env.AuthC1App.idFromString(applicationId);
    const applicationObj = c.env.AuthC1App.get(id);
    const applicationClient = new ApplicationClient(applicationObj);
    const data = await applicationClient.get();
    if (!data.id) {
      return setUnauthorizedResponse(c);
    }
    c.set("applicationInfo", data);
    await next();
  };
}
