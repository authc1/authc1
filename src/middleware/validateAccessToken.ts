import { Context, MiddlewareHandler, Next } from "hono";
import { getApplicationSettings } from "../utils/application";
import { getTokenByUserIdAndAccessToken } from "../utils/user";
import { setUnauthorizedResponse, verify } from "./jwt";

type IdRequest = {
  access_token: string;
};

export function validateAccessToken(): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const authorization = c.req.headers.get("Authorization");
    const applicationId = c.get("applicationId") as string;
    if (!authorization) {
      return setUnauthorizedResponse(c);
    }
    const token: string = authorization.replace(/Bearer\s+/i, "");
    const { secret } = await getApplicationSettings(c, applicationId, [
      "secret",
    ]);
    const payload = await verify(c, token, secret);
    console.log("payload", payload);

    if (!payload) {
      return setUnauthorizedResponse(c);
    }

    const { user_id: id, ...rest } = payload;

    const tokens = await getTokenByUserIdAndAccessToken(c, id, token, [
      "session_id",
      "access_token",
    ]);
    console.log("tokens", tokens);
    if (!tokens || tokens.access_token !== token) {
      return setUnauthorizedResponse(c);
    }
    console.log("tokens.access_token !== token", tokens.access_token !== token);
    c.set("user", { ...rest, id });
    c.set("sessionId", tokens.session_id);
    await next();
  };
}
