import { component$, Resource } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
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
import ProviderListItem from "~/components/providerListItem";
import SettingsForm from "~/components/settingsForm";
import TabBar from "~/components/tabBar";
import type { ProviderData } from "~/config/settings";
import { providersSettings } from "~/config/settings";
import {
  getAllApplicationsProvidersById,
  updateApplicationProviderById,
} from "~/utils/applications";

export const userApplicationLoader = routeLoader$(
  async ({ cookie, params, env }) => {
    const baseUrl = env.get("VITE_API_URL") as string;
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const res = await getAllApplicationsProvidersById(
      cookie,
      appId,
      baseUrl,
      params.id
    );
    return {
      application: res?.data,
      baseUrl,
    };
  }
);

export const useUpdateApplicationProvidersAction = routeAction$(
  async (data, { cookie, fail, redirect, params, env }) => {
    const baseUrl = env.get("VITE_API_URL") as string;
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const results = await updateApplicationProviderById(
      data,
      params.id,
      cookie,
      appId,
      baseUrl
    );
    if (results?.data) {
      throw redirect(302, `/applications/${params?.id}/providers`);
    }

    return fail(403, {
      message: "Failed to update the application",
    });
  },
  zod$({
    email_provider_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    sender_email: z.string().optional(),
    email_template_body: z.string().optional(),
    email_template_subject: z.string().optional(),
    email_verification_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    code_expires_in: z.coerce.number().optional().nullable(),
    email_verification_method: z.string().optional(),
    reset_confirmation_email: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    password_regex: z.string().optional(),

    phone_provider_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    text_template_body: z.string().optional(),

    discord_provider_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    discord_client_id: z.string().optional(),
    discord_client_secret: z.string().optional(),
    discord_redirect_uri: z.string().optional(),
    discord_scope: z.string().optional(),

    facebook_provider_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    facebook_client_id: z.string().optional(),
    facebook_client_secret: z.string().optional(),
    facebook_redirect_uri: z.string().optional(),
    facebook_scope: z.string().optional(),

    apple_provider_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    apple_team_id: z.string().optional(),
    apple_key_id: z.string().optional(),
    apple_client_id: z.string().optional(),
    apple_private_key: z.string().optional(),
    apple_redirect_uri: z.string().optional(),
    apple_scope: z.string().optional(),

    github_provider_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    github_client_id: z.string().optional(),
    github_client_secret: z.string().optional(),
    github_redirect_uri: z.string().optional(),
    github_scope: z.string().optional(),

    google_provider_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    google_client_id: z.string().optional(),
    google_client_secret: z.string().optional(),
    google_redirect_uri: z.string().optional(),
    google_scope: z.string().optional(),

    linkedin_provider_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    linkedin_client_id: z.string().optional(),
    linkedin_client_secret: z.string().optional(),
    linkedin_redirect_uri: z.string().optional(),
    linkedin_scope: z.string().optional(),

    spotify_provider_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    spotify_client_id: z.string().optional(),
    spotify_client_secret: z.string().optional(),
    spotify_redirect_uri: z.string().optional(),
    spotify_scope: z.string().optional(),

    twitter_provider_enabled: z.union([
      z.literal("true").transform(() => true),
      z.literal("false").transform(() => false),
      z.literal(undefined).transform(() => false),
    ]),
    twitter_client_id: z.string().optional(),
    twitter_client_secret: z.string().optional(),
    twitter_redirect_uri: z.string().optional(),
    twitter_scope: z.string().optional(),
  })
);

export default component$(() => {
  const loc = useLocation();
  const { id } = loc.params;
  const userApplication = userApplicationLoader();
  const updateApplicationProviders = useUpdateApplicationProvidersAction();
  return (
    <Resource
      value={userApplication}
      onPending={() => (
        <div class="flex h-full w-full items-center justify-center">
          <Loader />
        </div>
      )}
      onRejected={() => <FailedToLaod />}
      onResolved={({ application: data, baseUrl }) => {
        return (
          <>
            <TabBar />
            <div class="mx-auto max-w-7xl lg:px-8 sm:px-8 mt-12 container mx-auto max-w-4xl">
              <h2 class="flex text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                Auth Providers
              </h2>
              <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Authenticate your users through a suite of providers and login
                methods.
              </p>
              <Form action={updateApplicationProviders} spaReset class="mt-6">
                {providersSettings.map((item: ProviderData, index: number) => {
                  return (
                    <ProviderListItem
                      key={item.key}
                      isLast={providersSettings.length - 1 === index}
                      isFirst={index === 0}
                      enabled={data[`${item.key}_provider_enabled`]}
                      label={item.label}
                      inactive={item.inactive}
                    >
                      <SettingsForm schema={item.data} defaultValues={data} />
                      {item?.canCopy && (
                        <div class="flex items-center mt-8 bg-gray-100 w-max max-w-max rounded-md">
                          <span class="text-xs font-medium text-gray-900 mx-4">
                            {baseUrl}/providers/{id}/{item.key}/callback
                          </span>
                          <button
                            data-tooltip-target="default-radio-example-copy-clipboard-tooltip"
                            data-tooltip-placement="bottom"
                            type="button"
                            data-copy-state="copy"
                            class="flex items-center px-3 py-3 text-xs font-medium text-gray-600 bg-gray-100 border-l rounded-r-md border-gray-200 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-800 hover:text-blue-700 dark:hover:text-white copy-to-clipboard-button"
                            onClick$={() => {
                              navigator.clipboard.writeText(
                                `${baseUrl}/providers/${id}/${item.key}/callback`
                              );
                            }}
                          >
                            <svg
                              class="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              ></path>
                            </svg>
                            <span class="copy-text">Copy</span>
                          </button>
                        </div>
                      )}
                      <div class="flex pt-2 justify-between items-center mt-8">
                        <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200">Learn more</p>
                        <Button label="Save" isRunning={false} type="submit" />
                      </div>
                    </ProviderListItem>
                  );
                })}
              </Form>
            </div>
          </>
        );
      }}
    />
  );
});

export const head: DocumentHead = {
  title: "Provider Settings - AuthC1 Dashboard",
  meta: [
    {
      name: "description",
      content:
        "Manage your AuthC1 provider settings and configure your application's authentication methods.",
    },
  ],
};
