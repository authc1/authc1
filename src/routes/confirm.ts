import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  confirmEmailControllerByCode,
  confirmEmailControllerByLink,
  confirmEmailByCodeSchema,
  confirmEmailByLinkSchema,
} from "../controllers/confirm/email";
import { validateAccessToken } from "../middleware/validateAccessToken";

const confirmRoutes = new Hono();

confirmRoutes.post("/email", validateAccessToken());

confirmRoutes.post(
  "email",
  zValidator("json", confirmEmailByCodeSchema),
  confirmEmailControllerByCode
);
confirmRoutes.get(
  "email",
  zValidator("query", confirmEmailByLinkSchema),
  confirmEmailControllerByLink
);

export { confirmRoutes };
