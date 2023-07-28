import { apple } from "worker-auth-providers";
import { Context } from "hono";
import {
  handleError,
  redirectFailedError,
} from "../../../utils/error-responses";
import { handleProviderCallback } from "../../../utils/auth-provider";
import { ApplicationRequest } from "../../applications/create";
import { convertPrivateKeyToClientSecret } from "worker-auth-providers/dist/providers/apple/users";

/* const privateKey = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg6RUEoafsJBczqZGU
jv6L/1ovkeys9dXDsswF9htbEd6gCgYIKoZIzj0DAQehRANCAAQXb2xQnJvP8AiE
9vZf3gzUNKi+FPHCK/LJa3uFlYoB9yISIA/SpXfu2pSuLDi4vQwiqbXPX5jDJhvy
vBeWzzvv
-----END PRIVATE KEY-----`;
const secret = await convertPrivateKeyToClientSecret({
      privateKey,
      keyIdentifier: "722R6K55K7",
      teamId: "F5SZLQKVH8",
      clientId: "com.authc1.local",
      expAfter: 3600,
    });
 */
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
