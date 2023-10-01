import { Handler, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createApplicationController,
  schema as applicationSchema,
} from "../controller/applications/create";
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
import {
  WebhookEndpointSchema,
  createApplicationWebhookController,
} from "../controller/applications/webhooks/create";
import { getApplicationWebhookController } from "../controller/applications/webhooks/get";
import {
  WebhookUpdateSchema,
  updateApplicationWebhookController,
} from "../controller/applications/webhooks/update";
import { getApplicationWebhookByIdController } from "../controller/applications/webhooks/getById";
import { deleteApplicationWebhookController } from "../controller/applications/webhooks/delete";
import {
  createApiKeyController,
  ApiKeySchema,
} from "../controller/applications/apikeys/create";
import { getApiKeysController } from "../controller/applications/apikeys/get";
import { getApiKeyByIdController } from "../controller/applications/apikeys/getById";
import { deleteApiKeyController } from "../controller/applications/apikeys/delete";
import { updateApiKeyController } from "../controller/applications/apikeys/update";

const applicationsRoutes = new Hono();

applicationsRoutes.use("*", validateAccessToken());

applicationsRoutes.post(
  "/",
  zValidator("json", applicationSchema),
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

applicationsRoutes.get("/:id/webhooks", getApplicationWebhookController);
applicationsRoutes.post(
  "/:id/webhooks",
  zValidator("json", WebhookEndpointSchema),
  createApplicationWebhookController
);
applicationsRoutes.patch(
  "/:id/webhooks/:webhookId",
  zValidator("json", WebhookUpdateSchema),
  updateApplicationWebhookController
);
applicationsRoutes.get(
  "/:id/webhooks/:webhookId",
  getApplicationWebhookByIdController
);
applicationsRoutes.delete(
  "/:id/webhooks/:webhookId",
  deleteApplicationWebhookController
);

applicationsRoutes.get("/:id/apikeys", getApiKeysController);

applicationsRoutes.get("/:id/apikeys/:apiKeyId", getApiKeyByIdController);

applicationsRoutes.post(
  "/:id/apikeys",
  zValidator("json", ApiKeySchema),
  createApiKeyController
);

applicationsRoutes.patch(
  "/:id/apikeys/:apiKeyId",
  zValidator("json", ApiKeySchema),
  updateApiKeyController
);

applicationsRoutes.delete("/:id/apikeys/:apiKeyId", deleteApiKeyController);

export { applicationsRoutes };
