import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import emailLoginController, { loginSchema } from "../controllers/login/email";

const loginRoutes = new Hono();

// loginRoutes.post('/email', validateIdToken())

loginRoutes.post(
  "email",
  zValidator("json", loginSchema),
  emailLoginController
);


export { loginRoutes };
