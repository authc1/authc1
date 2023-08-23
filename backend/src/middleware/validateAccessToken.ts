import { Context, MiddlewareHandler, Next } from "hono";
import { ApplicationRequest } from "../controller/applications/create";
import { setUnauthorizedResponse, verify } from "./jwt";

export function validateAccessToken(): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const authorization = c.req.headers.get("Authorization");
    if (!authorization) {
      return setUnauthorizedResponse(c);
    }
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const token: string = authorization.replace(/Bearer\s+/i, "");
    const { secret } = applicationInfo?.settings;
    const payload = await verify(c, token, secret as string);

    if (payload instanceof Response) {
      return payload;
    }

    const { user_id: userId, email, ...rest } = payload;

    if (!userId) {
      return setUnauthorizedResponse(c);
    }

    c.set("user", { ...rest, email, user_id: userId });

    await next();
  };
}
