import { Context } from "hono";
import { github } from "worker-auth-providers";
import { handleError, serverError } from "../../../utils/error-responses";
import { ApplicationRequest } from "../../applications/create";
import { handleProviderToken } from "../../../utils/auth-provider";

const githubLoginWithTokenController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const { token } = await c.req.json();
    const { github_client_id: clientId, github_client_secret: clientSecret } =
      applicationInfo.providerSettings;
    const providerConfig = { clientSecret, clientId, providerId: 2 };
    const user = await handleProviderToken(
      c,
      {
        providerConfig,
        providerApi: github,
        providerUserFields: {
          providerUserId: "id",
          email: "email",
          name: "name",
          avatarUrl: "avatar_url",
        },
      },
      token
    );
    return c.json(user);
  } catch (e: any) {
    console.log("error", e.message);
    return handleError(serverError, c);
  }
};

export default githubLoginWithTokenController;
