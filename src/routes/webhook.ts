import { Hono } from "hono";
import { Context, MiddlewareHandler, Next } from "hono";
import listenController from "../controllers/applications/activities/listen";
import webhookController from "../controllers/webhook";
import { authenticateApplication } from "../middleware/authenticateApplication";
import { validateAccessToken } from "../middleware/validateAccessToken";

const webhookRoutes = new Hono();

// webhookRoutes.use("*", authenticateApplication());

// webhookRoutes.get("/:id/listen", webhookController);

webhookRoutes.get("/applications/:applicationId/listen", listenController);

export { webhookRoutes };
