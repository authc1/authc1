import { component$, Slot, useStore } from "@builder.io/qwik";

interface Props {
  isFirst?: boolean;
  isLast?: boolean;
  enabled?: boolean;
  inactive?: boolean;
  label: string;
}

export default component$(
  ({ isFirst, isLast, label, enabled, inactive }: Props) => {
    const state = useStore({
      checked: isFirst,
    });
    return (
      <>
        <h2 id="accordion-collapse-heading-1">
          <button
            type="button"
            class={`flex items-center justify-between w-full p-5 font-medium text-base border ${
              isFirst ? "border-b-0 rounded-t-xl" : ""
            }
          ${isLast && !state.checked ? "rounded-b-xl" : ""}
          ${inactive ? "pointer-events-none cursor-not-allowed" : ""}
          border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none`}
            onClick$={() => (state.checked = !state.checked)}
            aria-expanded="true"
            aria-controls="accordion-collapse-body-1"
            disabled={inactive}
          >
            <span>{label}</span>
            <div class="flex items-center">
              {enabled ? (
                <span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400">
                  Enabled
                </span>
              ) : (
                <span class="bg-gray-300 text-gray-500 text-xs font-medium mr-2 px-2.5 py-0.5 rounded border border-gray-400">
                  {inactive ? "Inactive" : "Disabled"}
                </span>
              )}
              <svg
                data-accordion-icon
                class="w-6 h-6 rotate-180 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </button>
        </h2>

        <div
          aria-labelledby="accordion-collapse-heading-1"
          class={`overflow-hidden ${
            state.checked
              ? "transition-all ease-in duration-500 h-auto"
              : "h-0 transition-all ease-out duration-500"
          }`}
        >
          <div
            class={`p-5 font-light border ${
              isLast ? "border-t-0 rounded-b-xl" : "border-b-0"
            } border-gray-200 dark:border-gray-700 dark:bg-gray-900`}
          >
            <Slot />
          </div>
        </div>
      </>
    );
  }
);
