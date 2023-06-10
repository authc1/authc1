import { github } from "worker-auth-providers";
import { Context } from "hono";
import {
  handleError,
  redirectFailedError,
} from "../../../utils/error-responses";
import { handleProviderCallback } from "../../../utils/auth-provider";
import { ApplicationRequest } from "../../applications/create";

const githubCallbackController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const { github_client_id: clientId, github_client_secret: clientSecret } =
      applicationInfo.providerSettings;
    const providerConfig = { clientSecret, clientId, providerId: 2 };

    const response = await handleProviderCallback(c, {
      providerConfig,
      providerApi: github,
      providerUserFields: {
        providerUserId: "id",
        email: "email",
        name: "name",
        avatarUrl: "avatar_url",
      },
    });

    return response;
  } catch (e: any) {
    console.log("error", e.message);
    return handleError(redirectFailedError, c);
  }
};

export default githubCallbackController;
