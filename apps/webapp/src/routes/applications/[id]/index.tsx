import { component$, Resource } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
  routeAction$,
  Form,
  routeLoader$,
  zod$,
  z,
} from "@builder.io/qwik-city";
import Button from "~/components/button";
import FailedToLaod from "~/components/failedToLaod";
import Loader from "~/components/loader";
import SettingsForm from "~/components/settingsForm";
import TabBar from "~/components/tabBar";
import { settingsFields } from "~/config/settings";
import {
  getAllApplicationsById,
  updateApplicationById,
} from "~/utils/applications";

export const userApplicationLoader = routeLoader$(
  async ({ cookie, params, env }) => {
    const baseUrl = env.get("VITE_API_URL") as string;
    const data = await getAllApplicationsById(cookie, baseUrl, params.id);
    return data;
  }
);

export const useUpdateApplicationAction = routeAction$(
  async (data, { cookie, fail, redirect, params, env }) => {
    const baseUrl = env.get("VITE_API_URL") as string;
    const results = await updateApplicationById(
      data,
      params?.id,
      cookie,
      baseUrl
    );
    if (results?.data) {
      throw redirect(302, `/applications/${params?.id}`);
    }

    return fail(403, {
      message: "Failed to update the application",
    });
  },
  zod$({
    name: z.string(),
    logo: z.string().optional(),
    application_id: z.string().optional(),
    expires_in: z.coerce.number().optional().nullable(),
    secret: z.string().optional().nullable(),
    algorithm: z.string().optional().nullable(),
    redirect_uri: z.string().optional().nullable(),
    two_factor_authentication: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    allow_multiple_accounts: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    session_expiration_time: z.coerce.number().optional().nullable(),
    account_deletion_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    failed_login_attempts: z.coerce.number().optional(),
  })
);

export default component$(() => {
  const userApplication = userApplicationLoader();
  const updateApplication = useUpdateApplicationAction();
  return (
    <Resource
      value={userApplication}
      onPending={() => (
        <div class="flex h-full w-full items-center justify-center">
          <Loader />
        </div>
      )}
      onRejected={() => <FailedToLaod />}
      onResolved={(settings = {}) => {
        const { data } = settings || {};

        return (
          <>
            <TabBar />
            {data ? (
              <div class="max-w-xl lg:px-8 sm:px-8 mt-24 md:mt-8 container">
                <h2 class="flex text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Update your Application
                </h2>
                <Form
                  action={updateApplication}
                  spaReset
                  class="mt-8 block max-w-md"
                >
                  <div class="mb-4">
                    <label class="block text-sm text-gray-700 mb-2" for="name">
                      Application name
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={data?.name}
                      class="w-full min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
                    />
                  </div>
                  <div class="mb-4">
                    <label class="block text-sm text-gray-700 mb-2" for="logo">
                      Logo
                    </label>
                    <input
                      id="logo"
                      type="text"
                      name="logo"
                      value={data?.logo}
                      disabled
                      class="opacity-50 cursor-not-allowed w-full min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
                    />
                  </div>
                  <h3 class="flex text-xl font-semibold text-zinc-900 dark:text-zinc-100 my-8">
                    Settings
                  </h3>
                  <SettingsForm
                    schema={settingsFields}
                    defaultValues={{
                      ...data?.settings,
                      application_id: data?.id,
                    }}
                  />
                  <Button
                    label="Save"
                    type="submit"
                    isRunning={updateApplication.isRunning}
                    styles="mt-4"
                  />
                </Form>
              </div>
            ) : (
              <FailedToLaod />
            )}
          </>
        );
      }}
    />
  );
});

export const applicationsHead: DocumentHead = {
  title: "AuthC1 Applications - View and Edit Application Details",
  meta: [
    {
      name: "description",
      content: "AuthC1 Applications - View and Edit Application Details",
    },
    {
      name: "keywords",
      content:
        "identity and access management, user management, role-based access control, cloud-based, authentication, authorization",
    },
  ],
};
