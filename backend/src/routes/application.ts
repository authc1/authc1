import { Handler, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createApplicationController,
  schema as applicationSchema,
} from "../controller/applications/create";
import { applicationUpdateschema } from "../do/AuthC1App";
import { getApplicationByIdController } from "../controller/applications/getById";
import { validateAccessToken } from "../middleware/validateAccessToken";
import { listApplicationController } from "../controller/applications/get";
import { applicationActivitiesController } from "../controller/applications/activities/get";
import getApplicationProvidersController from "../controller/applications/providers/get";
import updateApplicationProviderController, {
  schema as updateApplicationProvidersSchema,
} from "../controller/applications/providers/update";
import updateApplicationController, {
  schema as updateApplicationSchema,
} from "../controller/applications/update";

const applicationsRoutes = new Hono();

applicationsRoutes.use("*", validateAccessToken());

applicationsRoutes.post(
  "/",
  zValidator("json", applicationUpdateschema),
  createApplicationController
);

applicationsRoutes.get("/:id", getApplicationByIdController);

applicationsRoutes.post(
  "/:id",
  zValidator("json", updateApplicationSchema),
  updateApplicationController
);

applicationsRoutes.get("/", listApplicationController);

applicationsRoutes.post(
  "/:id/providers",
  zValidator("json", updateApplicationProvidersSchema),
  updateApplicationProviderController
);

applicationsRoutes.get("/:id/providers", getApplicationProvidersController);

applicationsRoutes.get("/:id/activities", applicationActivitiesController);

export { applicationsRoutes };
