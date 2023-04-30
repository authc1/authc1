import { AuthEvent, EventEmitter } from "../utils/events";
import { post } from "../utils/http";
import * as storage from "../utils/storage";

export class Email {
  private readonly endpoint: string;
  private readonly eventEmitter: EventEmitter;
  private readonly sessionKey: string;

  constructor(endpoint: string, eventEmitter: EventEmitter) {
    this.endpoint = endpoint;
    this.eventEmitter = eventEmitter;
    this.sessionKey = `authc1-${endpoint}-session`;
  }

  public async sendVerificationEmail(
    email: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    const url = `${this.endpoint}/email/verify`;
    try {
      const response = await post(url, { email });
      if (response.status === 200) {
        this.eventEmitter.emit(AuthEvent.EMAIL_VERIFICATION_SENT, {
          message: "Verification email sent successfully.",
        });
        callback(null, response.data);
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      this.eventEmitter.emit(AuthEvent.EMAIL_VERIFICATION_ERROR, {
        message: "Unable to send verification email.",
        error: error.message,
      });
      callback(error);
    }
  }

  public async confirmEmail(
    email: string,
    otp: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    const url = `${this.endpoint}/email/confirm`;
    try {
      const response = await post(url, { email, otp });
      if (response.status === 200) {
        this.eventEmitter.emit(AuthEvent.EMAIL_VERIFICATION_SUCCESS, {
          message: "Email verified successfully.",
        });
        callback(null, response.data);
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      this.eventEmitter.emit(AuthEvent.EMAIL_VERIFICATION_ERROR, {
        message: "Unable to verify email.",
        error: error.message,
      });
      callback(error);
    }
  }

  public async login(
    email: string,
    password: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    const url = `${this.endpoint}/email/login`;
    try {
      const response = await post(url, { email, password });
      if (response.status === 200) {
        const session = response.data;
        storage.setItem(this.sessionKey, JSON.stringify(session));
        this.eventEmitter.emit(AuthEvent.LOGIN_SUCCESS, {
          message: "Logged in successfully.",
          token: response.data.token,
        });
        callback(null, response.data);
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      this.eventEmitter.emit(AuthEvent.LOGIN_ERROR, {
        message: "Unable to log in.",
        error: error.message,
      });
      callback(error);
    }
  }

  public async register(
    email: string,
    password: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    const url = `${this.endpoint}/email/register`;
    try {
      const response = await post(url, { email, password });
      if (response.status === 200) {
        const session = response.data;
        storage.setItem(this.sessionKey, JSON.stringify(session));
        this.eventEmitter.emit(AuthEvent.REGISTER_SUCCESS, {
          message: "Registered successfully.",
          token: response.data.token,
        });
        callback(null, response.data);
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      this.eventEmitter.emit(AuthEvent.REGISTER_ERROR, {
        message: "Unable to register.",
        error: error.message,
      });
      callback(error);
    }
  }

  public async resendVerificationEmail(
    email: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    const url = `${this.endpoint}/email/verify`;
    try {
      const response = await post(url, { email });
      if (response.status === 200) {
        this.eventEmitter.emit(AuthEvent.EMAIL_VERIFICATION_SENT, {
          message: "Verification email resent successfully.",
        });
        callback(null, response.data);
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      this.eventEmitter.emit(AuthEvent.EMAIL_VERIFICATION_SEND_ERROR, {
        message: "Unable to resend verification email.",
        error: error.message,
      });
      callback(error);
    }
  }

  public async forgotPassword(
    email: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    const url = `${this.endpoint}/email/forgot-password`;
    try {
      const response = await post(url, { email });
      if (response.status === 200) {
        this.eventEmitter.emit(AuthEvent.FORGOT_PASSWORD_SUCCESS, {
          message: "Password reset email sent successfully.",
        });
        callback(null, response.data);
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      this.eventEmitter.emit(AuthEvent.FORGOT_PASSWORD_ERROR, {
        message: "Unable to send password reset email.",
        error: error.message,
      });
      callback(error);
    }
  }

  public async resetPassword(
    email: string,
    newPassword: string,
    otp: string,
    callback: (error: Error | null, data?: any) => void
  ) {
    const url = `${this.endpoint}/email/reset-password`;
    try {
      const response = await post(url, { email, newPassword, otp });
      if (response.status === 200) {
        this.eventEmitter.emit(AuthEvent.PASSWORD_RESET_SENT, {
          message: "Password reset successfully.",
        });
        callback(null, response.data);
      } else {
        throw new Error(response.statusText);
      }
    } catch (error) {
      this.eventEmitter.emit(AuthEvent.PASSWORD_RESET_REQUEST_ERROR, {
        message: "Unable to reset password.",
        error: error.message,
      });
      callback(error);
    }
  }

  public async logout(callback: (error: Error | null, data?: any) => void) {
    try {
      storage.removeItem(this.sessionKey);
      this.eventEmitter.emit(AuthEvent.LOGOUT_SUCCESS, {
        message: "Logged out successfully.",
      });
      callback(null);
    } catch (error) {
      this.eventEmitter.emit(AuthEvent.LOGOUT_ERROR, {
        message: "Unable to log out.",
        error: error.message,
      });
      callback(error);
    }
  }
}
