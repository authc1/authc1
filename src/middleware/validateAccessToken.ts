import { Context, MiddlewareHandler, Next } from "hono";
import { ApplicationSchema } from "../controllers/applications/getById";
import { getApplicationSettings } from "../utils/application";
import { getTokenByUserIdAndAccessToken } from "../utils/user";
import { setUnauthorizedResponse, verify } from "./jwt";

type IdRequest = {
  access_token: string;
};

export function validateAccessToken(): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const authorization = c.req.headers.get("Authorization");
    if (!authorization) {
      return setUnauthorizedResponse(c);
    }
    const applicationInfo = c.get("applicationInfo") as ApplicationSchema;
    const token: string = authorization.replace(/Bearer\s+/i, "");
    const { secret } = applicationInfo?.settings;
    console.log("secret", applicationInfo?.settings.secret);
    const payload = await verify(c, token, secret as string);

    if (payload instanceof Response) {
      return payload;
    }

    const { user_id: id, ...rest } = payload;

    const tokens = await getTokenByUserIdAndAccessToken(c, id, token, [
      "session_id",
      "access_token",
    ]);
    if (!tokens || tokens.access_token !== token) {
      return setUnauthorizedResponse(c);
    }
    console.log("tokens.access_token !== token", tokens.access_token !== token);
    c.set("user", { ...rest, id });
    c.set("sessionId", tokens.session_id);
    await next();
  };
}
