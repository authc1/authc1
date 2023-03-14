import { Context, MiddlewareHandler, Next } from "hono";
import { D1QB } from "workers-qb";
import {
  ApplicationSchema,
  applicationSchema,
  applicationSettingsSchema,
} from "../controllers/applications/getById";
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

export async function checkIfApplicationExists(
  db: any,
  applicationId: string
): Promise<ApplicationSchema | Response> {
  try {
    const application = await db.fetchOne({
      tableName: "applications",
      fields: "applications.*, application_settings.*",
      where: {
        conditions: "applications.id = ?1",
        params: [applicationId],
      },
      join: {
        table: "application_settings",
        on: "applications.id = application_settings.application_id",
      },
    });
    if (application?.results) {
      const keys = Object.keys(
        applicationSettingsSchema.shape
      ) as (keyof typeof applicationSettingsSchema.shape)[];

      const applicationSettings: {
        [key in keyof typeof applicationSettingsSchema.shape]?: any;
      } = {};

      for (const key of keys) {
        if (!applicationSettingsSchema.hasOwnProperty(key)) {
          applicationSettings[key] = application?.results[key];
        }
      }

      const data: ApplicationSchema = applicationSchema.parse({
        ...application?.results,
        settings: applicationSettings,
      });
      return {
        ...data,
      };
    } else {
      return invalidXAuthc1IdResponse();
    }
  } catch (err) {
    throw err;
  }
}

export function authenticateApplication(id?: string): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const applicationId = id ?? c.req.headers.get("X-Authc1-Id") as string;
    console.log("applicationId form header", applicationId);
    if (!applicationId) {
      return invalidXAuthc1IdResponse();
    }
    const db = new D1QB(c.env.AUTHC1);
    const applicationInfo = await checkIfApplicationExists(db, applicationId);
    if (applicationInfo instanceof Response) {
      return applicationInfo;
    }
    if (!applicationInfo.id) {
      return setUnauthorizedResponse(c);
    }
    c.set("applicationId", applicationInfo.id);
    c.set("applicationName", applicationInfo.name);
    c.set("applicationInfo", applicationInfo);
    await next();
  };
}
