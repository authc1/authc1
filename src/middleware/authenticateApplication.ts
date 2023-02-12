import { Context, MiddlewareHandler, Next } from "hono";
import { setUnauthorizedResponse } from "./jwt";

interface ApplicationInfo {
  applicationId: string;
  name: string;
}

function isApplicationInfo(
  applicationInfo: ApplicationInfo | Response
): applicationInfo is ApplicationInfo {
  return (applicationInfo as ApplicationInfo).applicationId !== undefined;
}

function invalidXAuthc1IdResponse(): Response {
  return new Response(
    "The application could not be authenticated, please check the provided X-Authc1-Id.",
    {
      status: 401,
      headers: {
        "content-type": "text/plain",
      },
    }
  );
}

async function checkIfApplicationExists(
  c: Context,
  applicationId: string
): Promise<ApplicationInfo | Response> {
  try {
    console.log("applicationId", applicationId);
    const application = await c.env.AUTHC1.prepare(
      "SELECT name FROM applications WHERE id = ?"
    )
      .bind(applicationId)
      .first();
    console.log(application);
    if (application) {
      return {
        applicationId,
        name: application.name,
      };
    } else {
      return invalidXAuthc1IdResponse();
    }
  } catch (err) {
    throw err;
  }
}

export function authenticateApplication(): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const applicationId = c.req.headers.get("X-Authc1-Id") as string;
    if (!applicationId) {
      return invalidXAuthc1IdResponse();
    }
    const applicationInfo = await checkIfApplicationExists(c, applicationId);
    if (applicationInfo instanceof Response) {
      return applicationInfo;
    }
    if (!applicationInfo.applicationId) {
      return setUnauthorizedResponse(c);
    }
    console.log(applicationInfo);
    c.set("applicationId", applicationInfo.applicationId);
    c.set("applicationName", applicationInfo.name);
    await next();
  };
}
