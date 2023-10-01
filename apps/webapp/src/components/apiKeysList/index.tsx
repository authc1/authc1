import { component$ } from "@builder.io/qwik";
import { z } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { ChevronRightIcon } from "../icons/chevronRightIcon";

const extendedWebhookSchema = z.object({
  description: z.string().optional(),
  id: z.string(),
  key: z.string(),
});

export type ApiKeysProps = {
  apiKeys: z.infer<typeof extendedWebhookSchema>[];
};

export default component$(({ apiKeys = [] }: ApiKeysProps) => {
  const isApiKeysListEmpty = apiKeys?.length === 0;
  return (
    <>
      {isApiKeysListEmpty ? (
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          No API keys found. Create your first API key now.
        </p>
      ) : (
        <ol class="mt-6">
          {apiKeys?.map((apiKey) => (
            <li
              key={apiKey.id}
              class="mx-3 flex gap-4 rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
            >
              <Link href={apiKey.id}>
                <dl class="flex flex-auto flex-wrap items-center gap-x-2">
                  <dt class="w-full flex text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-3">
                    Description
                  </dt>
                  <dd class="w-full flex text-xs text-zinc-500 dark:text-zinc-400">
                    {apiKey.description}
                  </dd>
                  <dd class="ml-auto text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-end">
                    <ChevronRightIcon styles="ml-1 h-5 w-5 stroke-current" />
                  </dd>
                </dl>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </>
  );
});
