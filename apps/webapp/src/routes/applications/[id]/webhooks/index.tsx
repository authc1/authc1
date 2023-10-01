import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import {
  Form,
  routeAction$,
  routeLoader$,
  z,
  zod$,
} from "@builder.io/qwik-city";
import Button from "~/components/button";
import SettingsForm from "~/components/settingsForm";
import TabBar from "~/components/tabBar";
import WebhookList from "~/components/webhookList";
import { EventsConfig } from "~/enums/events";
import {
  createApplicationWebhook,
  getAllApplicationWebhooks,
} from "~/utils/applications";

export const WebhookSchema = {
  url: z.string().url(),
  description: z.string().optional(),
  events: z.array(z.string().optional()),
};

const webhookFieldsSchema = [
  {
    key: "url",
    label: "Webhook URL",
    inputType: "input",
    editable: true,
  },
  {
    key: "description",
    label: "Description",
    inputType: "textarea",
    editable: true,
  },
  {
    key: "events",
    label: "Events",
    inputType: "checkbox",
    editable: true,
    column: true,
    options: Object.values(EventsConfig).map((event) => ({
      label: event,
      value: event,
    })),
  },
];

export const userApplicationWebhookLoader = routeLoader$(
  async ({ cookie, params, env }) => {
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const baseUrl = env.get("VITE_API_URL") as string;
    const data = await getAllApplicationWebhooks(
      cookie,
      appId,
      baseUrl,
      params.id
    );
    return data;
  }
);

export const useAddWebhookAction = routeAction$(
  async (data, { cookie, fail, params, env, redirect }) => {
    const baseUrl = env.get("VITE_API_URL") as string;
    const appId = env.get("VITE_APPLICTION_ID") as string;

    const { events, ...rest } = data;

    const results = await createApplicationWebhook(
      {
        ...rest,
        events: events.filter((item) => item),
      },
      params.id,
      cookie,
      appId,
      baseUrl
    );

    if (results?.data) {
      const { id: webhookId } = results.data;
      throw redirect(302, `/applications/${params?.id}/webhooks/${webhookId}`);
    }

    return fail(403, {
      message: "Failed to create Webhook endpoint for the application",
    });
  },
  zod$(WebhookSchema)
);

export default component$(() => {
  const webhooksEndpoints = userApplicationWebhookLoader();
  const addWebhook = useAddWebhookAction();
  const { value } = webhooksEndpoints;
  const { data: webhooks } = value;

  return (
    <>
      <TabBar />
      <div class="max-w-xl lg:px-8 sm:px-8 mt-24 md:mt-8 mb-24 container">
        <h2 class="flex text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Webhooks
        </h2>
        <WebhookList webhooks={webhooks} />
        <h3 class="mt-8 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Add New Webhook
        </h3>
        <p class="text-sm text-zinc-600 dark:text-zinc-400">
          Listen to Auth events. Setup your webhook events to listen to live
          events from AuthC1.
        </p>
        <Form action={addWebhook} class="mt-4 block max-w-md">
          <SettingsForm
            schema={webhookFieldsSchema}
            defaultValues={{
              url: "",
              description: "",
              events: [],
            }}
          />
          <p class="mt-2 text-sm text-red-600 dark:text-red-500">
            {addWebhook.value?.message}
          </p>
          <Button
            type="submit"
            isRunning={addWebhook.isRunning}
            label="Add Endpoint"
            styles="mt-4"
          />
        </Form>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Webhooks - AuthC1 Dashboard",
  meta: [
    {
      name: "description",
      content: "Manage webhooks to listen to live events from AuthC1.",
    },
  ],
};
