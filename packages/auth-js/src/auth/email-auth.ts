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

type AuthCallback<T> = (error: Error | null, result?: T) => void;

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

  public getSessionId(): string {
    return this.sessionId;
  }

  private clearSessionId() {
    this.sessionId = undefined;
    storage.removeItem(this.sessionKey);
  }

  public async login(
    email: string,
    password: string,
    callback?: AuthCallback<LoginResult>
  ): Promise<LoginResult> {
    const url = `${this.endpoint}/login`;
    const response = await post(url, { email, password });
    if (response.status === 200) {
      const result = response.data as LoginResult;
      this.setSessionId(result.session_id);
      this.eventEmitter.emit(AuthEvent.SIGNED_IN, {
        userId: result.local_id,
        session: result.session_id,
      });
      if (callback) {
        callback(null, result);
      }
      return result;
    } else {
      const err = new Error(response.statusText);
      if (callback) {
        callback(err);
      }
      throw err;
    }
  }

  public async register(
    email: string,
    password: string,
    callback?: AuthCallback<RegisterResult>
  ): Promise<RegisterResult> {
    const url = `${this.endpoint}/register`;
    const response = await post(url, { email, password });
    if (response.status === 200) {
      const result = response.data as RegisterResult;
      if (callback) {
        callback(null, result);
      }
      return result;
    } else {
      const err = new Error(response.statusText);
      if (callback) {
        callback(err);
      }
      throw err;
    }
  }

  public async sendVerificationEmail(
    email: string,
    callback?: AuthCallback<any>
  ): Promise<any> {
    const url = `${this.endpoint}/email/send-verification`;
    const response = await post(url, { email });
    if (response.status === 200) {
      const result = response.data;
      if (callback) {
        callback(null, result);
      }
      return result;
    } else {
      const err = new Error(response.statusText);
      if (callback) {
        callback(err);
      }
      throw err;
    }
  }

  public async confirmEmail(
    email: string,
    otp: string,
    callback?: AuthCallback<any>
  ): Promise<any> {
    const url = `${this.endpoint}/email/confirm`;
    const response = await post(url, { email, otp });
    if (response.status === 200) {
      const result = response.data;
      if (callback) {
        callback(null, result);
      }
      return result;
    } else {
      const err = new Error(response.statusText);
      if (callback) {
        callback(err);
      }
      throw err;
    }
  }

  public async logout(callback?: AuthCallback<any>): Promise<any> {
    this.clearSessionId();
    this.eventEmitter.emit(AuthEvent.SIGNED_OUT);
    if (callback) {
      callback(null);
    }
    return null;
  }
}