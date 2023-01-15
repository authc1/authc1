import { Context, MiddlewareHandler, Next } from "hono"
import { setUnauthorizedResponse } from "./jwt"

interface ApplicationInfo {
  applicationId: string | null;
  name: string | null;
}

async function checkIfApplicationExists(c: Context, applicationId: string): Promise<ApplicationInfo> {
  try {
    const application = await c.env.AUTHC1.prepare(
      "SELECT name FROM applications WHERE id = ?"
    ).bind(applicationId).first()
    if (application) {
      return {
        applicationId: application.id,
        name: application.name,
      }
    } else {
      return {
        applicationId: null,
        name: null,
      }
    }
  } catch (err) {
    throw err
  }
}

export function authenticateApplication(): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const applicationId = c.req.headers.get('X-Authc1-Id') as string
    const applicationInfo = await checkIfApplicationExists(c, applicationId)
    if (!applicationInfo.applicationId) {
      return setUnauthorizedResponse(c)
    }
    c.set("applicationId", applicationInfo.applicationId)
    c.set("applicationName", applicationInfo.name)
    await next()
  }
}
