import { Context } from "hono";
import { github } from "worker-auth-providers";
import type { BaseProvider } from "worker-auth-providers";
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
    const format = c.req.query("format") || "redirect";
    const redirectTo =
      c.req.query("redirect_to") ||
      applicationInfo?.settings?.redirect_uri?.[0];
    const options: BaseProvider.RedirectOptions = {
      options: {
        clientId,
        redirectTo,
      },
    };

    const redirectUrl = await providerRedirect(c, github, options);

    if (format === "json") {
      return c.json({
        url: redirectUrl,
      });
    }
    return c.redirect(redirectUrl);
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
