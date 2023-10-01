import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import updateUserByAdminController, {
  updateUserByAdminSchema,
} from "../controller/admin/user/update";
import { validateApiKey } from "../middleware/validateApiKey";

const adminRoutes = new Hono();

adminRoutes.use("*", validateApiKey());

adminRoutes.patch(
  "/users/:userId",
  zValidator("json", updateUserByAdminSchema),
  updateUserByAdminController
);

export { adminRoutes };
