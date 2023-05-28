import { component$, useSignal } from "@builder.io/qwik";

export const ListInput = component$(
  ({
    label,
    key,
    name,
    defaultValue = [],
    onChange,
    editable,
    maxInputNumber = 3,
  }: any) => {
    const totalInput = useSignal<number>(defaultValue?.length || 1);
    return (
      <div>
        {[...Array(totalInput.value).keys()].map((item) => (
          <div class={"flex items-center mr-4"} key={`${name}-${item}`}>
            <input
              type="text"
              id={key}
              name={name}
              onChange$={onChange}
              readOnly={!editable}
              aria-label={label}
              value={defaultValue[item]}
              class={`w-full min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm mb-2 ${
                editable ? "" : "opacity-50 cursor-not-allowed"
              }`}
            />
          </div>
        ))}
        {totalInput.value < maxInputNumber && (
          <button
            onClick$={() => {
              if (totalInput.value < maxInputNumber) {
                totalInput.value++;
              }
            }}
            type="button"
            class="text-blue-600"
          >
            Add URL
          </button>
        )}
      </div>
    );
  }
);
