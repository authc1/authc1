import { Context } from "hono";
import { google } from "worker-auth-providers";
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

const googleRedirectController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const { google_client_id: clientId } = applicationInfo.providerSettings;
    const format = c.req.query("format") || "redirect";
    const options: BaseProvider.RedirectOptions = {
      options: {
        clientId,
      },
    };

    const allowedRedirectUrls: string[] = applicationInfo?.settings?.redirect_uri || [];
    const redirectUrl = c.req.query("redirect_url") as string || allowedRedirectUrls[0];
    const isAllowedRedirectUrl = allowedRedirectUrls.includes(redirectUrl);

    if (!allowedRedirectUrls.length) {
      return handleError(redirectUrlRequired, c);
    }

    if (!isAllowedRedirectUrl) {
      return handleError(redirectUrlNotValid, c);
    }

    const url = await providerRedirect(c, google, options);

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

export default googleRedirectController;
