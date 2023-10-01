import { component$ } from "@builder.io/qwik";
import { z } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { ChevronRightIcon } from "../icons/chevronRightIcon";
import { EventsConfig } from "~/enums/events";

const extendedWebhookSchema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
  events: z.array(z.enum(Object.values(EventsConfig) as [string, ...string[]])),
  id: z.string(),
  encryptionKey: z.string(),
});

export type WebhookProps = {
  webhooks: z.infer<typeof extendedWebhookSchema>[];
};

export default component$(({ webhooks = [] }: WebhookProps) => {
  const isWebhookListEmpty = webhooks?.length === 0;
  return (
    <>
      {isWebhookListEmpty ? (
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          No webhooks found. Create your first webhook now.
        </p>
      ) : (
        <ol class="mt-6">
          {webhooks?.map((webhook) => (
            <li
              key={webhook.id}
              class="mx-3 flex gap-4 rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer"
            >
              <Link href={webhook.id}>
                <dl class="flex flex-auto flex-wrap items-center gap-x-2">
                  <dt class="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Webhook URL
                  </dt>
                  <dd class="w-full flex-none text-sm text-zinc-900 dark:text-zinc-100">
                    {webhook.url}
                  </dd>
                  <dt class="w-full flex text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-6">
                    Event Types
                  </dt>
                  <dd class="w-full flex text-xs text-zinc-500 dark:text-zinc-400">
                    {webhook.events.join(", ")}
                  </dd>
                  <dt class="w-full flex text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-3">
                    Description
                  </dt>
                  <dd class="w-full flex text-xs text-zinc-500 dark:text-zinc-400">
                    {webhook.description}
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
