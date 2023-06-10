import { component$, Slot } from "@builder.io/qwik";
import { routeAction$, routeLoader$, useLocation } from "@builder.io/qwik-city";
import Header from "~/components/Header";
import {
  decodeAccessToken,
  getRedirectResult,
  getSession,
  signOut,
} from "~/utils/auth";

const excludedPaths = ["/login", "/register", "/pricing", "/reset"];

const shouldRedirect = (pathname: string, excludedPaths: string[]): boolean => {
  return (
    pathname !== "/" &&
    !excludedPaths.some((path) => pathname.startsWith(path)) &&
    !pathname.includes(".json")
  );
};

export const userAuthStateLoader = routeLoader$(
  async ({ cookie, cacheControl, redirect, pathname, env, url, query }) => {
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const baseUrl = env.get("VITE_API_URL") as string;
    const token = query.get("access_token");
    console.log("-------------------------->", token, url.toString());
    if (token) {
      await getRedirectResult(url.toString(), cookie, appId, baseUrl);
      throw redirect(302, '/dashboard');
    }

    const authState = getSession(cookie, appId, baseUrl);

    if (authState?.accessToken) {
      const decodedToken = decodeAccessToken(authState?.accessToken);

      if (!decodedToken?.email_verified && !pathname.includes("/verify/")) {
        throw redirect(302, "/verify");
      }

      if (decodedToken?.email_verified && pathname.includes("/verify/")) {
        throw redirect(302, "/dashboard");
      }

      /* if (pathname.includes("/login/") || pathname.includes("/register/")) {
        throw redirect(302, "/dashboard");
      } */

      return {
        loggedIn: true,
        accessToken: authState?.accessToken,
        userName: decodedToken?.name,
        email: decodedToken?.email,
      };
    }

    if (shouldRedirect(pathname, excludedPaths)) {
      throw redirect(302, "/login");
    }

    cacheControl({
      noCache: true,
      private: true,
    });

    return {
      loggedIn: false,
    };
  }
);

export const useLogoutAction = routeAction$(
  async (data, { cookie, redirect, fail, env }) => {
    try {
      const appId = env.get("VITE_APPLICTION_ID") as string;
      const baseUrl = env.get("VITE_API_URL") as string;
      await signOut(cookie, appId, baseUrl);
      throw redirect(302, "/login");
    } catch (e) {
      return fail(403, {
        message: "Unexpected error, please retry!",
      });
    }
  }
);

export default component$(() => {
  const authState = userAuthStateLoader();
  const logoutAction = useLogoutAction();
  const location = useLocation();
  return (
    <div class="dark">
      <main class="min-h-screen flex flex-col px-4 bg-white dark:bg-background-dark">
        <div class="container mx-auto">
          <div
            class={`h-2 w-full overflow-hidden bg-primary bg-opacity-20 rounded-full ${
              location.isNavigating ? "visible" : "invisible"
            }`}
          >
            <div class="h-full w-full bg-primary origin-left animate-indeterminate rounded-full"></div>
          </div>
          <Header
            isLoggedIn={authState.value?.loggedIn}
            key={authState.value?.accessToken}
            userName={authState.value?.userName as string}
            email={authState.value?.email as string}
            logoutAction={logoutAction}
          />
          <Slot />
        </div>
      </main>
    </div>
  );
});
