import { Handler, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { setupApplicationController, schema } from "../controller/setup/create";
const setupRoutes = new Hono();

setupRoutes.post(
  "/",
  zValidator("json", schema),
  setupApplicationController
);

export { setupRoutes };
