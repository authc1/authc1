import { AuthEvent, EventEmitter } from "../utils/events";
import { post } from "../utils/http";
import * as storage from "../utils/storage";

export interface LoginResult {
  access_token: string;
  email: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  local_id: string;
  name?: string;
  session_id: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  localId: string;
}

export interface RegisterResult {
  access_token: string;
  email: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  local_id: string;
  name?: string;
}

export class EmailAuthClient {
  private readonly endpoint: string;
  private readonly eventEmitter: EventEmitter;
  private readonly sessionKey: string;
  private sessionId?: string;

  constructor(appId: string, endpoint: string, eventEmitter: EventEmitter) {
    this.endpoint = endpoint;
    this.eventEmitter = eventEmitter;
    this.sessionKey = `authc1-${appId}-session`;
    this.sessionId = storage.getItem(this.sessionKey);
  }

  private setSessionId(sessionId: string) {
    this.sessionId = sessionId;
    storage.setItem(this.sessionKey, sessionId);
  }

  private clearSessionId() {
    this.sessionId = undefined;
    storage.removeItem(this.sessionKey);
  }

  public async login(
    email: string,
    password: string,
    callback: (error: Error | null, result?: LoginResult) => void
  ) {
    const url = `${this.endpoint}/login`;
    const response = await post(url, { email, password });
    if (response.status === 200) {
      const result = response.data as LoginResult;
      this.setSessionId(result.session_id);
      this.eventEmitter.emit(AuthEvent.SIGNED_IN, {
        userId: result.local_id,
        session: result.session_id,
      });
      callback(null, result);
    } else {
      callback(new Error(response.statusText));
    }
  }

  public async register(
    email: string,
    password: string,
    callback: (error: Error | null, result?: RegisterResult) => void
  ) {
    const url = `${this.endpoint}/register`;
    const response = await post(url, { email, password });
    if (response.status === 200) {
      const result = response.data as RegisterResult;
      callback(null, result);
    } else {
      callback(new Error(response.statusText));
    }
  }

  public async sendVerificationEmail(
    email: string,
    callback: (error: Error | null, result?: any) => void
  ) {
    const url = `${this.endpoint}/email/send-verification`;
    const response = await post(url, { email });
    if (response.status === 200) {
      const result = response.data;
      callback(null, result);
    } else {
      callback(new Error(response.statusText));
    }
  }

  public async confirmEmail(
    email: string,
    otp: string,
    callback: (error: Error | null, result?: any) => void
  ) {
    const url = `${this.endpoint}/email/confirm`;
    const response = await post(url, { email, otp });
    if (response.status === 200) {
      const result = response.data;
      callback(null, result);
    } else {
      callback(new Error(response.statusText));
    }
  }

  public async logout(
    callback: (error: Error | null) => void
  ) {
    const sessionId = this.sessionId;
    if (!sessionId) {
      callback(new Error("Not logged in."));
      return;
    }
    this.clearSessionId();
    this.eventEmitter.emit(AuthEvent.SIGNED_OUT);
    callback(null);
  }
}

