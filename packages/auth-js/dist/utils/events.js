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

// src/utils/events.ts
var events_exports = {};
__export(events_exports, {
  AuthEvent: () => AuthEvent,
  EventEmitter: () => EventEmitter
});
module.exports = __toCommonJS(events_exports);

// src/utils/storage.ts
function getItem(key) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthEvent,
  EventEmitter
});
