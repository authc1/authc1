import { Context, MiddlewareHandler, Next } from "hono"
import { setUnauthorizedResponse } from "./jwt"

async function checkIfApplicationExists(c: Context, applicationId: string): Promise<boolean> {
  if (!applicationId) {
    return false
  }

  try {
    const total = await c.env.AUTHC1.prepare(
      "SELECT COUNT(*) as count FROM applications WHERE client_id = ?"
    ).bind(applicationId).first('count')
    if (total) {
      return true
    }

    return false
  } catch (err) {
    throw err
  }
}

export function authenticateApplication(): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const applicationId = c.req.headers.get('X-Authc1-Id') as string
    console.log("applicationId", applicationId)
    if (!await checkIfApplicationExists(c, applicationId)) {
      return setUnauthorizedResponse(c)
    }
    await next()
  }
}