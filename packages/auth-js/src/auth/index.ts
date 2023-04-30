import { AuthEvent, EventEmitter } from "../utils/events";
import * as EmailAuth from "./email-auth";
import * as storage from "../utils/storage";

type AuthStateChangedSubscription = {
  unsubscribe: () => void;
};

export class Authc1Client {
  private readonly appId: string;
  private readonly eventEmitter: EventEmitter;
  private readonly emailAuthClient: EmailAuth.EmailAuthClient;
  private readonly sessionKey: string;

  constructor(appId: string) {
    const eventEmitter = new EventEmitter(appId);
    const endpoint = `https://api.authc1.com/v1/${appId}`;
    this.appId = appId;
    this.eventEmitter = eventEmitter;
    this.emailAuthClient = new EmailAuth.EmailAuthClient(appId, endpoint, eventEmitter);
    this.sessionKey = `authc1-${appId}-auth-session`;
  }

  public async signInWithEmail(
    email: string,
    password: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    await this.emailAuthClient.login(email, password, callback);
  }

  public async registerWithEmail(
    email: string,
    password: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    await this.emailAuthClient.register(email, password, callback);
  }

  public async sendEmailVerification(
    email: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    await this.emailAuthClient.sendVerificationEmail(email, callback);
  }

  public async signOut(callback: (error: Error | null, data?: any) => void) {
    await this.emailAuthClient.logout(callback);
  }

  public async confirmEmailWithOtp(
    email: string,
    otp: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    await this.emailAuthClient.confirmEmail(email, otp, callback);
  }

  public async getSession(callback: (error: Error | null, data?: any) => void) {
    const sessionData = JSON.parse(storage.getItem(this.sessionKey));
    if (sessionData) {
      callback(null, sessionData);
    } else {
      callback(new Error(`Session not found.`));
    }
  }

  onAuthStateChange(
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
}