import { Context } from "hono";
import { apple } from "worker-auth-providers";
import { handleError, serverError } from "../../../utils/error-responses";
import { ApplicationRequest } from "../../applications/create";
import { handleProviderToken } from "../../../utils/auth-provider";

const appleLoginWithTokenController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const { token } = await c.req.json();
    const { apple_client_id: clientId, apple_private_key: clientSecret } =
      applicationInfo.providerSettings;
    const providerConfig = { clientSecret, clientId, providerId: "apple" };
    const user = await handleProviderToken(
      c,
      {
        providerConfig,
        providerApi: apple,
        providerUserFields: {
          providerUserId: "sub",
          email: "email",
          name: "name",
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

export default appleLoginWithTokenController;
