import { Handler, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { applicationActivitiesController } from "../controllers/applications/activities/get";
import createApplicationController, {
  schema,
} from "../controllers/applications/create";
import listApplicationController from "../controllers/applications/get";
import getApplicationByIdController, {
  schema as getSchema,
} from "../controllers/applications/getById";
import getApplicationProvidersController from "../controllers/applications/providers/get";
import updateApplicationProviderController, {
  schema as updateApplicationProvidersSchema,
} from "../controllers/applications/providers/update";
import updateApplicationController, {
  schema as updateApplicationSchema,
} from "../controllers/applications/update";
import { validateAccessToken } from "../middleware/validateAccessToken";

const applicationsRoutes = new Hono();

applicationsRoutes.use("*", validateAccessToken());

applicationsRoutes.post(
  "/",
  zValidator("json", schema),
  createApplicationController
);
applicationsRoutes.get("/", listApplicationController);
applicationsRoutes.get("/:id", getApplicationByIdController);

applicationsRoutes.post(
  "/:id",
  zValidator("json", updateApplicationSchema),
  updateApplicationController
);

applicationsRoutes.post(
  "/:id/providers",
  zValidator("json", updateApplicationProvidersSchema),
  updateApplicationProviderController
);

applicationsRoutes.get("/:id/providers", getApplicationProvidersController);

applicationsRoutes.get("/:id/activities", applicationActivitiesController);

export { applicationsRoutes };
