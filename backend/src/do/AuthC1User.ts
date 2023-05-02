import { Hono, Context } from "hono";
import { Bindings } from "hono/dist/types/types";
import { z } from "zod";
import { ApplicationRequest } from "../controller/applications/create";
import {
  ErrorResponse,
  expiredOrInvalidCode,
  handleError,
} from "../utils/error-responses";
import { generateUniqueIdWithPrefix } from "../utils/string";
import { createAccessToken, createRefreshToken } from "../utils/token";
import { TokenClient } from "./AuthC1Token";

export const schema = z.object({
  id: z.string(),
  applicationId: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  provider: z.string(),
  emailVerified: z.boolean().default(false),
  avatarUrl: z.string().optional(),
  providerUserId: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const accessedAppSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  accessType: z.enum(["owner", "editor", "viwer"]).default("viwer"),
});

export const sessionSchema = z.object({
  sessionId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  emailVerifyCode: z.string().optional(),
  phoneVerifyCode: z.string().optional(),
  expirationTimestamp: z.number().optional(),
  created_at: z.string().datetime(),
});

export type SessionData = z.infer<typeof sessionSchema>;

export type UserData = z.infer<typeof schema>;
export type AccessedApp = z.infer<typeof accessedAppSchema>;

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export class AuthC1User implements DurableObject {
  state: DurableObjectState;
  env: Bindings;
  app: Hono = new Hono();
  userData: UserData;
  apps: Record<string, AccessedApp> = {};
  sessions: Record<string, SessionData> = {};

  constructor(
    state: DurableObjectState,
    env: Bindings,
    user: UserData,
    apps: Record<string, AccessedApp> = {},
    sessions: Record<string, SessionData> = {}
  ) {
    this.state = state;
    this.env = env;
    this.userData = user;
    this.apps = apps;
    this.sessions = sessions;

    this.state.blockConcurrencyWhile(async () => {
      const result = await this.state.storage?.get([
        "userData",
        "apps",
        "sessions",
      ]);
      const userData = result?.get("userData") as UserData;
      const apps = result?.get("apps") as Record<string, AccessedApp>;
      const sessions = result?.get("sessions") as Record<string, SessionData>;

      if (userData) {
        this.userData = userData;
      }
      if (apps) {
        this.apps = apps;
      }
      if (sessions) {
        this.sessions = sessions;
      }
    });

    this.app.post("/", async (c: Context) => {
      const data: {
        app: ApplicationRequest;
        user: UserData;
      } = await c.req.json();
      const { app, user } = data;
      /* const appId = c.env.AuthC1App.idFromName(app.id);
      const applicationObj = c.env.AuthC1App.get(appId);
      const appClient = new ApplicationClient(applicationObj, c); */
      const refreshToken = createRefreshToken(c);
      const sessionId = generateUniqueIdWithPrefix();
      const accessToken = await createAccessToken({
        userId: user.id,
        expiresIn: app.settings.expires_in,
        applicationName: app.name as string,
        email: user.email,
        emailVerified: user.emailVerified,
        applicationId: app.id as string,
        secret: app.settings.secret,
        algorithm: app.settings.algorithm,
        sessionId,
        name: this.userData?.name,
      });
      this.sessions = {
        ...this.sessions,
        [sessionId]: {
          sessionId,
          accessToken,
          refreshToken,
          created_at: new Date().toISOString(),
        },
      };
      this.userData = {
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await Promise.all([
        await this.state.storage?.put({
          userData: this.userData,
          sessions: this.sessions,
        }),
        this.addRefreshToken(c, sessionId, refreshToken, app.id as string),
      ]);
      return c.json({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    });

    this.app.get("/", async (c: Context) => {
      console.log("this.userData", this.userData);
      return c.json(this.userData || {});
    });

    this.app.post("/apps", async (c: Context) => {
      const {
        appData,
        appSettings,
      }: { appData: AccessedApp; appSettings: ApplicationRequest } =
        await c.req.json();
      console.log("this.apps", this.apps);
      console.log("appData.id", appData.id);

      if (this.apps[appData.id]) {
        return c.json({
          message: "App already exists",
        });
      }

      this.apps[appData.id] = appData;
      await this.state.storage?.put("apps", this.apps);
      await this.state.storage?.setAlarm(
        Date.now() + appSettings.settings.session_expiration_time
      );

      return c.json({
        id: this.userData.id,
      });
    });

    this.app.get("/apps", async (c: Context) => {
      console.log("this.apps-----", this.apps);
      return c.json({
        data: Object.values(this.apps || {}),
      });
    });

    this.app.post("/sessions", async (c: Context) => {
      const {
        appSettings,
        sessionId,
        refreshToken,
      }: {
        appData: AccessedApp;
        appSettings: ApplicationRequest;
        sessionId: string;
        refreshToken: string;
      } = await c.req.json();
      const accessToken = await createAccessToken({
        userId: this.userData.id,
        expiresIn: appSettings.settings.expires_in,
        applicationName: appSettings.name as string,
        email: this.userData.email,
        emailVerified: this.userData.emailVerified,
        applicationId: appSettings.id as string,
        secret: appSettings.settings.secret,
        algorithm: appSettings.settings.algorithm,
        sessionId,
        name: this.userData.name,
      });
      const sessionData = {
        sessionId,
        accessToken,
        refreshToken,
        created_at: new Date().toISOString(),
      };

      this.sessions[sessionId] = sessionData;

      /* const appId = c.env.AuthC1App.idFromName(appSettings.id);
      const applicationObj = c.env.AuthC1App.get(appId);
      const appClient = new ApplicationClient(applicationObj, c); */

      await Promise.all([
        this.state.storage?.put("sessions", this.sessions),
        /* appClient.updateUser({
          lastLogin: new Date().toISOString(),
        }), */
        /* this.addRefreshToken(
          c,
          sessionId,
          refreshToken,
          appSettings?.id as string
        ), */
      ]);

      return c.json({
        accessToken,
        refreshToken,
      });
    });

    this.app.get("/sessions/:sessionId", async (c: Context) => {
      const sessionId = c.req.param("sessionId");
      const sessionData = this.sessions[sessionId];

      if (!sessionData) {
        return c.json({
          message: "Session not found",
        });
      }

      return c.json(sessionData);
    });
    this.app.patch("/sessions/:sessionId", async (c: Context) => {
      const sessionId = c.req.param("sessionId");
      const sessionData = (await c.req.json()) as Partial<SessionData>;
      if (!this.sessions[sessionId]) {
        return c.json({
          message: "Session not found",
        });
      }

      this.sessions[sessionId] = {
        ...this.sessions[sessionId],
        ...sessionData,
      };
      await this.state.storage?.put("sessions", this.sessions);

      return c.json({
        message: "Session updated",
      });
    });

    this.app.patch("/verify/:sessionId", async (c: Context) => {
      const sessionId = c.req.param("sessionId");
      const { emailVerifyCode, appSettings } = await c.req.json();

      const session = this.sessions[sessionId];

      console.log(
        "session",
        (session.expirationTimestamp as number) > Date.now() / 1000
      );

      if (
        (session.expirationTimestamp as number) < Date.now() / 1000 ||
        (session.emailVerifyCode as string) !== emailVerifyCode.toString()
      ) {
        return handleError(expiredOrInvalidCode, c);
      }

      this.userData.emailVerified = true;
      const accessToken = await createAccessToken({
        userId: this.userData.id,
        expiresIn: appSettings.settings.expires_in,
        applicationName: appSettings.name as string,
        email: this.userData.email,
        emailVerified: true,
        applicationId: appSettings.id as string,
        secret: appSettings.settings.secret,
        algorithm: appSettings.settings.algorithm,
        sessionId: session.sessionId,
        name: this.userData.name,
      });

      const newSession = {
        ...session,
        accessToken,
        emailVerifyCode: undefined,
        expirationTimestamp: undefined,
      };
      this.sessions = {
        ...this.sessions,
        [session.sessionId]: newSession,
      };
      await this.state.storage?.put({
        userData: this.userData,
        sessions: this.sessions,
      });
      return c.json({ access_token: accessToken });
    });

    this.app.patch("/reset/:sessionId", async (c: Context) => {
      const sessionId = c.req.param("sessionId");
      const { emailVerifyCode, password, appSettings } = await c.req.json();

      const session = this.sessions[sessionId];

      if (!session) {
        return c.json({ error: "SESSION_ID_REQUIRED" }, 404);
      }

      if (
        (session.expirationTimestamp as number) < Date.now() / 1000 ||
        (session.emailVerifyCode as string) !== emailVerifyCode
      ) {
        return handleError(expiredOrInvalidCode, c);
      }

      this.userData.emailVerified = true;
      const accessToken = await createAccessToken({
        userId: this.userData.id,
        expiresIn: appSettings.settings.expires_in,
        applicationName: appSettings.name as string,
        email: this.userData.email,
        emailVerified: true,
        applicationId: appSettings.id as string,
        secret: appSettings.settings.secret,
        algorithm: appSettings.settings.algorithm,
        sessionId: session.sessionId,
        name: this.userData.name,
      });
      const newSession = {
        ...session,
        accessToken,
        emailVerifyCode: undefined,
        expirationTimestamp: undefined,
        password,
      };
      this.sessions = {
        ...this.sessions,
        [session.sessionId]: newSession,
      };
      await this.state.storage?.put({
        userData: this.userData,
        sessions: this.sessions,
      });
      return c.json({ access_token: accessToken });
    });

    this.app.post("/refresh", async (c: Context) => {
      const { sessionId, appSettings } = await c.req.json();
      const sessionData = this.sessions[sessionId];

      if (!sessionData) {
        return handleError(expiredOrInvalidCode, c);
      }

      const { email, emailVerified, name: userName } = this.userData;
      const { settings, id, name } = appSettings;
      const { secret, algorithm } = settings;
      const { expires_in: expiresIn } = settings;

      const accessToken = await createAccessToken({
        userId: this.userData.id,
        expiresIn,
        applicationName: name as string,
        email,
        emailVerified,
        applicationId: id as string,
        secret,
        algorithm,
        sessionId,
        name: userName,
      });

      this.sessions = {
        ...this.sessions,
        [sessionId]: {
          ...sessionData,
          accessToken,
        },
      };

      /* const appId = c.env.AuthC1App.idFromName(appSettings.id);
      const applicationObj = c.env.AuthC1App.get(appId);
      const appClient = new ApplicationClient(applicationObj, c); */

      await Promise.all([
        this.state.storage?.put("sessions", this.sessions),
        /* appClient.updateUser({
          lastLogin: new Date().toISOString(),
        }), */
      ]);

      return c.json({
        accessToken,
      });
    });
  }

  async addRefreshToken(
    c: Context,
    refreshToken: string,
    sessionId: string,
    applicationId: string
  ) {
    const userObjId = c.env.AuthC1Token.idFromName(refreshToken);
    const stub = c.env.AuthC1Token.get(userObjId);
    const tokenClient = new TokenClient(stub);
    return tokenClient.createToken(
      sessionId,
      refreshToken,
      this.userData.id,
      applicationId
    );
  }

  async fetch(request: Request) {
    return this.app.fetch(request, this.env);
  }

  async clearSessionsByExpiration() {
    const allSessions = await this.sessions;
    const now = new Date().getTime();
    const filteredSessions: Record<string, SessionData> = {};
    Object.entries(allSessions).forEach(([sessionId, sessionData]) => {
      const sessionExpirationTime = new Date(sessionData.created_at).getTime();
      if (sessionExpirationTime >= now) {
        filteredSessions[sessionId] = sessionData;
      }
    });
    this.sessions = filteredSessions;
    await this.state.storage?.put("sessions", this.sessions);
  }

  async alarm() {
    await this.clearSessionsByExpiration();
  }
}

export class UserClient {
  user: DurableObjectStub;

  constructor(user: DurableObjectStub) {
    this.user = user;
  }

  async createUser(
    json: UserData,
    appSettings: ApplicationRequest
  ): Promise<AuthResponse> {
    const res = await this.user.fetch(`http://user/`, {
      method: "POST",
      body: JSON.stringify({
        user: json,
        app: appSettings,
      }),
    });
    const data: AuthResponse = await res.json();
    return data;
  }

  async getUser(): Promise<UserData> {
    const res = await this.user.fetch(`http://user/`);
    const data: UserData = await res.json();
    console.log("data", data);
    return data;
  }

  async setAccess(
    appData: AccessedApp,
    appSettings: ApplicationRequest
  ): Promise<UserData> {
    const res = await this.user.fetch(`http://user/apps`, {
      method: "POST",
      body: JSON.stringify({ appData, appSettings }),
    });
    const data: UserData = await res.json();
    return data;
  }

  async getAccess(): Promise<Record<string, AccessedApp>> {
    const res = await this.user.fetch(`http://user/apps`);
    const data: Record<string, AccessedApp> = await res.json();
    console.log("data", data);
    return data;
  }
  async createSession(
    appSettings: ApplicationRequest,
    sessionId: string,
    refreshToken: string
  ): Promise<AuthResponse> {
    const res = await this.user.fetch(`http://user/sessions`, {
      method: "POST",
      body: JSON.stringify({ appSettings, sessionId, refreshToken }),
    });
    const data: AuthResponse = await res.json();
    return data;
  }

  async updateSession(sessionId: string, json: Partial<SessionData>) {
    console.log("updateSession", sessionId, json);
    const res = await this.user.fetch(`http://user/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(json),
    });
    const data = await res.json();
    return data;
  }

  async getSession(sessionId: string): Promise<SessionData> {
    const res = await this.user.fetch(`http://user/sessions/${sessionId}`);
    const data: SessionData = await res.json();
    return data;
  }

  async resetPassword(
    code: string,
    password: string,
    appSettings: ApplicationRequest,
    sessionId: string
  ): Promise<SessionData> {
    const res = await this.user.fetch(`http://user/reset/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({
        emailVerifyCode: code,
        password,
        appSettings,
      }),
    });
    const data: SessionData = await res.json();
    return data;
  }

  async verifyEmailCodeAndUpdate(
    sessionId: string,
    code: string,
    appSettings: ApplicationRequest
  ) {
    const res = await this.user.fetch(`http://user/verify/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({
        emailVerifyCode: code,
        appSettings,
      }),
    });
    if (!res.ok) {
      const errorData: ErrorResponse = await res.json();
      throw new Error(errorData.error.code);
    }
    const data: SessionData = await res.json();
    return data;
  }

  async refreshToken(
    sessionId: string,
    appSettings: ApplicationRequest
  ): Promise<AuthResponse> {
    const res = await this.user.fetch(`http://user/refresh`, {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        appSettings,
      }),
    });
    const data: AuthResponse = await res.json();
    return data;
  }
}
