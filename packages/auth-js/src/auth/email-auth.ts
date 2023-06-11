import { AuthEvent, EventEmitter } from "../utils/events";
import { post } from "../utils/http";
import type {
  AuthCallback,
  ConfirmResetPasswordOptions,
  EmailAuthClientOptions,
  ForgetPasswordOptions,
  LoginRequest,
  LoginResult,
  RegisterRequest,
  RegisterResult,
  Session,
} from "../types";
import type { StorageManager } from "../utils/storage";

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

  public async login(
    { email, password }: LoginRequest,
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
        emailVerified: result.email_verified as boolean,
        sessionId: result.session_id,
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
    { name, email, password }: RegisterRequest,
    callback?: AuthCallback<RegisterResult>
  ): Promise<RegisterResult> {
    const url = `${this.endpoint}/email/register`;
    const response = await post(url, { email, password, name });
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
    const response = await post(url, null, this.session?.accessToken);
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
    const response = await post(url, { code }, this.session?.accessToken);
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

  public async forgetPassword(
    { email }: ForgetPasswordOptions,
    callback?: AuthCallback<any>
  ): Promise<any> {
    const url = `${this.endpoint}/email/forgot-password`;
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

  public async confirmNewPassword(
    { email, code, password }: ConfirmResetPasswordOptions,
    callback?: AuthCallback<any>
  ): Promise<any> {
    const url = `${this.endpoint}/email/confirm-password`;
    const response = await post(url, { email, code, password });
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
}
