import { Context, Hono } from "hono";
import { z } from "zod";

import { Bindings } from "hono/dist/types/types";
import {
  ApplicationRequest,
  schema as applicationSchema,
} from "../controller/applications/create";
import { generateRandomID, generateUniqueIdWithPrefix } from "../utils/string";
import { ProviderSettingsSchema } from "../models/provider";
import { sign } from "../middleware/jwt";

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
    redirect_uri: z.array(z.string().url()).optional(),
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
  providerSettings: ProviderSettingsSchema,
});
export const apiKeySchema = z.object({
  id: z.string(),
  key: z.string(),
  description: z.string(),
  resources: z
    .array(
      z.object({
        resource: z.string(),
        accessLevel: z.enum(["read", "write", "none"]),
      })
    )
    .optional(),
});

export type UpdateApplicationRequest = z.infer<typeof applicationUpdateschema>;
export type UpdateApplicationSettingsSchema = z.infer<
  typeof applicationSettingsUpdateSchema
>;
export type Owner = z.infer<typeof ownerSchema>;
export type CreateApp = z.infer<typeof createAppSchema>;
export type ApiKey = z.infer<typeof apiKeySchema>;

export interface WebhookEndpoint {
  id: string;
  url: string;
  description: string;
  events: string[];
  encryptionKey: string;
  enabled: boolean;
}

export class AuthC1App implements DurableObject {
  state: DurableObjectState;
  env: Bindings;
  app: Hono = new Hono();
  owners: Record<string, Owner> = {};
  appDetails: ApplicationRequest;
  webhookEndpoints: Record<string, WebhookEndpoint> = {};
  apiKeys: Record<string, ApiKey> = {};

  constructor(
    state: DurableObjectState,
    env: Bindings,
    appDetails: ApplicationRequest
  ) {
    this.state = state;
    this.env = env;
    this.appDetails = { ...appDetails };
    this.state.blockConcurrencyWhile(async () => {
      const result = await this.state.storage?.get([
        "owners",
        "appDetails",
        "webhookEndpoints",
        "apiKeys",
      ]);
      const owners = result?.get("owners") as Record<string, Owner>;
      const appDetails = result?.get("appDetails") as ApplicationRequest;
      const webhookEndpoints = result?.get("webhookEndpoints") as Record<
        string,
        WebhookEndpoint
      >;
      const apiKeys = result?.get("apiKeys") as Record<string, ApiKey>;
      if (owners) {
        this.owners = owners as Record<string, Owner>;
      }
      if (appDetails) {
        this.appDetails = appDetails as ApplicationRequest;
      }
      this.webhookEndpoints = webhookEndpoints || {};
      this.apiKeys = apiKeys || {};
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
      this.owners[owner.id] = owner;
      await this.state.storage?.put("owners", this.owners);
      return c.json(owner);
    });

    this.app.get("/webhook/endpoints", async (c) => {
      return c.json(Object.values(this.webhookEndpoints || {}));
    });

    this.app.get("/webhook/endpoints/:id", async (c: Context) => {
      const id = c.req.param("id");
      if (id in this.webhookEndpoints) {
        return c.json(this.webhookEndpoints[id]);
      } else {
        return new Response("Webhook endpoint not found", { status: 404 });
      }
    });

    this.app.post("/webhook/endpoints", async (c) => {
      const body: Omit<WebhookEndpoint, "encryptionKey"> = await c.req.json();
      const encryptionKey = generateRandomID() + generateRandomID();
      const { id } = body;
      this.webhookEndpoints[id] = { encryptionKey, ...body, enabled: true };
      await this.state.storage.put("webhookEndpoints", this.webhookEndpoints);
      return c.json({
        data: {
          id,
        },
        message: "Webhook endpoint added",
      });
    });

    this.app.patch("/webhook/endpoints/:id", async (c: Context) => {
      const id = c.req.param("id");
      const body: Partial<Omit<WebhookEndpoint, "id" | "encryptionKey">> =
        await c.req.json();
      if (id in this.webhookEndpoints) {
        this.webhookEndpoints[id] = { ...this.webhookEndpoints[id], ...body };
        await this.state.storage.put("webhookEndpoints", this.webhookEndpoints);
        return c.json({
          data: "Webhook endpoint updated",
        });
      } else {
        return new Response("Webhook endpoint not found", { status: 404 });
      }
    });

    this.app.delete("/webhook/endpoints/:id", async (c: Context) => {
      const id = c.req.param("id");
      if (id in this.webhookEndpoints) {
        delete this.webhookEndpoints[id];
        await this.state.storage.put("webhookEndpoints", this.webhookEndpoints);
        return c.json({
          data: "Webhook endpoint deleted",
        });
      } else {
        return new Response("Webhook endpoint not found", { status: 404 });
      }
    });

    this.app.post("/apikeys", async (c: Context) => {
      const body: Omit<ApiKey, "key"> = await c.req.json();
      const key = generateRandomID() + generateRandomID();
      const { id } = body;
      this.apiKeys[id] = { key, ...body };
      await this.state.storage?.put("apiKeys", this.apiKeys);
      return c.json({
        data: {
          id,
        },
        message: "API key endpoint added",
      });
    });

    this.app.patch("/apikeys/:id", async (c: Context) => {
      const id = c.req.param("id");
      const body: Partial<Omit<ApiKey, "id" | "key">> = await c.req.json();
      if (id in this.apiKeys) {
        this.apiKeys[id] = { ...this.apiKeys[id], ...body };
        await this.state.storage.put("apiKeys", this.apiKeys);
        return c.json({
          data: "API key updated",
        });
      } else {
        return new Response("API key not found", { status: 404 });
      }
    });

    this.app.get("/apikeys", async (c: Context) => {
      const apiKeys = Object.values(this.apiKeys);
      return c.json(apiKeys);
    });

    this.app.get("/apikeys/:id", async (c: Context) => {
      const id = c.req.param("id");
      if (id in this.apiKeys) {
        const apiKey = this.apiKeys[id];
        return c.json(apiKey);
      } else {
        return new Response("API key not found", { status: 404 });
      }
    });

    this.app.get("/apikeys/keys/:key", async (c: Context) => {
      const key = c.req.param("key");
      const apiKey = Object.values(this.apiKeys).find(
        (apiKey) => apiKey.key === key
      );
      if (apiKey) {
        return c.json(apiKey);
      } else {
        return new Response("API key not found", { status: 404 });
      }
    });

    this.app.delete("/apikeys/:id", async (c: Context) => {
      const id = c.req.param("id");
      if (id in this.apiKeys) {
        delete this.apiKeys[id];
        await this.state.storage.put("apiKeys", this.apiKeys);
        return c.json({
          data: "API key deleted",
        });
      } else {
        return new Response("API key not found", { status: 404 });
      }
    });

    this.app.post("/push-webhook", async (c: Context) => {
      const data = await c.req.json();
      const response = await this.pushToWebhook(data);
      return response;
    });
  }

  async pushToWebhook(data: any): Promise<Response> {
    for (const endpoint of Object.values(this.webhookEndpoints)) {
      if (endpoint.events.includes(data.acitivity)) {
        const signedData = await sign(data, endpoint.encryptionKey, "HS256");

        fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/jwt",
          },
          body: JSON.stringify({
            data: signedData,
          }),
        });
      }
    }

    return new Response("Event data pushed to webhooks", { status: 200 });
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
      const res = await this.app.fetch("http://app/", {
        method: "POST",
        body: JSON.stringify({ app, owner }),
      });
      const data: ApplicationRequest = await res.json();
      return data;
    } catch (e) {
      console.log(e);
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

  async getWebhookEndpoints(): Promise<WebhookEndpoint[]> {
    const res = await this.app.fetch(`http://app/webhook/endpoints`);
    const data: WebhookEndpoint[] = await res.json();
    return data;
  }

  async getWebhookEndpoint(id: string): Promise<WebhookEndpoint> {
    const res = await this.app.fetch(`http://app/webhook/endpoints/${id}`);
    const data: WebhookEndpoint = await res.json();
    return data;
  }

  async addWebhookEndpoint(
    webhookEndpoint: Partial<WebhookEndpoint>
  ): Promise<Response> {
    const res = await this.app.fetch(`http://app/webhook/endpoints`, {
      method: "POST",
      body: JSON.stringify(webhookEndpoint),
    });
    return res;
  }

  async updateWebhookEndpoint(
    id: string,
    webhookEndpoint: Partial<Omit<WebhookEndpoint, "id" | "encryptionKey">>
  ): Promise<Response> {
    const res = await this.app.fetch(`http://app/webhook/endpoints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(webhookEndpoint),
    });
    return res;
  }

  async deleteWebhookEndpoint(id: string): Promise<Response> {
    const res = await this.app.fetch(`http://app/webhook/endpoints/${id}`, {
      method: "DELETE",
    });
    return res;
  }

  async pushToWebhook(data: any): Promise<Response> {
    const res = await this.app.fetch("http://app/push-webhook", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  }

  async addApiKey(apiKey: Partial<ApiKey>): Promise<Response> {
    const res = await this.app.fetch(`http://app/apikeys`, {
      method: "POST",
      body: JSON.stringify(apiKey),
    });
    return res;
  }

  async updateApiKey(
    id: string,
    apiKey: Partial<Omit<ApiKey, "id" | "key">>
  ): Promise<Response> {
    const res = await this.app.fetch(`http://app/apikeys/${id}`, {
      method: "PATCH",
      body: JSON.stringify(apiKey),
    });
    return res;
  }

  async deleteApiKey(id: string): Promise<Response> {
    const res = await this.app.fetch(`http://app/apikeys/${id}`, {
      method: "DELETE",
    });
    return res;
  }

  async getApiKeys(): Promise<ApiKey[]> {
    const res = await this.app.fetch(`http://app/apikeys`);
    const data: ApiKey[] = await res.json();
    return data;
  }

  async getApiKey(id: string): Promise<ApiKey> {
    const res = await this.app.fetch(`http://app/apikeys/${id}`);
    const data: ApiKey = await res.json();
    return data;
  }
  async getApiKeyByKey(id: string): Promise<ApiKey> {
    const res = await this.app.fetch(`http://app/apikeys/keys/${id}`);
    const data: ApiKey = await res.json();
    return data;
  }
}
