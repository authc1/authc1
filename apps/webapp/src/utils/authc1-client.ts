import type { Cookie } from "@builder.io/qwik-city";
import type { Storage } from "@authc1/auth-js";
import { Authc1Client } from "@authc1/auth-js";
// import { Authc1Client } from "../../../../packages/auth-js/src/index";

const createCookieStorageManager = (cookie: Cookie): Storage => {
  return {
    setItem(key: string, value: string): void {
      console.log("createCookieStorageManager", key, value);
      const options = {
        httpOnly: true,
        maxAge: 3600,
        path: "/",
      };
      cookie.set(key, value, options);
    },

    getItem(key: string): string | null {
      return cookie.get(key)?.value as string;
    },

    async removeItem(key: string): Promise<void> {
      await cookie.delete(key, { path: "/" });
    },
    length: 0,
    key() {
      return null;
    },
    clear() {},
  };
};

export function createAuthc1Client(
  cookie: Cookie,
  appId: string,
  baseUrl: string
): Authc1Client {
  const customStorageManager = createCookieStorageManager(cookie);

  return new Authc1Client(appId, {
    storage: customStorageManager,
    baseUrl,
  });
}
