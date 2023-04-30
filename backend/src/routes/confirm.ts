import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { validateAccessToken } from "../middleware/validateAccessToken";
import { confirmEmailByCodeSchema, confirmEmailControllerByCode } from "../controller/confirm/email";

const confirmRoutes = new Hono();

confirmRoutes.post("/email", validateAccessToken());

confirmRoutes.post(
  "email",
  zValidator("json", confirmEmailByCodeSchema),
  confirmEmailControllerByCode
);
/* confirmRoutes.get(
  "email",
  zValidator("query", confirmEmailByLinkSchema),
  confirmEmailControllerByLink
); */

export { confirmRoutes };
