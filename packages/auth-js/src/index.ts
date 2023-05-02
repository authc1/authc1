import { AuthEvent, EventEmitter } from "./utils/events";
import * as EmailAuth from "./auth/email-auth";
import { StorageManager } from "./utils/storage";
import type { Session } from "./auth/email-auth";
export type { Session } from "./auth/email-auth";
export { StorageManager, Storage } from "./utils/storage";

export type AuthStateChangedSubscription = {
  unsubscribe: () => void;
};

export interface Authc1ClientOptions {
  persistSession?: boolean;
  storage?: Storage;
  baseUrl?: string;
}

export class Authc1Client {
  private readonly eventEmitter: EventEmitter;
  private readonly storage: Storage;
  private readonly emailAuthClient: EmailAuth.EmailAuthClient;
  private readonly sessionKey: string;
  private readonly options: Authc1ClientOptions;

  constructor(appId: string, options: Authc1ClientOptions = {}) {
    const apiBaseUrl = options?.baseUrl ?? "https://api.authc1.com/v1";
    const endpoint = `${apiBaseUrl}/${appId}`;
    const sessionKey = `authc1-${appId}-session`;
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

  public async signInWithEmail(
    email: string,
    password: string
  ): Promise<Session> {
    try {
      console.log("auth-js signInWithEmail called", email, password);
      const result = await this.emailAuthClient.login(email, password);
      const session: Session = {
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresIn: result.expires_in,
        localId: result.local_id,
        expiresAt: result.expires_at,
        emailVerified: result.email_verified,
      };
      return session;
    } catch (err) {
      throw err;
    }
  }

  public async registerWithEmail(
    email: string,
    password: string
  ): Promise<void> {
    try {
      await this.emailAuthClient.register(email, password);
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

  public async signOut(): Promise<void> {
    try {
      await this.emailAuthClient.logout();
      await this.clearSession();
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
      console.log(this.sessionKey, sessionData);
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

  public async refreshAccessToken(refreshToken: string): Promise<Session> {
    const data = {
      refresh_token: refreshToken,
    };
    const response = await post("/accounts/access-token", data);
    const session: Session = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      localId: response.data.local_id,
      expiresAt: response.data.expires_at,
      emailVerified: response.data.email_verified,
    };
    await this.setSession(session);
    return session;
  }
}
