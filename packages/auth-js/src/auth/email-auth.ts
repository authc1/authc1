import { AuthEvent, EventEmitter } from "../utils/events";
import { post } from "../utils/http";
import { StorageManager } from "../utils/storage";

export interface LoginResult {
  access_token: string;
  email: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  local_id: string;
  name?: string;
  session_id: string;
  email_verified?: boolean;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
  emailVerified: boolean;
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
  email_verified?: string;
}

type AuthCallback<T> = (error: Error | null, result?: T) => void;

export interface EmailAuthClientOptions {
  appId: string;
  endpoint: string;
  eventEmitter: EventEmitter;
  storage: StorageManager;
  sessionKey: string;
}

export class EmailAuthClient {
  private readonly endpoint: string;
  private readonly eventEmitter: EventEmitter;
  private readonly sessionKey: string;
  private session?: Session;
  private storage: StorageManager;

  constructor(options: EmailAuthClientOptions) {
    this.endpoint = options.endpoint;
    this.eventEmitter = options.eventEmitter;
    this.sessionKey = options.sessionKey;
    const sessionData = options.storage.getItem(options.sessionKey);
    if (sessionData) {
      const parsedSession = JSON.parse(sessionData);
      this.session = parsedSession;
    }

    this.storage = options.storage;
  }

  private setSession(session: Session) {
    this.session = session;
    this.storage.setItem(this.sessionKey, JSON.stringify(session));
  }

  public getSession(): Session | null {
    const sessionData = this.storage.getItem(this.sessionKey);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    return null;
  }

  private clearSession() {
    this.session = undefined;
    this.storage.removeItem(this.sessionKey);
  }

  public async login(
    email: string,
    password: string,
    callback?: AuthCallback<LoginResult>
  ): Promise<LoginResult> {
    const url = `${this.endpoint}/email/login`;
    const response = await post(url, { email, password });
    if (response.status === 200) {
      const result = response.data as LoginResult;
      const session: Session = {
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        expiresIn: result.expires_in,
        localId: result.local_id,
        expiresAt: result.expires_at,
        emailVerified: result.email_verified,
      };
      this.setSession(session);
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
    const url = `${this.endpoint}/email/register`;
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
    callback?: AuthCallback<any>
  ): Promise<any> {
    const url = `${this.endpoint}/email/verify`;
    console.log("this.session", this.session);
    const response = await post(url, null, this.session.accessToken);
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
    code: string,
    callback?: AuthCallback<any>
  ): Promise<any> {
    const url = `${this.endpoint}/email/confirm`;
    const response = await post(url, { code });
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
    this.clearSession();
    this.eventEmitter.emit(AuthEvent.SIGNED_OUT);
    if (callback) {
      callback(null);
    }
    return null;
  }
}
