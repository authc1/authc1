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

// src/auth/email-auth.ts
var email_auth_exports = {};
__export(email_auth_exports, {
  EmailAuthClient: () => EmailAuthClient
});
module.exports = __toCommonJS(email_auth_exports);

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
  async register(email, password, callback) {
    const url = `${this.endpoint}/register`;
    const response = await post(url, { email, password });
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
  async sendVerificationEmail(email, callback) {
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
  async confirmEmail(email, otp, callback) {
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
  async logout(callback) {
    this.clearSessionId();
    this.eventEmitter.emit("signed_out" /* SIGNED_OUT */);
    if (callback) {
      callback(null);
    }
    return null;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EmailAuthClient
});
