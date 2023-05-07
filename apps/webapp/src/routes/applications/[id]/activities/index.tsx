import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import RecentActivity from "~/components/recentActivity";
import TabBar from "~/components/tabBar";
import { createAuthc1Client } from "~/utils/authc1-client";
import { getAccessTokenFromCookie } from "~/utils/fetch";

export const useAuthDetails = routeLoader$(async ({ cookie, env }) => {
  const appId = env.get("VITE_APPLICTION_ID") as string;
  const baseUrl = env.get("VITE_API_URL") as string;
  const authState = getAccessTokenFromCookie(cookie, appId, baseUrl);
  const client = createAuthc1Client(cookie, appId, baseUrl);
  const baseWssUrl = client.webSocketUrl;
  return {
    authState,
    baseWssUrl,
    applicationId: appId,
  };
});

export default component$(() => {
  const userAuth = useAuthDetails();
  const { value } = userAuth;

  return (
    <>
      <TabBar />
      <div class="mx-auto max-w-7xl lg:px-8 sm:px-8 mt-12 container mx-auto max-w-4xl">
        <h2 class="flex text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Recent Activity
        </h2>
        <RecentActivity
          authState={value.authState}
          baseWssUrl={value?.baseWssUrl}
          applicationId={value?.applicationId}
        />
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Activities - AuthC1 Dashboard",
  meta: [
    {
      name: "description",
      content:
        "View recent activities of your AuthC1 users and track their actions.",
    },
  ],
};
