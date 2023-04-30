import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { emailLoginController, loginSchema } from "../controller/email/login";

const loginRoutes = new Hono();

loginRoutes.post(
  "email",
  zValidator("json", loginSchema),
  emailLoginController
);

export { loginRoutes };
