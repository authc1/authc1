import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { emailRegistrationController, registerSchema } from "../controller/email/register";

const registerRoutes = new Hono();

registerRoutes.post(
  "email",
  zValidator("json", registerSchema),
  emailRegistrationController
);

export { registerRoutes };
