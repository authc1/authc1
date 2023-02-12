import { Handler, Hono } from "hono";
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

import { zValidtor } from "../utils/validator";

const applicationsRoutes = new Hono();

applicationsRoutes.use("*", validateAccessToken());

applicationsRoutes.post("/", zValidtor(schema), createApplicationController);
applicationsRoutes.get("/", listApplicationController);
applicationsRoutes.get("/:id", getApplicationByIdController);

applicationsRoutes.post(
  "/:id",
  zValidtor(updateApplicationSchema),
  updateApplicationController
);

applicationsRoutes.post(
  "/:id/providers",
  zValidtor(updateApplicationProvidersSchema),
  updateApplicationProviderController
);

applicationsRoutes.get(
  "/:id/providers",
  getApplicationProvidersController
);

export { applicationsRoutes };
