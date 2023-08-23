import { Context } from "hono";
import { google } from "worker-auth-providers";
import { handleError, serverError } from "../../../utils/error-responses";
import { ApplicationRequest } from "../../applications/create";
import { handleProviderToken } from "../../../utils/auth-provider";

const googleLoginWithTokenController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const { token } = await c.req.json();
    const { google_client_id: clientId, google_client_secret: clientSecret } =
      applicationInfo.providerSettings;
    const providerConfig = { clientSecret, clientId, providerId: 3 };
    const user = await handleProviderToken(
      c,
      {
        providerConfig,
        providerApi: google,
        providerUserFields: {
          providerUserId: "id",
          email: "email",
          name: "given_name",
          avatarUrl: "avatar_url",
        },
      },
      token
    );
    if (user instanceof Response) {
      return user;
    }
    return c.json(user);
  } catch (e: any) {
    console.log("error", e.message);
    return handleError(serverError, c);
  }
};

export default googleLoginWithTokenController;
