import { AuthEvent, EventEmitter } from "./utils/events";
import * as EmailAuth from "./auth/email-auth";
import { StorageManager } from "./utils/storage";
import type {
  AuthCallback,
  ConfirmResetPasswordOptions,
  ForgetPasswordOptions,
  HttpResponse,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
  Session,
} from "./types";
import { post } from "./utils/http";
import PopupWindow, { PopupWindowOptions } from "./auth/PopupWindow";
import { parseQueryParams } from "./utils/query";
export { StorageManager, Storage } from "./utils/storage";
export * from "./types";

export type AuthStateChangedSubscription = {
  unsubscribe: () => void;
};

export interface Authc1ClientOptions {
  persistSession?: boolean;
  storage?: Storage;
  baseUrl?: string;
}

export interface OAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export type SignInOAuthOptions = {
  provider: string;
  options?: {
    scopes?: string[];
    redirect?: boolean;
    redirectTo?: string;
    width?: number;
    height?: number;
    id?: string;
  };
};

export class Authc1Client {
  private readonly eventEmitter: EventEmitter;
  private readonly storage: Storage;
  private readonly emailAuthClient: EmailAuth.EmailAuthClient;
  private readonly sessionKey: string;
  private readonly endpoint: string;
  private readonly options: Authc1ClientOptions;
  private popupWindow: Window | null = null;

  constructor(appId: string, options: Authc1ClientOptions = {}) {
    const apiBaseUrl = options?.baseUrl ?? "https://api.authc1.com/v1";
    const endpoint = `${apiBaseUrl}/${appId}`;
    const sessionKey = `authc1-${appId}-session`;
    this.endpoint = endpoint;
    this.sessionKey = sessionKey;
    this.options = {
      persistSession: options.persistSession !== false,
      storage: options.storage || localStorage,
    };
    const storage = new StorageManager({
      storageType: this.options.storage,
    });
    const eventEmitter = new EventEmitter(appId, storage, sessionKey);
    this.eventEmitter = eventEmitter;
    this.storage = storage;
    this.emailAuthClient = new EmailAuth.EmailAuthClient({
      appId,
      endpoint,
      eventEmitter,
      storage,
      sessionKey,
    });
  }

  public get appUrl(): string {
    return this.endpoint;
  }

  public get webSocketUrl(): string {
    const url = new URL(this.appUrl);
    const protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.protocol = protocol;
    url.pathname = `${url.pathname}`;
    return url.toString();
  }

  public getRedirectUrl(data: SignInOAuthOptions): string {
    const { provider, options = {} } = data;
    const { scopes, redirectTo } = options;
    const redirectUrl = `${this.endpoint}/${provider}/redirect`;
    const url = new URL(redirectUrl);

    if (scopes) {
      url.searchParams.append("scopes", scopes.join(" "));
    }

    if (redirectTo) {
      url.searchParams.append("redirectTo", redirectTo);
    }
    return url.toString();
  }

  public async signInWithOAuth(data: SignInOAuthOptions): Promise<Session> {
    const { provider, options } = data;
    const {
      scopes,
      redirect,
      redirectTo,
      height = 600,
      width = 500,
      id = "AuthC1",
    } = options;

    const redirectUrl = `${this.endpoint}/${provider}/redirect`;
    const url = new URL(redirectUrl);

    if (scopes) {
      url.searchParams.append("scopes", scopes.join(" "));
    }

    if (redirectTo) {
      url.searchParams.append("redirectTo", redirectTo);
    }

    if (redirect) {
      window.location.href = url.toString();
    } else {
      return this.openPopup({ height, width }, url.toString(), id);
    }
  }

  private openPopup = (
    options: PopupWindowOptions,
    url: string,
    id: string
  ): Promise<Session> => {
    return new Promise<Session>(async (resolve, reject) => {
      const popup = PopupWindow.open(url, id, options);

      popup.then(resolve, reject);
    });
  };

  public async getRedirectResult(
    url: string = window.location.href
  ): Promise<Session> {
    const params = parseQueryParams(url);

    console.log("params-------------------", params);

    if (params.error) {
      const error = params.error;
      const errorDescription = params.error_description || "Unknown error";

      throw new Error(`Authentication error: ${error} - ${errorDescription}`);
    }

    if (!params.access_token || !params.refresh_token) {
      throw new Error("Invalid redirect callback");
    }

    const session: Session = {
      accessToken: params.access_token,
      refreshToken: params.refresh_token,
      expiresIn: parseInt(params.expires_in),
      expiresAt: parseInt(params.expires_at),
      emailVerified: params.email_verified === "true",
      localId: params.local_id,
      sessionId: params.session_id
    };

    this.setSession(session);
    this.eventEmitter.emit(AuthEvent.SIGNED_IN, {
      userId: session?.localId,
      session: session?.sessionId,
    });

    if (typeof window !== "undefined") {
      const baseUrl = url.split('?')[0];
      window.history.replaceState({}, document.title, baseUrl);
    }

    return session;
  }

  public async signInWithEmail({
    email,
    password,
  }: LoginRequest): Promise<Session> {
    try {
      const result = await this.emailAuthClient.login({ email, password });
      const session: Session = {
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresIn: result.expires_in,
        localId: result.local_id,
        expiresAt: result.expires_at,
        emailVerified: result.email_verified,
        sessionId: result.session_id
      };
      return session;
    } catch (err) {
      throw err;
    }
  }

  public async registerWithEmail({
    name,
    email,
    password,
  }: RegisterRequest): Promise<Session> {
    try {
      await this.emailAuthClient.register({ name, email, password });
    } catch (err) {
      throw err;
    }
    return;
  }

  public async sendEmailVerification(): Promise<void> {
    try {
      await this.emailAuthClient.sendVerificationEmail();
    } catch (err) {
      throw err;
    }
    return;
  }

  public async forgetEmailPassword(
    options: ForgetPasswordOptions
  ): Promise<void> {
    try {
      await this.emailAuthClient.forgetPassword(options);
    } catch (err) {
      throw err;
    }
    return;
  }

  public async confirmEmailNewPassword(
    options: ConfirmResetPasswordOptions
  ): Promise<void> {
    try {
      await this.emailAuthClient.confirmNewPassword(options);
    } catch (err) {
      throw err;
    }
    return;
  }

  public async signOut(): Promise<void> {
    try {
      await this.logout();
    } catch (err) {
      throw err;
    }
    return;
  }

  public async confirmEmailWithOtp(otp: string): Promise<void> {
    try {
      await this.emailAuthClient.confirmEmail(otp);
    } catch (err) {
      throw err;
    }
    return;
  }

  public getSession(): Session | undefined {
    try {
      const sessionData = this.storage.getItem(this.sessionKey);
      if (sessionData) {
        const parsedSession = JSON.parse(sessionData);
        const session = {
          accessToken: parsedSession.accessToken,
          refreshToken: parsedSession.refreshToken,
          expiresIn: parsedSession.expiresIn,
          localId: parsedSession.localId,
        } as Session;
        return session;
      }
    } catch (err) {
      throw err;
    }
  }

  public setSession(session: Session): void {
    try {
      this.storage.setItem(this.sessionKey, JSON.stringify(session));
    } catch (err) {
      throw err;
    }
    return;
  }

  public onAuthStateChange(
    handler: (event: AuthEvent, session: any) => void
  ): AuthStateChangedSubscription {
    for (const event in AuthEvent) {
      this.eventEmitter.on(AuthEvent[event], (session: any) => {
        handler(AuthEvent[event], session);
      });
    }

    return {
      unsubscribe: () => {
        for (const event in AuthEvent) {
          this.eventEmitter.off(AuthEvent[event], (session: any) => {
            handler(AuthEvent[event], session);
          });
        }
      },
    };
  }

  private async clearSession(): Promise<void> {
    try {
      await this.storage.removeItem(this.sessionKey);
    } catch (err) {
      throw err;
    }
    return;
  }

  public async refreshAccessToken(): Promise<Session> {
    const sessionData = this.storage.getItem(this.sessionKey);
    const parsedSession = JSON.parse(sessionData);
    const data = {
      refresh_token: parsedSession.refreshToken,
    };
    const url = `${this.endpoint}/accounts/access-token`;
    const response = await post<RefreshTokenResponse>(url, data);
    const session: Session = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      localId: response.data.local_id,
      expiresAt: response.data.expires_at,
      emailVerified: response.data.email_verified,
      sessionId: response.data.session_id,
    };
    this.setSession(session);
    return session;
  }

  public async logout(callback?: AuthCallback<any>): Promise<any> {
    await this.clearSession();
    this.eventEmitter.emit(AuthEvent.SIGNED_OUT);
    if (callback) {
      callback(null);
    }
    return null;
  }
}
