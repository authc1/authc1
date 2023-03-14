import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import setupApplicationController, {
  schema,
} from "../controllers/setup/create";
import providerController, {
  schema as providerSchema,
} from "../controllers/setup/providers/create";

const setupRoutes = new Hono();

setupRoutes.post(
  "application",
  zValidator("json", schema),
  setupApplicationController
);

setupRoutes.post(
  "provders",
  zValidator("json", providerSchema),
  providerController
);

export { setupRoutes };
