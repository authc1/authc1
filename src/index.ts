import { Hono, Context, Next } from "hono";
import { authenticateApplication } from "./middleware/authenticateApplication";
import { applicationsRoutes } from "./routes/applications";
import { confirmRoutes } from "./routes/confirm";
import { loginRoutes } from "./routes/login";
import { registerRoutes } from "./routes/register";
import { accountsRoutes } from "./routes/accounts";
import { verifyRoutes } from "./routes/verify";
import { Bindings } from "hono/dist/types/types";
import { webhookRoutes } from "./routes/webhook";
import { setupRoutes } from "./routes/setup";
import { providersRoutes } from "./routes/providers";

export { AuthC1Activity } from "./do/AuthC1Activity";

const app = new Hono();
const v1Routes = new Hono();
const v1UnauthRoutes = new Hono();

v1Routes.use("*", async (ctx: Context, next: Next) => {
  const handler = authenticateApplication();
  return await handler(ctx, next);
});

app.get("/", (ctx: Context) => ctx.text("Are you sure?"));

v1Routes.route("/register", registerRoutes);
v1Routes.route("/verify", verifyRoutes);
v1Routes.route("/confirm", confirmRoutes);
v1Routes.route("/login", loginRoutes);
v1Routes.route("/applications", applicationsRoutes);
v1Routes.route("/accounts", accountsRoutes);

v1UnauthRoutes.route("/webhook", webhookRoutes);
v1UnauthRoutes.route("/providers", providersRoutes);
v1UnauthRoutes.route("/setup", setupRoutes);

app.route("/api/v1", v1UnauthRoutes);
app.route("/api/v1", v1Routes);

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
  async queue(batch: MessageBatch<any>, env: any) {
    console.log("-------------------------------------------------------->");
    console.log(
      JSON.stringify({
        count: batch.messages.length,
        messages: batch.messages,
      })
    );

    const promises = batch?.messages?.map((item) => {
      const { body } = item;
      const { applicationId, ...rest } = body;
      const id = env.AuthC1Activity.idFromName(applicationId);
      const obj = env.AuthC1Activity.get(id);
      const json = {
        clientId: applicationId,
        ...rest,
      };
      console.log("json-----------", json);
      return obj.fetch(`http://activity/api/v1/webhook/${applicationId}/push`, {
        method: "PUT",
        body: JSON.stringify(json),
      });
    });
    await Promise.allSettled(promises);
  },
};
