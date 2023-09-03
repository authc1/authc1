import { google } from "worker-auth-providers";
import { Context } from "hono";
import {
  handleError,
  redirectFailedError,
} from "../../../utils/error-responses";
import { handleProviderCallback } from "../../../utils/auth-provider";
import { ApplicationRequest } from "../../applications/create";

const googleCallbackController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const { google_client_id: clientId, google_client_secret: clientSecret } =
      applicationInfo.providerSettings;
    const providerConfig = { clientSecret, clientId, providerId: "google" };

    const response = await handleProviderCallback(c, {
      providerConfig,
      providerApi: google,
      providerUserFields: {
        providerUserId: "id",
        email: "email",
        name: "name",
        avatarUrl: "picture",
      },
    });

    return response;
  } catch (e: any) {
    console.log("error", e.message);
    return handleError(redirectFailedError, c);
  }
};

export default googleCallbackController;
