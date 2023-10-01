import { Context, Hono } from "hono";
import { Bindings } from "hono/dist/types/types";

import { setUnauthorizedResponse, verify } from "../middleware/jwt";
import { ApplicationClient } from "./AuthC1App";

export class Session {
  constructor(webSocket: WebSocket, clientId: string) {
    this.webSocket = webSocket;
    this.clientId = clientId;
    this.quit = false;
  }
  clientId: string;
  webSocket: WebSocket;
  quit: boolean;
}

interface Activity {
  senderName: string;
  body: string;
}

export class AuthC1Activity {
  sessions: Session[] = [];
  state: DurableObjectState;
  app: Hono = new Hono();
  env: Bindings;

  constructor(state: DurableObjectState, env: Bindings, ctx: Context) {
    this.state = state;
    this.env = env;

    this.app.get("/activities", async (c) => {
      let storage = await this.state.storage.list({
        reverse: true,
        limit: 100,
      });

      let backlog = [...storage.values()];
      backlog.reverse();
      const data = backlog.map((item): string => JSON.parse(item as string));
      return c.json(data);
    });

    this.app.put("/webhook/push", async (c: Context) => {
      const body: any = await c.req.json();
      const { clientId, ...data } = body;
      this.sendToClientId(JSON.stringify({ ...data }), clientId);
      const id = c.env.AuthC1App.idFromString(clientId);
      const applicationObj = c.env.AuthC1App.get(id);
      const applicationClient = new ApplicationClient(applicationObj);
      await applicationClient.pushToWebhook({ ...data });
      return c.json({
        data: "push",
      });
    });

    this.app.get("/listen/:id", async (c: Context) => {
      const upgradeHeader = c.req.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }
      const applicationId = c.req.param("id");
      const id = c.env.AuthC1App.idFromString(applicationId);
      const applicationObj = c.env.AuthC1App.get(id);
      const applicationClient = new ApplicationClient(applicationObj);
      const applicationInfo = await applicationClient.get();
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);
      // @ts-ignore
      server.accept();

      server.addEventListener("message", async (event) => {
        if (event.data === "ready") {
          return;
        }

        const message = JSON.parse(event.data as string);

        if (message?.type === "connection_init") {
          const { headers } = message;
          if (!headers) {
            return setUnauthorizedResponse(ctx);
          }
          try {
            if (applicationInfo instanceof Response) {
              return applicationInfo;
            }

            const token: string = headers["Authorization"].replace(
              /Bearer\s+/i,
              ""
            );

            const payload = await verify(
              ctx,
              token,
              applicationInfo.settings.secret as string,
              applicationInfo.settings.algorithm as string
            );

            const session = new Session(server, applicationId);
            this.sessions.push(session);
            let storage = await this.state.storage.list({
              reverse: true,
              limit: 100,
            });
            let backlog = [...storage.values()];
            backlog.reverse();
            server.send(JSON.stringify(backlog));
          } catch (e) {
            console.log("error on connection_init", e);
          }
        }
      });

      server.addEventListener("close", () => {
        console.log("closed");
      });

      server.addEventListener("error", () => {
        console.log("closed");
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    });
  }

  sendToClientId = async (message: string, clientId: string) => {
    const sessions = this.sessions.filter(
      (s: Session) => s.clientId === clientId
    );

    let key = new Date().toISOString();
    await this.state.storage.put(key, message);
    sessions.forEach(async (session) => {
      try {
        session.webSocket.send(message);
      } catch (error) {
        session.quit = true;
        this.sessions.splice(this.sessions.indexOf(session), 1);
      }
    });
  };

  async fetch(request: Request) {
    return this.app.fetch(request, this.env);
  }
}

export class AuthC1ActivityClient {
  activity: DurableObjectStub;

  constructor(activity: DurableObjectStub) {
    this.activity = activity;
  }

  async getActivities(): Promise<Activity[]> {
    const res = await this.activity.fetch(`http://activity/activities`);
    const data: Activity[] = await res.json();
    return data;
  }

  async pushWebhook(data: any): Promise<Response> {
    const res = await this.activity.fetch("http://activity/webhook/push", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res;
  }

  async listen(id: string, headers: Headers): Promise<Response> {
    try {
      const res = await this.activity.fetch(`http://activity/listen/${id}`, {
        headers,
      });
      return res;
    } catch (error) {
      console.error(`Error in listen method: ${error}`);
      throw error;
    }
  }
}
