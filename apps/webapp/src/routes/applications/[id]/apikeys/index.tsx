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
import ApiKeysList from "~/components/apiKeysList";
import {
  createApplicationApikey,
  getAllApplicationApikeys,
} from "~/utils/applications";

export const ApiKeySchema = {
  description: z.string().optional(),
  resources: z
    .array(
      z.object({
        resource: z.string(),
        accessLevel: z.enum(["read", "write", "none"]),
      })
    )
    .nullish()
    .default([]),
};

const apiKeyFieldsSchema = [
  {
    key: "description",
    label: "Description",
    inputType: "textarea",
    editable: true,
  },
];

export const userApplicationApiKeyLoader = routeLoader$(
  async ({ cookie, params, env }) => {
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const baseUrl = env.get("VITE_API_URL") as string;
    const data = await getAllApplicationApikeys(
      cookie,
      appId,
      baseUrl,
      params.id
    );
    return data;
  }
);

export const useAddApiKeyAction = routeAction$(
  async (data, { cookie, fail, params, env, redirect }) => {
    const baseUrl = env.get("VITE_API_URL") as string;
    const appId = env.get("VITE_APPLICTION_ID") as string;

    const { description } = data;

    const results = await createApplicationApikey(
      {
        description,
      },
      params.id,
      cookie,
      appId,
      baseUrl
    );

    console.log("useAddApiKeyAction***********", data, results);

    if (results?.data) {
      const { id: apikey } = results.data;
      throw redirect(302, `/applications/${params?.id}/apikeys/${apikey}`);
    }

    return fail(403, {
      message: "Failed to create API key for the application",
    });
  },
  zod$(ApiKeySchema)
);

export default component$(() => {
  const apiKeysData = userApplicationApiKeyLoader();
  const addApiKey = useAddApiKeyAction();
  const { value } = apiKeysData;
  const { data: apiKeys } = value;

  return (
    <>
      <TabBar />
      <div class="max-w-xl lg:px-8 sm:px-8 mt-24 md:mt-8 mb-24 container">
        <h2 class="flex text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          API keys
        </h2>
        <ApiKeysList apiKeys={apiKeys} />
        <h3 class="mt-8 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Add New API Key
        </h3>
        <p class="text-sm text-zinc-600 dark:text-zinc-400">
          API keys are used to authenticate API requests and provide secure
          access to AuthC1's resources. Generate unique API keys for different
          purposes.
        </p>
        <Form action={addApiKey} class="mt-4 block max-w-md">
          <SettingsForm
            schema={apiKeyFieldsSchema}
            defaultValues={{
              description: "",
              events: [],
            }}
          />
          <p class="mt-2 text-sm text-red-600 dark:text-red-500">
            {addApiKey.value?.message}
          </p>
          <Button
            type="submit"
            isRunning={addApiKey.isRunning}
            label="Create Key"
            styles="mt-4"
          />
        </Form>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "API Keys - AuthC1 Dashboard",
  meta: [
    {
      name: "description",
      content:
        "Manage API keys to authenticate API requests and provide secure access to AuthC1's resources.",
    },
  ],
};
