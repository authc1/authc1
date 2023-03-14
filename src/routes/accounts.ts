import { Handler, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import getUserByIdController from "../controllers/accounts/me";
import confirmEmailResetController, {
  confirmRestPasswordSchema,
} from "../controllers/accounts/password/reset/confirm";
import sendResetCodeController from "../controllers/accounts/password/reset/send";
import verifyPasswordResetCodeController, {
  resetCodeSchema,
} from "../controllers/accounts/password/reset/verify";

import updateAccessTokenByRefreshToken, {
  schema as refreshAccessTokenSchema,
} from "../controllers/accounts/tokens/update";
import updateUserController, {
  updateUserSchema,
} from "../controllers/accounts/update";

import { validateAccessToken } from "../middleware/validateAccessToken";

const accountsRoutes = new Hono();

const passwordRoutes = new Hono();
passwordRoutes.use("*", validateAccessToken());

const userRoutes = new Hono();
userRoutes.use("*", validateAccessToken());

accountsRoutes.route("/password", passwordRoutes);
accountsRoutes.route("/user", passwordRoutes);

accountsRoutes.post(
  "/access-token",
  zValidator("json", refreshAccessTokenSchema),
  updateAccessTokenByRefreshToken
);

passwordRoutes.post("/reset/send-code", sendResetCodeController);

passwordRoutes.post(
  "/reset/verify-code",
  zValidator("json", resetCodeSchema),
  verifyPasswordResetCodeController
);

passwordRoutes.post(
  "/reset/confirm-password",
  zValidator("json", confirmRestPasswordSchema),
  confirmEmailResetController
);

userRoutes.post(
  "/me",
  zValidator("json", updateUserSchema),
  updateUserController
);

userRoutes.get("/me", getUserByIdController);
export { accountsRoutes };
