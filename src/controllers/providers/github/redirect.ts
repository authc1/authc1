import { Context } from "hono";
import { github } from "worker-auth-providers";
import { getApplicationProviderSettings } from "../../../utils/application";
import providerRedirect from "../../../utils/auth-provider";
import {
  clientIdNotProvidedError,
  handleError,
  redirectFailedError,
} from "../../../utils/error-responses";
import { ApplicationSchema } from "../../applications/getById";

const githubRedirectController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationSchema;
    const { github_client_id: clientId } = await getApplicationProviderSettings(
      c,
      applicationInfo?.id as string
    );

    const options = {
      clientId,
    };

    return providerRedirect(c, github, options);
  } catch (e: any) {
    console.log("error", e.message);
    if (e.message === "No client id passed") {
      return handleError(clientIdNotProvidedError, c);
    }
    return handleError(redirectFailedError, c);
    // throw new HTTPException(401, { message: e.message });
  }
};

export default githubRedirectController;
