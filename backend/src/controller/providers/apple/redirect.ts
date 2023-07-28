import { Context } from "hono";
import { github } from "worker-auth-providers";
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
import queryString from "query-string";

async function redirect({ options }: any): Promise<string> {
  const { clientId, redirectTo, scope = [], state } = options;
  if (!clientId) {
    console.log("no client id");
  }

  const params: any = {
    client_id: clientId,
    redirect_uri: redirectTo,
    response_type: "code id_token",
    scope: scope.join(" "),
    state: state || Math.random().toString(36).substring(7),
    response_mode: "form_post",
  };

  const paramString = queryString.stringify(params);
  const appleLoginUrl = `https://appleid.apple.com/auth/authorize?${paramString}`;
  return appleLoginUrl;
}

const appleRedirectController = async (c: Context) => {
  try {
    const applicationInfo = c.get("applicationInfo") as ApplicationRequest;
    const { github_client_id: clientId } = applicationInfo.providerSettings;
    const format = c.req.query("format") || "redirect";
    const options: BaseProvider.RedirectOptions = {
      options: {
        clientId: "com.authc1.local",
        redirectTo:
          "https://authc1-do.coolbio.workers.dev/v1/2e6f0bee5e12116d8eda63c7edcd2231443b140f4dd8089bd3bed8d10cc7f76b/apple/callback",
        scope: ["email", "name"],
      },
    };

    /* const allowedRedirectUrls: string[] =
      applicationInfo?.settings?.redirect_uri || [];
    const redirectUrl =
      (c.req.query("redirect_url") as string) || allowedRedirectUrls[0];
    const isAllowedRedirectUrl = allowedRedirectUrls.includes(redirectUrl);

    if (!allowedRedirectUrls.length) {
      return handleError(redirectUrlRequired, c);
    }

    if (!isAllowedRedirectUrl) {
      return handleError(redirectUrlNotValid, c);
    } */

    console.log("options", options);

    const url = await redirect(options);

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
