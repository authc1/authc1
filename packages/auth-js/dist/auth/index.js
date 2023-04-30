var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/auth/index.ts
var auth_exports = {};
__export(auth_exports, {
  Authc1Client: () => Authc1Client
});
module.exports = __toCommonJS(auth_exports);

// src/utils/storage.ts
function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getItem(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}
function removeItem(key) {
  localStorage.removeItem(key);
}

// src/utils/events.ts
var AuthEvent = /* @__PURE__ */ ((AuthEvent2) => {
  AuthEvent2["SIGNED_IN"] = "signed_in";
  AuthEvent2["SIGNED_OUT"] = "signed_out";
  AuthEvent2["TOKEN_REFRESHED"] = "token_refreshed";
  AuthEvent2["USER_UPDATED"] = "user_updated";
  AuthEvent2["PASSWORD_RECOVERY_SUCCESS"] = "password_recovery_success";
  AuthEvent2["PASSWORD_RECOVERY_ERROR"] = "password_recovery_error";
  AuthEvent2["LOGIN_SUCCESS"] = "login_success";
  AuthEvent2["LOGIN_ERROR"] = "login_error";
  AuthEvent2["LOGOUT_SUCCESS"] = "logout_success";
  AuthEvent2["LOGOUT_ERROR"] = "logout_error";
  AuthEvent2["EMAIL_VERIFICATION_SENT"] = "email_verification_sent";
  AuthEvent2["EMAIL_VERIFICATION_SUCCESS"] = "email_verification_success";
  AuthEvent2["EMAIL_VERIFICATION_RESENT"] = "email_verification_resent";
  AuthEvent2["EMAIL_VERIFICATION_ERROR"] = "email_verification_error";
  AuthEvent2["PASSWORD_RESET_REQUEST_SENT"] = "password_reset_request_sent";
  AuthEvent2["PASSWORD_RESET_REQUEST_SUCCESS"] = "password_reset_request_success";
  AuthEvent2["PASSWORD_RESET_REQUEST_ERROR"] = "password_reset_request_error";
  AuthEvent2["PASSWORD_RESET_SENT"] = "password_reset_sent";
  AuthEvent2["PASSWORD_RESET_SUCCESS"] = "password_reset_success";
  AuthEvent2["PASSWORD_RESET_ERROR"] = "password_reset_error";
  AuthEvent2["REGISTER_SUCCESS"] = "register_success";
  AuthEvent2["REGISTER_ERROR"] = "register_error";
  AuthEvent2["EMAIL_VERIFICATION_SEND_ERROR"] = "email_verification_send_error";
  AuthEvent2["FORGOT_PASSWORD_SUCCESS"] = "forgot_password_success";
  AuthEvent2["FORGOT_PASSWORD_ERROR"] = "forgot_password_error";
  return AuthEvent2;
})(AuthEvent || {});
var EventEmitter = class {
  events = /* @__PURE__ */ new Map();
  appId;
  constructor(appId) {
    this.events = /* @__PURE__ */ new Map();
    this.appId = appId;
    const sessionKey = `authc1-${this.appId}-session`;
    const session = getItem(sessionKey);
    if (session) {
      const event = session.token ? "signed_in" /* SIGNED_IN */ : "signed_out" /* SIGNED_OUT */;
      this.emit(event, session);
    }
  }
  on(eventName, handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName)?.push(handler);
  }
  off(eventName, handler) {
    const handlers = this.events.get(eventName);
    if (!handlers) {
      return;
    }
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }
  emit(eventName, ...args) {
    const handlers = this.events.get(eventName);
    if (!handlers) {
      return;
    }
    handlers.forEach((handler) => handler(...args));
  }
};

// src/utils/http.ts
async function post(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const responseData = await response.json();
  return {
    data: responseData,
    status: response.status,
    statusText: response.statusText
  };
}

// src/auth/email-auth.ts
var EmailAuthClient = class {
  endpoint;
  eventEmitter;
  sessionKey;
  sessionId;
  constructor(appId, endpoint, eventEmitter) {
    this.endpoint = endpoint;
    this.eventEmitter = eventEmitter;
    this.sessionKey = `authc1-${appId}-session`;
    this.sessionId = getItem(this.sessionKey);
  }
  setSessionId(sessionId) {
    this.sessionId = sessionId;
    setItem(this.sessionKey, sessionId);
  }
  clearSessionId() {
    this.sessionId = void 0;
    removeItem(this.sessionKey);
  }
  async login(email, password, callback) {
    const url = `${this.endpoint}/login`;
    const response = await post(url, { email, password });
    if (response.status === 200) {
      const result = response.data;
      this.setSessionId(result.session_id);
      this.eventEmitter.emit("signed_in" /* SIGNED_IN */, {
        userId: result.local_id,
        session: result.session_id
      });
      callback(null, result);
    } else {
      callback(new Error(response.statusText));
    }
  }
  async register(email, password, callback) {
    const url = `${this.endpoint}/register`;
    const response = await post(url, { email, password });
    if (response.status === 200) {
      const result = response.data;
      callback(null, result);
    } else {
      callback(new Error(response.statusText));
    }
  }
  async sendVerificationEmail(email, callback) {
    const url = `${this.endpoint}/email/send-verification`;
    const response = await post(url, { email });
    if (response.status === 200) {
      const result = response.data;
      callback(null, result);
    } else {
      callback(new Error(response.statusText));
    }
  }
  async confirmEmail(email, otp, callback) {
    const url = `${this.endpoint}/email/confirm`;
    const response = await post(url, { email, otp });
    if (response.status === 200) {
      const result = response.data;
      callback(null, result);
    } else {
      callback(new Error(response.statusText));
    }
  }
  async logout(callback) {
    const sessionId = this.sessionId;
    if (!sessionId) {
      callback(new Error("Not logged in."));
      return;
    }
    this.clearSessionId();
    this.eventEmitter.emit("signed_out" /* SIGNED_OUT */);
    callback(null);
  }
};

// src/auth/index.ts
var Authc1Client = class {
  appId;
  eventEmitter;
  emailAuthClient;
  sessionKey;
  constructor(appId) {
    const eventEmitter = new EventEmitter(appId);
    const endpoint = `https://api.authc1.com/v1/${appId}`;
    this.appId = appId;
    this.eventEmitter = eventEmitter;
    this.emailAuthClient = new EmailAuthClient(appId, endpoint, eventEmitter);
    this.sessionKey = `authc1-${appId}-auth-session`;
  }
  async signInWithEmail(email, password, callback) {
    await this.emailAuthClient.login(email, password, callback);
  }
  async registerWithEmail(email, password, callback) {
    await this.emailAuthClient.register(email, password, callback);
  }
  async sendEmailVerification(email, callback) {
    await this.emailAuthClient.sendVerificationEmail(email, callback);
  }
  async signOut(callback) {
    await this.emailAuthClient.logout(callback);
  }
  async confirmEmailWithOtp(email, otp, callback) {
    await this.emailAuthClient.confirmEmail(email, otp, callback);
  }
  async getSession(callback) {
    const sessionData = JSON.parse(getItem(this.sessionKey));
    if (sessionData) {
      callback(null, sessionData);
    } else {
      callback(new Error(`Session not found.`));
    }
  }
  onAuthStateChange(handler) {
    for (const event in AuthEvent) {
      this.eventEmitter.on(AuthEvent[event], (session) => {
        handler(AuthEvent[event], session);
      });
    }
    return {
      unsubscribe: () => {
        for (const event in AuthEvent) {
          this.eventEmitter.off(AuthEvent[event], (session) => {
            handler(AuthEvent[event], session);
          });
        }
      }
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Authc1Client
});
