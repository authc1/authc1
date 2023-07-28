import { Context } from "hono";
import { apple } from "worker-auth-providers";
import type { BaseProvider } from "worker-auth-providers";
import providerRedirect from "../../../utils/auth-provider";
import {
  clientIdNotProvidedError,
  handleError,
  redirectFailedError,
  redirectUrlNotValid,
  redirectUrlRequired,
} from "../../../utils/error-responses";
import { ApplicationRequest } from "../../applications/create";

const appleRedirectController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const {
      apple_client_id: clientId,
      apple_redirect_uri: redirectTo,
      apple_scope: scope = ["email", "name"],
    } = applicationInfo.providerSettings;
    const format = c.req.query("format") || "redirect";
    const options: BaseProvider.RedirectOptions = {
      options: {
        clientId,
        redirectTo,
        scope,
      },
    };

    const allowedRedirectUrls: string[] =
      applicationInfo?.settings?.redirect_uri || [];
    const redirectUrl =
      (c.req.query("redirect_url") as string) || allowedRedirectUrls[0];
    const isAllowedRedirectUrl = allowedRedirectUrls.includes(redirectUrl);

    if (!allowedRedirectUrls.length) {
      return handleError(redirectUrlRequired, c);
    }

    if (!isAllowedRedirectUrl) {
      return handleError(redirectUrlNotValid, c);
    }

    const url = await providerRedirect(c, apple, options);

    console.log("url", url);
    if (format === "json") {
      return c.json({
        url: url,
      });
    }
    return c.redirect(url);
  } catch (e: any) {
    console.log("error", e.message);
    if (e.message === "No client id passed") {
      return handleError(clientIdNotProvidedError, c);
    }
    return handleError(redirectFailedError, c);
    // throw new HTTPException(401, { message: e.message });
  }
};

export default appleRedirectController;
