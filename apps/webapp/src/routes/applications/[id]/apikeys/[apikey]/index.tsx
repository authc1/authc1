import { $, component$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeAction$, routeLoader$, z, zod$ } from "@builder.io/qwik-city";
import Button from "~/components/button";
import { RevealEncryptionKeyComponent } from "~/components/encryptionKey";
import { Modal } from "~/components/modal";
import TabBar from "~/components/tabBar";
import {
  deleteWebhookById,
  getApiKeyDetailsById,
  updateWebhookById,
} from "~/utils/applications";

export const useApiKeyDetailsLoader = routeLoader$(
  async ({ cookie, params, env, redirect }) => {
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const baseUrl = env.get("VITE_API_URL") as string;
    const { apikey, id } = params;
    try {
      const result = await getApiKeyDetailsById(
        cookie,
        appId,
        baseUrl,
        id,
        apikey
      );
      if (!result?.data) {
        throw redirect(302, `/applications/${params?.id}/apikeys`);
      }
      return result;
    } catch (err) {
      throw redirect(302, `/applications/${params?.id}/apikeys`);
    }
  }
);

export const useDeleteWebhookAction = routeAction$(
  async (data, { cookie, fail, redirect, env, params }) => {
    try {
      const appId = env.get("VITE_APPLICTION_ID") as string;
      const baseUrl = env.get("VITE_API_URL") as string;
      const { apiKeyId, id } = params;
      const result = await deleteWebhookById(
        cookie,
        appId,
        baseUrl,
        id,
        apiKeyId
      );

      if (result?.data) {
        throw redirect(302, `/applications/${params?.id}/webhooks`);
      }

      return fail(403, {
        message: "Failed to delete Webhook endpoint for the application",
      });
    } catch (e) {
      return fail(403, {
        message: "Invalid webhook: ${e.message}",
      });
    }
  }
);

export const useUpdateWebhookEnabled = routeAction$(
  async (data, { cookie, fail, env, params, redirect }) => {
    try {
      const appId = env.get("VITE_APPLICTION_ID") as string;
      const baseUrl = env.get("VITE_API_URL") as string;
      const { webhookId, id } = params;
      if (data) {
        const result = await updateWebhookById(
          cookie,
          appId,
          baseUrl,
          id,
          webhookId,
          data
        );

        if (result?.data) {
          throw redirect(
            302,
            `/applications/${params?.id}/webhooks/${webhookId}`
          );
        }
      }

      return fail(403, {
        message: "Failed to update webhook.enabled",
      });
    } catch (e) {
      return fail(403, {
        message: "Invalid username or password",
      });
    }
  },
  zod$({
    enabled: z.boolean(),
  })
);

export default component$(() => {
  const aoiKeyDetails = useApiKeyDetailsLoader();
  const deleteWebhook = useDeleteWebhookAction();
  const { value } = aoiKeyDetails;
  const { data: apiKey = {} } = value;

  const store = useStore({ isOpen: false });
  const toggleModal = $(() => {
    store.isOpen = !store.isOpen;
  });

  return (
    <>
      <TabBar />
      <div class="mx-auto max-w-7xl lg:px-8 sm:px-8 mt-12 mb-24 container mx-auto max-w-4xl">
        <div class="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40 mt-6">
          <ol class="mt-3 divide-y divider-gray-200 dark:divide-gray-700">
            <li>
              <div class="items-center block md:flex justify-between">
                <div class="text-base font-normal">
                  <span class="font-medium text-gray-900 dark:text-white pr-2">
                    {apiKey.id}
                  </span>
                </div>
              </div>
            </li>
            <li>
              <h3 class="flex text-xl font-semibold text-zinc-900 dark:text-zinc-100 my-8">
                API Key Details
              </h3>
              <dl class="flex flex-auto flex-wrap items-center gap-x-2 mb-8">
                <dt class="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  API key id
                </dt>
                <dd class="w-full flex-none text-sm text-zinc-900 dark:text-zinc-100">
                  {apiKey.id}
                </dd>
                <dt class="w-full flex text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-3">
                  Description
                </dt>
                <dd class="w-full flex text-xs text-zinc-500 dark:text-zinc-400">
                  {apiKey.description}
                </dd>
              </dl>
            </li>
            <li>
              <h3 class="flex text-xl font-semibold text-zinc-900 dark:text-zinc-100 my-8">
                Secret API Key
              </h3>
              <div class="md:flex items-center justify-between">
                <RevealEncryptionKeyComponent
                  encryptionKey={apiKey.key}
                />
                <div class="mt-2">
                  <Button
                    isRunning={false}
                    type="button"
                    label="Replace Token"
                    styles="border-input border bg-transparent dark:bg-transparent text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
      <Modal title="Delete API key" store={store}>
        <div class="p-4">
          <p class="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
            Are you sure you want to delete the webhook token?
          </p>
          <div class="flex justify-end space-x-4">
            <Button
              isRunning={false}
              type="button"
              label="Cancel"
              styles="border-input border bg-transparent dark:bg-transparent text-zinc-900 dark:text-zinc-100"
              onClick={toggleModal}
            />
            <Button
              isRunning={deleteWebhook.isRunning}
              type="button"
              label="Continue"
              styles="border-red-500 border bg-transparent dark:bg-transparent text-white bg-red-500"
              onClick={$(async () => await deleteWebhook.submit())}
            />
          </div>
        </div>
      </Modal>
    </>
  );
});

export const head: DocumentHead = {
  title: "Webhook Details - AuthC1 Dashboard",
  meta: [
    {
      name: "description",
      content: "View and manage details of a webhook in AuthC1.",
    },
  ],
};
