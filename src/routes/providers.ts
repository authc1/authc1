import { Context, Hono, Next } from "hono";
import githubRedirectController from "../controllers/providers/github/redirect";
import githubCallbakController from "../controllers/providers/github/callback";
import { authenticateApplication } from "../middleware/authenticateApplication";
import { generateUniqueIdWithPrefix } from "../utils/string";

const providersRoutes = new Hono();

export const sessionCookieName = "AuthC1_Session_Id";

providersRoutes.use("*", async (c: Context, next: Next) => {
  let sessionId = c.req.cookie(sessionCookieName);
  if (!sessionId) {
    sessionId = generateUniqueIdWithPrefix();
    c.cookie(sessionCookieName, sessionId);
  }
  c.set("sessionId", sessionId);
  await next();
});

providersRoutes.use("*", async (c: Context, next: Next) => {
  const applicationId = c.req.param("applicationId");
  const handler = authenticateApplication(applicationId);
  return await handler(c, next);
});

providersRoutes.get(
  "/:applicationId/github/redirect",
  githubRedirectController
);

providersRoutes.get("/:applicationId/github/callback", githubCallbakController);

export { providersRoutes };
