import { component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";

export default component$(() => {
  const loc = useLocation();
  const {
    url,
    params: { id },
  } = loc;
  const { pathname } = url;

  return (
    <ul class="mt-5 mb-16 flex flex-wrap text-sm font-medium text-center border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
      <li class="mr-2">
        <Link
          href={`/applications/${id}`}
          aria-current="page"
          class={
            pathname === `/applications/${id}/`
              ? "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
              : "inline-block p-4 rounded-t-lg hover:text-light hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          }
        >
          General
        </Link>
      </li>
      <li class="mr-2">
        <Link
          href={`/applications/${id}/providers`}
          class={
            pathname === `/applications/${id}/providers/`
              ? "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
              : "inline-block p-4 rounded-t-lg hover:text-light hover:bg-gray-50 dark:hover:bg-dark dark:hover:text-light"
          }
        >
          Providers
        </Link>
      </li>
      <li>
        <Link
          href={`/applications/${id}/activities`}
          class={
            pathname === `/applications/${id}/activities/`
              ? "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
              : "inline-block p-4 rounded-t-lg hover:text-light hover:bg-gray-50 dark:hover:bg-dark dark:hover:text-light"
          }
        >
          Activites
        </Link>
      </li>
      <li>
        <Link
          href={`/applications/${id}/webhooks`}
          class={
            pathname === `/applications/${id}/webhooks/`
              ? "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
              : "inline-block p-4 rounded-t-lg hover:text-light hover:bg-gray-50 dark:hover:bg-dark dark:hover:text-light"
          }
        >
          Webhooks
        </Link>
      </li>
      <li>
        <Link
          href={`/applications/${id}/apikeys`}
          class={
            pathname === `/applications/${id}/apikeys/`
              ? "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active dark:bg-gray-800 dark:text-blue-500"
              : "inline-block p-4 rounded-t-lg hover:text-light hover:bg-gray-50 dark:hover:bg-dark dark:hover:text-light"
          }
        >
          API keys
        </Link>
      </li>
    </ul>
  );
});
