import { AuthEvent, EventEmitter } from "../utils/events";
import * as EmailAuth from "./email-auth";
import * as storage from "../utils/storage";
import type { Session } from "./email-auth";

type AuthStateChangedSubscription = {
  unsubscribe: () => void;
};

export class Authc1Client {
  private readonly eventEmitter: EventEmitter;
  private readonly emailAuthClient: EmailAuth.EmailAuthClient;
  private readonly sessionKey: string;

  constructor(appId: string) {
    const eventEmitter = new EventEmitter(appId);
    const endpoint = `https://api.authc1.com/v1/${appId}`;
    this.eventEmitter = eventEmitter;
    this.emailAuthClient = new EmailAuth.EmailAuthClient(appId, endpoint, eventEmitter);
    this.sessionKey = `authc1-${appId}-auth-session`;
  }

  public async signInWithEmail(
    email: string,
    password: string
  ): Promise<Session> {
    try {
      const result = await this.emailAuthClient.login(email, password);
      const session: Session = {
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresIn: result.expires_in,
        localId: result.local_id,
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

  public async sendEmailVerification(email: string): Promise<void> {
    try {
      await this.emailAuthClient.sendVerificationEmail(email);
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

  public async confirmEmailWithOtp(
    email: string,
    otp: string
  ): Promise<void> {
    try {
      await this.emailAuthClient.confirmEmail(email, otp);
    } catch (err) {
      throw err;
    }
    return;
  }

  public async getSession(): Promise<Session | undefined> {
    try {
      const sessionData = await storage.getItem(this.sessionKey);
      if (sessionData) {
        const session: Session = {
          accessToken: sessionData.access_token,
          refreshToken: sessionData.refresh_token,
          expiresIn: sessionData.expires_in,
          localId: sessionData.local_id,
        };
        return session;
      }
    } catch (err) {
      throw err;
    }
  }

  public async setSession(session: Session): Promise<void> {
    try {
      await storage.setItem(this.sessionKey, session);
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
      await storage.removeItem(this.sessionKey);
    } catch (err) {
      throw err;
    }
    return;
  }
}