import { StorageManager } from "./storage";

enum AuthEvent {
  SIGNED_IN = "signed_in",
  SIGNED_OUT = "signed_out",
  TOKEN_REFRESHED = "token_refreshed",
  USER_UPDATED = "user_updated",
  PASSWORD_RECOVERY_SUCCESS = "password_recovery_success",
  PASSWORD_RECOVERY_ERROR = "password_recovery_error",
  LOGIN_SUCCESS = "login_success",
  LOGIN_ERROR = "login_error",
  LOGOUT_SUCCESS = "logout_success",
  LOGOUT_ERROR = "logout_error",
  EMAIL_VERIFICATION_SENT = "email_verification_sent",
  EMAIL_VERIFICATION_SUCCESS = "email_verification_success",
  EMAIL_VERIFICATION_RESENT = "email_verification_resent",
  EMAIL_VERIFICATION_ERROR = "email_verification_error",
  PASSWORD_RESET_REQUEST_SENT = "password_reset_request_sent",
  PASSWORD_RESET_REQUEST_SUCCESS = "password_reset_request_success",
  PASSWORD_RESET_REQUEST_ERROR = "password_reset_request_error",
  PASSWORD_RESET_SENT = "password_reset_sent",
  PASSWORD_RESET_SUCCESS = "password_reset_success",
  PASSWORD_RESET_ERROR = "password_reset_error",
  REGISTER_SUCCESS = "register_success",
  REGISTER_ERROR = "register_error",
  EMAIL_VERIFICATION_SEND_ERROR = "email_verification_send_error",
  FORGOT_PASSWORD_SUCCESS = "forgot_password_success",
  FORGOT_PASSWORD_ERROR = "forgot_password_error",
}

export type EventHandler = (...args: any[]) => void;

class EventEmitter {
  private events: Map<AuthEvent, EventHandler[]> = new Map();
  private appId: string;
  private storageManager: StorageManager;

  constructor(
    appId: string,
    storageManager: StorageManager,
    sessionKey: string
  ) {
    this.events = new Map<AuthEvent, EventHandler[]>();
    this.appId = appId;
    this.storageManager = storageManager;

    const session = this.storageManager.getItem(sessionKey);
    if (session) {
      const sessionData = JSON.parse(session);
      const event = sessionData.access_token
        ? AuthEvent.SIGNED_IN
        : AuthEvent.SIGNED_OUT;
      this.emit(event, session);
    }
  }

  on(eventName: AuthEvent, handler: EventHandler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    this.events.get(eventName)?.push(handler);
  }

  off(eventName: AuthEvent, handler: EventHandler) {
    const handlers = this.events.get(eventName);
    if (!handlers) {
      return;
    }

    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  emit(eventName: AuthEvent, ...args: any[]) {
    const handlers = this.events.get(eventName);
    if (!handlers) {
      return;
    }

    handlers.forEach((handler) => handler(...args));
  }
}

export { AuthEvent, EventEmitter };
