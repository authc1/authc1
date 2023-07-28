import { Context, Hono, Next } from "hono";
import githubRedirectController from "../controller/providers/github/redirect";
import githubCallbackController from "../controller/providers/github/callback";
import appleRedirectController from "../controller/providers/apple/redirect";
import { generateUniqueIdWithPrefix } from "../utils/string";
import { emailLoginController, loginSchema } from "../controller/email/login";
import { zValidator } from "@hono/zod-validator";
import {
  emailRegistrationController,
  registerSchema,
} from "../controller/email/register";
import { emailValidationController } from "../controller/verify/email";
import {
  confirmEmailByCodeSchema,
  confirmEmailControllerByCode,
} from "../controller/confirm/email";
import sendResetCodeController, {
  forgetPasswordSchema,
} from "../controller/accounts/password/reset/send";
import confirmEmailResetController, {
  confirmRestPasswordSchema,
} from "../controller/accounts/password/reset/confirm";
import { validateAccessToken } from "../middleware/validateAccessToken";
import appleCallbackController from "../controller/providers/apple/callback";

const providersRoutes = new Hono();

const email = new Hono();
email.use("/verify", validateAccessToken());
email.use("/confirm", validateAccessToken());

export const sessionCookieName = "AuthC1_Session_Id";

providersRoutes.use("*", async (c: Context, next: Next) => {
  let sessionId = c.req.cookie(sessionCookieName);
  if (!sessionId) {
    sessionId = generateUniqueIdWithPrefix();
    c.cookie(sessionCookieName, sessionId);
  }
  c.set("sessionId", sessionId);
  await next();
});

providersRoutes.get("/github/redirect", githubRedirectController);

providersRoutes.get("/github/callback", githubCallbackController);

providersRoutes.get("/apple/redirect", appleRedirectController);
providersRoutes.post("/apple/callback", appleCallbackController);

email.post("/login", zValidator("json", loginSchema), emailLoginController);

email.post(
  "/register",
  zValidator("json", registerSchema),
  emailRegistrationController
);

email.post("/verify", emailValidationController);

email.post(
  "/confirm",
  zValidator("json", confirmEmailByCodeSchema),
  confirmEmailControllerByCode
);

email.post(
  "/forgot-password",
  zValidator("json", forgetPasswordSchema),
  sendResetCodeController
);

email.post(
  "/confirm-password",
  zValidator("json", confirmRestPasswordSchema),
  confirmEmailResetController
);

providersRoutes.route("/email", email);

export { providersRoutes };
