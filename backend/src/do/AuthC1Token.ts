import { Context, Hono } from "hono";
import { Bindings } from "hono/dist/types/types";
import { z } from "zod";

export const tokenSchema = z.object({
  accountId: z.string(),
  userId: z.string(),
  sessionId: z.string(),
  refreshToken: z.string(),
  created_at: z.string().datetime(),
});

export type AuthDetials = z.infer<typeof tokenSchema>;

export class AuthC1Token implements DurableObject {
  state: DurableObjectState;
  env: Bindings;
  app: Hono = new Hono();
  tokens: AuthDetials = {
    accountId: "",
    userId: "",
    sessionId: "",
    refreshToken: "",
    created_at: new Date().toISOString(),
  };

  constructor(state: DurableObjectState, env: Bindings) {
    this.state = state;
    this.env = env;

    this.app.patch("/", async (c: Context) => {
      const data: AuthDetials = await c.req.valid();
      const tokens = await this.state.storage?.get<AuthDetials>("tokens");
      await this.state.storage?.put("tokens", {
        ...tokens,
        ...data,
      });
      return c.json({
        refreshToken: data.refreshToken,
        userId: data.userId,
      });
    });

    this.app.post("/", async (c: Context) => {
      const { accessToken, userId, refreshToken, accountId } =
        await c.req.json();
      await this.state.storage?.put("tokens", {
        accountId,
        accessToken,
        refreshToken,
        created_at: new Date().toISOString(),
        userId,
      });
      return c.json({
        accessToken,
        userId,
      });
    });

    this.app.get("/", async (c: Context) => {
      const tokens = await this.state.storage?.get<AuthDetials>("tokens");
      return c.json(tokens);
    });
  }

  async fetch(request: Request) {
    return this.app.fetch(request, this.env);
  }
}

export class TokenClient {
  token: DurableObjectStub;

  constructor(token: DurableObjectStub) {
    this.token = token;
  }

  async createToken(
    sessionId: string,
    refreshToken: string,
    userId: string,
    appId: string
  ): Promise<Response> {
    const json = {
      accountId: appId,
      userId: userId,
      sessionId,
      refreshToken,
      created_at: new Date().toISOString(),
    };

    return this.token.fetch(`http://token/`, {
      method: "POST",
      body: JSON.stringify(json),
    });
  }

  async updateToken(updateData: Partial<AuthDetials>): Promise<AuthDetials> {
    const json: Partial<AuthDetials> = {};

    if (updateData.refreshToken) {
      json.refreshToken = updateData.refreshToken;
    }

    if (updateData.sessionId) {
      json.sessionId = updateData.sessionId;
    }

    const res = await this.token.fetch(`http://token/`, {
      method: "PATCH",
      body: JSON.stringify(json),
    });

    const data: AuthDetials = await res.json();
    return data;
  }

  async getToken(): Promise<AuthDetials> {
    const res = await this.token.fetch(`http://token/`);

    const data: AuthDetials = await res.json();
    return data;
  }
}
