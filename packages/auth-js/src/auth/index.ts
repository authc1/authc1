import { AuthEvent, EventEmitter, EventHandler } from "../utils/events";
import * as email from "./email";

type AuthStateChangedSubscription = {
  unsubscribe: () => void;
};

export class Authc1Client {
  private appId: string;
  private readonly eventEmitter: EventEmitter;
  private readonly email: email.Email;

  constructor(appId: string) {
    const eventEmitter = new EventEmitter(appId);
    const endpoint = `https://api.authc1.com/v1/${appId}`;
    this.appId = appId;
    this.eventEmitter = eventEmitter;
    this.email = new email.Email(endpoint, eventEmitter);
  }

  public async signInWithEmail(
    email: string,
    password: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    await this.email.login(email, password, callback);
  }

  public async registerWithEmail(
    email: string,
    password: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    await this.email.register(email, password, callback);
  }

  public async sendEmailVerification(
    email: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    await this.email.sendVerificationEmail(email, callback);
  }

  public async signOut(callback: (error: Error | null, data?: any) => void) {
    await this.email.logout(callback);
  }

  public async verifyOTP(
    phoneOrEmail: string,
    otp: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    // Implement your verify OTP logic here
  }

  public async refreshSession(
    callback: (error: Error | null, data?: any) => void
  ) {
    // Implement your session refresh logic here
  }

  public async getUser(callback: (error: Error | null, data?: any) => void) {
    // Implement your get user logic here
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
