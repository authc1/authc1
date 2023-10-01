import { Handler, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { validateAccessToken } from "../middleware/validateAccessToken";
import updateAccessTokenByRefreshToken, {
  schema as refreshAccessTokenSchema,
} from "../controller/accounts/tokens/update";
import getUserByIdController from "../controller/accounts/me";
import updateUserController, {
  updateUserSchema,
} from "../controller/accounts/user/update";
import { updateUserClaimsController } from "../controller/accounts/user/claims/update";

const accountsRoutes = new Hono();

const passwordRoutes = new Hono();
passwordRoutes.use("*", validateAccessToken());

const userRoutes = new Hono();
userRoutes.use("*", validateAccessToken());

accountsRoutes.route("/password", passwordRoutes);

accountsRoutes.post(
  "/access-token",
  zValidator("json", refreshAccessTokenSchema),
  updateAccessTokenByRefreshToken
);

userRoutes.patch(
  "/user",
  zValidator("json", updateUserSchema),
  updateUserController
);
userRoutes.get("/me", getUserByIdController);
userRoutes.patch("/user/claims", updateUserClaimsController);

accountsRoutes.route("/", userRoutes);

export { accountsRoutes };
