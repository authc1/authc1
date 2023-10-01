import { Hono, Context } from "hono";
import { Bindings } from "hono/dist/types/types";
import { z } from "zod";
import { ApplicationRequest } from "../controller/applications/create";
import {
  ErrorResponse,
  changeEmailNotAllowed,
  expiredOrInvalidCode,
  handleError,
  phoneChangeNotAllowed,
} from "../utils/error-responses";
import { generateUniqueIdWithPrefix } from "../utils/string";
import { createAccessToken, createRefreshToken } from "../utils/token";
import { TokenClient } from "./AuthC1Token";
export const schema = z
  .object({
    id: z.string(),
    applicationId: z.string(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().optional(),
    provider: z.string(),
    emailVerified: z.boolean().default(false),
    phoneVerified: z.boolean().default(false),
    avatarUrl: z.string().optional(),
    providerUserId: z.string().optional(),
    emailVerifyCode: z.string().optional(),
    phoneVerifyCode: z.string().optional(),
    expirationTimestamp: z.number().optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
    claims: z.record(z.any()).nullish(),
    segments: z.record(z.any()).nullish(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone must be provided",
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
  created_at: z.string().datetime(),
});

export type SessionData = z.infer<typeof sessionSchema>;

export type UserData = z.infer<typeof schema>;
export type AccessedApp = z.infer<typeof accessedAppSchema>;

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: UserData;
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
        appSettings: ApplicationRequest;
        user: UserData;
      } = await c.req.json();
      const { appSettings, user } = data;
      const refreshToken = createRefreshToken(c);
      const sessionId = generateUniqueIdWithPrefix();
      this.userData = {
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const accessToken = await this.createAccessTokenForSession(
        sessionId,
        appSettings
      );

      this.sessions = {
        ...this.sessions,
        [sessionId]: {
          sessionId,
          accessToken,
          refreshToken,
          created_at: new Date().toISOString(),
        },
      };

      await Promise.all([
        await this.state.storage?.put({
          userData: this.userData,
          sessions: this.sessions,
        }),
        this.addRefreshToken(
          c,
          refreshToken,
          sessionId,
          appSettings.id as string
        ),
      ]);
      return c.json({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    });

    this.app.get("/", async (c: Context) => {
      return c.json(this.userData || {});
    });

    this.app.post("/apps", async (c: Context) => {
      const {
        appData,
        appSettings,
      }: { appData: AccessedApp; appSettings: ApplicationRequest } =
        await c.req.json();

      if (this.apps[appData.id]) {
        return c.json({
          message: "App already exists",
        });
      }

      this.apps[appData.id] = appData;
      await this.state.storage?.put("apps", this.apps);

      return c.json({
        id: this.userData.id,
      });
    });

    this.app.patch("/", async (c: Context) => {
      const req = await c.req.json();
      const {
        appSettings,
        sessionId,
        userData,
      }: {
        appSettings: ApplicationRequest;
        sessionId: string;
        userData: Partial<UserData>;
      } = req;
      const { claims = {}, segments = {} } = userData;
      if (this.userData.provider === "email" && userData.email) {
        return handleError(changeEmailNotAllowed, c);
      }

      if (this.userData.provider === "phone" && userData.phone) {
        return handleError(phoneChangeNotAllowed, c);
      }

      const accessToken = await this.createAccessTokenForSession(
        sessionId,
        appSettings
      );
      const sessionData = this.sessions[sessionId];
      this.sessions = {
        ...this.sessions,
        [sessionId]: {
          ...sessionData,
          accessToken,
        },
      };

      this.userData = {
        ...this.userData,
        ...userData,
        claims:
          claims === null
            ? {}
            : {
                ...this.userData.claims,
                ...claims,
              },
        segments: {
          ...this.userData.segments,
          ...segments,
        },
      };

      await this.state.storage?.put({
        sessions: this.sessions,
        userData: this.userData,
      });
      return c.json({
        accessToken,
        user: this.userData,
      });
    });

    this.app.patch("/admin/user", async (c: Context) => {
      const req = await c.req.json();
      const {
        userData,
      }: {
        userData: Partial<UserData>;
      } = req;
      const { claims = {}, segments = {} } = userData;
      this.userData = {
        ...this.userData,
        ...userData,
        claims:
          claims === null
            ? {}
            : {
                ...this.userData.claims,
                ...claims,
              },
        segments:
          segments === null
            ? {}
            : {
                ...this.userData.segments,
                ...segments,
              },
      };

      await this.state.storage?.put("userData", this.userData);
      return c.json({
        user: this.userData,
      });
    });

    this.app.get("/apps", async (c: Context) => {
      return c.json(this.apps);
    });

    // TODO: @subh we might not need this anymore, can be handled in the method like this.app.patch("/verifyPhone"
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
      const accessToken = await this.createAccessTokenForSession(
        sessionId,
        appSettings
      );
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

    this.app.patch("/verifyPhone", async (c: Context) => {
      const { phoneVerifyCode, appSettings } = await c.req.json();
      if (
        typeof this.userData.expirationTimestamp === "undefined" ||
        (this.userData.expirationTimestamp as number) < Date.now() / 1000 ||
        (this.userData.phoneVerifyCode as string) !== phoneVerifyCode.toString()
      ) {
        return handleError(expiredOrInvalidCode, c);
      }

      const sessionId = generateUniqueIdWithPrefix();
      const refreshToken = createRefreshToken(c);
      const accessToken = await this.createAccessTokenForSession(
        sessionId,
        appSettings
      );
      const newSession = {
        sessionId,
        accessToken,
        refreshToken,
        created_at: new Date().toISOString(),
      };
      this.sessions = {
        [sessionId]: newSession,
      };
      this.userData.expirationTimestamp = undefined;
      this.userData.phoneVerified = true;
      await Promise.all([
        await this.state.storage?.put({
          userData: this.userData,
          sessions: this.sessions,
        }),
        this.addRefreshToken(
          c,
          refreshToken,
          sessionId,
          appSettings.id as string
        ),
      ]);

      return c.json({
        ...newSession,
      });
    });

    this.app.patch("/verify", async (c: Context) => {
      const { emailVerifyCode, appSettings } = await c.req.json();

      if (
        typeof this.userData.expirationTimestamp === "undefined" ||
        (this.userData.expirationTimestamp as number) < Date.now() / 1000 ||
        (this.userData.emailVerifyCode as string) !== emailVerifyCode.toString()
      ) {
        return handleError(expiredOrInvalidCode, c);
      }

      const sessionId = generateUniqueIdWithPrefix();
      const refreshToken = createRefreshToken(c);
      this.userData.emailVerified = true;
      const accessToken = await this.createAccessTokenForSession(
        sessionId,
        appSettings
      );
      const newSession = {
        sessionId,
        accessToken,
        refreshToken,
        created_at: new Date().toISOString(),
      };
      this.sessions = {
        [sessionId]: newSession,
      };
      this.userData.expirationTimestamp = undefined;
      await this.state.storage?.put({
        userData: this.userData,
        sessions: this.sessions,
      });
      return c.json({
        ...newSession,
      });
    });

    this.app.patch("/reset", async (c: Context) => {
      const { emailVerifyCode, password, appSettings } = await c.req.json();

      if (
        (this.userData.expirationTimestamp as number) < Date.now() / 1000 ||
        (this.userData.emailVerifyCode as string) !== emailVerifyCode
      ) {
        return handleError(expiredOrInvalidCode, c);
      }
      const sessionId = generateUniqueIdWithPrefix();
      const refreshToken = createRefreshToken(c);
      this.userData.emailVerified = true;
      this.userData.password = password;
      const accessToken = await this.createAccessTokenForSession(
        sessionId,
        appSettings
      );
      const newSession = {
        sessionId,
        accessToken,
        refreshToken,
        created_at: new Date().toISOString(),
      };
      this.sessions = {
        [sessionId]: newSession,
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

      const accessToken = await this.createAccessTokenForSession(
        sessionId,
        appSettings
      );

      this.sessions = {
        ...this.sessions,
        [sessionId]: {
          ...sessionData,
          accessToken,
        },
      };

      await Promise.all([this.state.storage?.put("sessions", this.sessions)]);

      return c.json({
        accessToken,
        user: this.userData,
      });
    });
  }

  async addRefreshToken(
    c: Context,
    refreshToken: string,
    sessionId: string,
    applicationId: string
  ) {
    const userObjId = c.env.AuthC1Token.idFromString(refreshToken);
    const stub = c.env.AuthC1Token.get(userObjId);
    const tokenClient = new TokenClient(stub);
    return tokenClient.createToken(
      sessionId,
      refreshToken,
      this.userData.id,
      applicationId
    );
  }

  private async createAccessTokenForSession(
    sessionId: string,
    appSettings: ApplicationRequest
  ): Promise<string> {
    return createAccessToken({
      userId: this.userData.id,
      expiresIn: appSettings.settings.expires_in,
      applicationName: appSettings.name as string,
      email: this.userData.email,
      emailVerified: this.userData.emailVerified,
      phoneVerified: this.userData.phoneVerified,
      applicationId: appSettings.id as string,
      secret: appSettings.settings.secret,
      algorithm: appSettings.settings.algorithm,
      sessionId,
      name: this.userData?.name,
      provider: this.userData?.provider,
      claims: this.userData.claims,
      segments: this.userData.segments || {},
    });
  }

  async fetch(request: Request) {
    return this.app.fetch(request, this.env);
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
        appSettings,
      }),
    });
    const data: AuthResponse = await res.json();
    return data;
  }

  async getUser(): Promise<UserData> {
    const res = await this.user.fetch(`http://user/`);
    const data: UserData = await res.json();
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
    const res = await this.user.fetch(`http://user/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(json),
    });
    const data = await res.json();
    return data;
  }

  async updateUser(
    appSettings: ApplicationRequest,
    sessionId: string,
    userData: Partial<UserData>
  ): Promise<AuthResponse | ErrorResponse> {
    const res = await this.user.fetch("http://user/", {
      method: "PATCH",
      body: JSON.stringify({ appSettings, sessionId, userData }),
    });
    const data: AuthResponse | ErrorResponse = await res.json();
    return data;
  }

  async updateUserByAdmin(
    userData: Partial<UserData>
  ): Promise<AuthResponse | ErrorResponse> {
    const res = await this.user.fetch("http://user/admin/user", {
      method: "PATCH",
      body: JSON.stringify({ userData }),
    });
    const data: AuthResponse | ErrorResponse = await res.json();
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
    appSettings: ApplicationRequest
  ): Promise<SessionData> {
    const res = await this.user.fetch("http://user/reset", {
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
    code: string,
    appSettings: ApplicationRequest
  ) {
    const res = await this.user.fetch("http://user/verify", {
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

  async verifyPhoneCodeAndUpdate(
    code: string,
    appSettings: ApplicationRequest
  ) {
    const res = await this.user.fetch("http://user/verifyPhone", {
      method: "PATCH",
      body: JSON.stringify({
        phoneVerifyCode: code,
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
