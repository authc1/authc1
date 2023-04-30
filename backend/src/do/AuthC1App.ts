import { Context, Hono } from "hono";
import { z } from "zod";

import { Bindings } from "hono/dist/types/types";
import {
  ApplicationRequest,
  schema as applicationSchema,
} from "../controller/applications/create";
import { generateRandomID } from "../utils/string";

export const ownerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  invited: z.boolean(),
});

const createAppSchema = z.object({
  app: applicationSchema,
  owner: ownerSchema,
});

export const applicationSettingsUpdateSchema = z
  .object({
    expires_in: z.number().default(86400),
    secret: z.string().default(() => generateRandomID() + generateRandomID()),
    algorithm: z.string().default("HS256"),
    redirect_uri: z.string().optional(),
    two_factor_authentication: z.boolean().default(false),
    allow_multiple_accounts: z.boolean().default(false),
    session_expiration_time: z.number().default(3600),
    account_deletion_enabled: z.boolean().default(false),
    failed_login_attempts: z.number().default(5),
    allow_registration: z.boolean().optional(),
  })
  .default({});

export const applicationUpdateschema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  updated_at: z.date().default(new Date()),
  settings: applicationSettingsUpdateSchema,
});

export type UpdateApplicationRequest = z.infer<typeof applicationUpdateschema>;
export type UpdateApplicationSettingsSchema = z.infer<
  typeof applicationSettingsUpdateSchema
>;
export type Owner = z.infer<typeof ownerSchema>;
export type CreateApp = z.infer<typeof createAppSchema>;

export class AuthC1App implements DurableObject {
  state: DurableObjectState;
  env: Bindings;
  app: Hono = new Hono();
  owners: Record<string, Owner> = {};
  appDetails: ApplicationRequest;

  constructor(
    state: DurableObjectState,
    env: Bindings,
    appDetails: ApplicationRequest
  ) {
    this.state = state;
    this.env = env;
    this.appDetails = { ...appDetails };
    this.state.blockConcurrencyWhile(async () => {
      console.log(this.appDetails);
      const result = await this.state.storage?.get(["owners", "appDetails"]);
      const owners = result?.get("owners") as Record<string, Owner>;
      const appDetails = result?.get("appDetails") as ApplicationRequest;
      if (owners) {
        this.owners = owners as Record<string, Owner>;
      }
      if (appDetails) {
        this.appDetails = appDetails as ApplicationRequest;
      }
    });

    this.app.post("/", async (c: Context) => {
      const appData: CreateApp = await c.req.json();
      const { app, owner } = appData;
      const details = {
        ...this.appDetails,
        ...app,
      };
      this.appDetails = details;
      await this.state.storage?.put({
        appDetails: details,
        owners: {
          [owner?.id]: {
            ...owner,
          },
        },
      });
      return c.json({
        ...this.appDetails,
      });
    });

    this.app.patch("/", async (c: Context) => {
      try {
        const appData: ApplicationRequest = await c.req.json();
        const { settings, providerSettings } = appData;
        console.log("appData----------", appData);
        const details = {
          ...this.appDetails,
          ...appData,
          settings: {
            ...this.appDetails.settings,
            ...settings,
          },
          providerSettings: {
            ...this.appDetails.providerSettings,
            ...providerSettings,
          },
        };
        this.appDetails = details;
        await this.state.storage?.put("appDetails", details);
        return c.json({
          ...this.appDetails,
        });
      } catch (e) {
        console.log(e);
        throw e;
      }
    });

    this.app.get("/", async (c: Context) => {
      return c.json({
        ...this.appDetails,
      });
    });

    this.app.patch("/owner", async (c: Context) => {
      const owner: Owner = await c.req.json();
      console.log("owner----------", owner);
      this.owners[owner.id] = owner;
      await this.state.storage?.put("owners", this.owners);
      return c.json(owner);
    });
  }

  async fetch(request: Request) {
    return this.app.fetch(request, this.env);
  }
}

export class ApplicationClient {
  app: DurableObjectStub;

  constructor(app: DurableObjectStub) {
    this.app = app;
  }

  async get(): Promise<ApplicationRequest> {
    const res = await this.app.fetch(`http://app/`);
    const data: ApplicationRequest = await res.json();
    return data;
  }

  async create(
    app: ApplicationRequest,
    owner: Owner
  ): Promise<ApplicationRequest> {
    try {
      console.log("app, owner", app, owner);
      const res = await this.app.fetch("http://app/", {
        method: "POST",
        body: JSON.stringify({ app, owner }),
      });
      const data: ApplicationRequest = await res.json();
      return data;
    } catch (e) {
      console.log("create", e);
      throw e;
    }
  }

  async update(
    payload: Partial<ApplicationRequest>
  ): Promise<ApplicationRequest> {
    const res = await this.app.fetch("http://app/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const data: ApplicationRequest = await res.json();
    return data;
  }

  async setOwner(payload: Owner): Promise<Owner> {
    const res = await this.app.fetch("http://app/owner", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const data: Owner = await res.json();
    return data;
  }
}
