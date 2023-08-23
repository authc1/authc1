import { useVisibleTask$, component$, useStore } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { formatDistance } from "date-fns";
import type { AuthState } from "~/utils/fetch";

type Props = {
  authState: AuthState;
  applicationId: string;
  baseWssUrl: string;
};

export default component$(({ authState, applicationId, baseWssUrl }: Props) => {
  const loc = useLocation();
  const { id } = loc.params;
  const store = useStore({
    activities: [] as any,
  });

  useVisibleTask$(async () => {
    const ws = new WebSocket(`${baseWssUrl}/webhook/${id}/listen`);
    const payload = {
      type: "connection_init",
      headers: {
        Authorization: `Bearer ${authState?.access_token}`,
        "X-Authc1-Id": applicationId,
      },
    };

    ws.addEventListener("open", () => {
      ws.send(JSON.stringify(payload));
    });

    const receiveHandler = async (event: any) => {
      const message = JSON.parse(event.data);
      const data = Array.isArray(message)
        ? message
            ?.map((item: string) => JSON.parse(item))
            .reverse()
            .slice(0, 10)
        : [message];
      store.activities = [...data, ...store.activities];
    };

    ws.addEventListener("message", receiveHandler);

    return () => {
      ws.removeEventListener("message", receiveHandler);
    };
  });

  return (
    <>
      {store.activities?.length > 0 ? (
        <>
          <div class="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40 mt-6">
            <ol class="mt-3 divide-y divider-gray-200 dark:divide-gray-700">
              {store.activities.map((item: any) => (
                <li key={item.email}>
                  <div class="items-center block p-3 sm:flex">
                    <div class="text-gray-600 dark:text-gray-400">
                      <div class="text-base font-normal">
                        <span class="font-medium text-gray-900 dark:text-white pr-2">
                          {item?.email}
                        </span>
                        {item?.acitivity}
                      </div>
                      <time class="flex text-sm font-normal text-zinc-900 dark:text-zinc-100">
                        {item?.created_at
                          ? formatDistance(
                              new Date(item?.created_at),
                              new Date(),
                              {
                                addSuffix: true,
                              }
                            )
                          : ""}
                      </time>
                      <span class="inline-flex items-center text-xs font-normal text-gray-500 dark:text-gray-400">
                        <svg
                          aria-hidden="true"
                          class="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                        {item?.acitivity}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Stay secure and organized with real-time updates - Get started with
          AuthC1 and monitor your authentication processes seamlessly.
        </p>
      )}
    </>
  );
});
