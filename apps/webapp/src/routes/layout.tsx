import { component$, Slot } from "@builder.io/qwik";
import { routeAction$, routeLoader$, useLocation } from "@builder.io/qwik-city";
import Header from "~/components/Header";
import { decodeAccessToken, signOut } from "~/utils/auth";
import { getAccessTokenFromCookie } from "~/utils/fetch";

const excludedPaths = ["/login", "/register", "/pricing"];

const shouldRedirect = (pathname: string, excludedPaths: string[]): boolean => {
  return (
    pathname !== "/" &&
    !excludedPaths.some((path) => pathname.startsWith(path)) &&
    !pathname.includes(".json")
  );
};

export const userAuthStateLoader = routeLoader$(
  ({ cookie, cacheControl, redirect, pathname, env }) => {
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const authState = getAccessTokenFromCookie(cookie, appId);
    if (authState?.access_token) {
      const decodedToken = decodeAccessToken(authState?.access_token);

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
        accessToken: authState?.access_token,
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
  async (data, { cookie, redirect, fail }) => {
    try {
      await signOut(cookie);
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
