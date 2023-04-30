import { Context } from "hono";
import { github } from "worker-auth-providers";
import providerRedirect from "../../../utils/auth-provider";
import {
  clientIdNotProvidedError,
  handleError,
  redirectFailedError,
} from "../../../utils/error-responses";
import { ApplicationRequest } from "../../applications/create";

const githubRedirectController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const { github_client_id: clientId } = applicationInfo.providerSettings;

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
