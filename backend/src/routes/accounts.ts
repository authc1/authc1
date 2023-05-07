import { Handler, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { validateAccessToken } from "../middleware/validateAccessToken";
import updateAccessTokenByRefreshToken, {
  schema as refreshAccessTokenSchema,
} from "../controller/accounts/tokens/update";
import getUserByIdController from "../controller/accounts/me";

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

userRoutes.get("/me", getUserByIdController);
export { accountsRoutes };
