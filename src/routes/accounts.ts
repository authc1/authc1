import { Handler, Hono } from "hono";
import getUserByIdController from "../controllers/accounts/me";
import confirmEmailResetController, { confirmRestPasswordSchema } from "../controllers/accounts/password/reset/confirm";
import sendResetCodeController from "../controllers/accounts/password/reset/send";
import verifyPasswordResetCodeController, { resetCodeSchema } from "../controllers/accounts/password/reset/verify";

import updateAccessTokenByRefreshToken, {
  schema as refreshAccessTokenSchema,
} from "../controllers/accounts/tokens/update";
import updateUserController, { updateUserSchema } from "../controllers/accounts/update";

import { validateAccessToken } from "../middleware/validateAccessToken";

import { zValidtor } from "../utils/validator";

const accountsRoutes = new Hono();
accountsRoutes.use("*", validateAccessToken());

const passwordRoutes = new Hono();
accountsRoutes.route("/password", passwordRoutes);

accountsRoutes.post(
  "/access-token",
  zValidtor(refreshAccessTokenSchema),
  updateAccessTokenByRefreshToken
);

passwordRoutes.post(
  "/reset/send-code",
  sendResetCodeController
);

passwordRoutes.post(
  "/reset/verify-code",
  zValidtor(resetCodeSchema),
  verifyPasswordResetCodeController
);

passwordRoutes.post(
  "/reset/confirm-password",
  zValidtor(confirmRestPasswordSchema),
  confirmEmailResetController
);

accountsRoutes.post(
  "/me",
  zValidtor(updateUserSchema),
  updateUserController
);

accountsRoutes.get(
  "/me",
  getUserByIdController
);
export { accountsRoutes };
