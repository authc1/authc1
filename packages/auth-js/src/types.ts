import type { EventEmitter } from "./utils/events";
import type { StorageManager } from "./utils/storage";

export type AuthCallback<T> = (error: Error | null, result?: T) => void;

export interface HttpResponse<T> {
  status: number;
  statusText: string;
  data: T;
}

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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
  emailVerified: boolean;
  localId: string;
  sessionId: string;
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

export interface RegisterRequest {
  name?: string;
  email: string;
  password: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  local_id: string;
  expires_at: number;
  email_verified: boolean;
  session_id: string;
}

export interface EmailAuthClientOptions {
  appId: string;
  endpoint: string;
  eventEmitter: EventEmitter;
  storage: StorageManager;
  sessionKey: string;
}

export interface ForgetPasswordOptions {
  email: string;
}
export interface ConfirmResetPasswordOptions {
  email: string;
  code: string;
  password: string;
}
