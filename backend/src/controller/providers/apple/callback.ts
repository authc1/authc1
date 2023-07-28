import { apple } from "worker-auth-providers";
import { Context } from "hono";
import {
  handleError,
  redirectFailedError,
} from "../../../utils/error-responses";
import { handleProviderCallback } from "../../../utils/auth-provider";
import { ApplicationRequest } from "../../applications/create";
import { convertPrivateKeyToClientSecret } from "worker-auth-providers/dist/providers/apple/users";

const appleCallbackController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const {
      apple_client_id: clientId,
      apple_private_key: privateKey,
      apple_team_id: teamId,
      apple_key_id: keyIdentifier
    } = applicationInfo.providerSettings;
    const body: any = await c.req.parseBody();
    
    console.log("body", JSON.stringify(body));
    
    const clientSecret = await convertPrivateKeyToClientSecret({
      privateKey,
      keyIdentifier,
      teamId,
      clientId,
      expAfter: 3600,
    });
    
    const providerConfig = { clientSecret, clientId, providerId: 2 };
    const response = await handleProviderCallback(c, {
      providerConfig,
      providerApi: apple,
      providerUserFields: {
        providerUserId: "sub",
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

export default appleCallbackController;
