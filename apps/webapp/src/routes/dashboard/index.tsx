import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeAction$ } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { zod$, Form, z } from "@builder.io/qwik-city";
import ApplicationsList from "~/components/applicationsList";
import Button from "~/components/button";
import {
  createApplication,
  getAllApplicationForListingByUser,
} from "~/utils/applications";

export const useCreateApplicationAction = routeAction$(
  async (data, { cookie, fail, redirect, env }) => {
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const baseUrl = env.get("VITE_API_URL") as string;
    const result = await createApplication(data, cookie, appId, baseUrl);
    if (result?.data) {
      throw redirect(302, `/applications/${result?.data?.id}`);
    }

    return fail(403, {
      message: "Failed to create an application",
    });
  },
  zod$({
    name: z.string(),
  })
);

export const userApplicationLoader = routeLoader$(async ({ cookie, env }) => {
  const baseUrl = env.get("VITE_API_URL") as string;
  const appId = env.get("VITE_APPLICTION_ID") as string;
  const data = await getAllApplicationForListingByUser(cookie, appId, baseUrl);
  return data;
});

export default component$(() => {
  const createApplication = useCreateApplicationAction();
  const userApplication = userApplicationLoader();
  const { value } = userApplication;
  const { data: applications } = value;

  return (
    <div class="mx-auto max-w-7xl lg:px-8 sm:px-8 mt-24 md:mt-8">
      <div class="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
        <div class="flex flex-col gap-16">
          <Form
            action={createApplication}
            spaReset
            class="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40"
          >
            <h2 class="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Create your first
            </h2>
            <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Elevate your authentication with AuthC1
            </p>
            <div class="mt-6 flex">
              <input
                placeholder="Enter Application name"
                aria-label="Application name"
                name="name"
                class="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
              />
              <Button
                type="submit"
                isRunning={createApplication.isRunning}
                label="Create"
                styles="ml-4"
              />
            </div>
            <p class="mt-2 text-sm text-red-600 dark:text-red-500">
              {createApplication.value?.message}
            </p>
          </Form>
        </div>
        <div class="space-y-10 lg:pl-16 xl:pl-24">
          <h2 class="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            Your applications
          </h2>
          <ApplicationsList applications={applications} />
        </div>
        {/*  <div class="space-y-10 lg:pl-16 xl:pl-24">
          <h2 class="text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
            Recent Activity
          </h2>
          <RecentActivity list={[1]} />
        </div> */}
      </div>
    </div>
  );
});

export const dashboardHead: DocumentHead = {
  title: "AuthC1 Dashboard - Manage User Access and Permissions",
  meta: [
    {
      name: "description",
      content: "AuthC1 Dashboard - Manage User Access and Permissions",
    },
    {
      name: "keywords",
      content:
        "identity and access management, user management, role-based access control, cloud-based, authentication, authorization",
    },
  ],
};
