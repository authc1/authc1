import { Context, Hono } from "hono";
import { Bindings } from "hono/dist/types/types";
import { D1QB } from "workers-qb";
import { ApplicationSchema } from "../controllers/applications/getById";
import { checkIfApplicationExists } from "../middleware/authenticateApplication";
import { setUnauthorizedResponse, verify } from "../middleware/jwt";

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
  messages: Activity[] = [];
  env: Bindings;

  constructor(state: DurableObjectState, env: Bindings, ctx: Context) {
    this.state = state;
    this.env = env;

    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage?.get<Activity[]>("messages");
      this.messages = stored || [];
    });

    this.app.get("/api/v1/webhook/*/activities", async (c) => {
      let storage = await this.state.storage.list({
        reverse: true,
        limit: 100,
      });

      let backlog = [...storage.values()];
      backlog.reverse();
      const data = backlog.map((item): string => JSON.parse(item as string));
      return c.json({
        data,
      });
    });

    this.app.put("/api/v1/webhook/*/push", async (c) => {
      const body: any = await c.req.json();
      const { clientId, ...data } = body;
      this.sendToClientId(JSON.stringify({ ...data }), clientId);
      return c.json({
        data: "push",
      });
    });

    this.app.get("/api/v1/webhook/applications/*/listen", async (c) => {
      const upgradeHeader = c.req.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }
      const regex = /\/api\/v1\/webhook\/applications\/([^\/]+)\/listen/;
      const { pathname } = new URL(c.req.url);

      const [, applicationId] = pathname?.match(regex) || [];
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
            const db = new D1QB(this.env.__D1_BETA__AUTHC1);
            const applicationInfo = await checkIfApplicationExists(
              db,
              headers["X-Authc1-Id"]
            );

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

  sendToClientId = (message: string, clientId: string) => {
    const sessions = this.sessions.filter(
      (s: Session) => s.clientId === clientId
    );

    sessions.forEach(async (session) => {
      try {
        let key = new Date().toISOString();
        await this.state.storage.put(key, message);
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
