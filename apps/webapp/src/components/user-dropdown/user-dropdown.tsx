import { component$, useSignal } from "@builder.io/qwik";
import type { ActionStore, FailReturn } from "@builder.io/qwik-city";
import { Ghost } from "../icons/ghost";
import { showNotification } from "~/utils/notification";

interface Option {
  label: string;
  href: string;
}

interface DropdownProps {
  options: Option[];
  userName: string;
  email: string;
  logoutAction: ActionStore<
    FailReturn<{ message: string }>,
    Record<string, any>,
    true
  >;
}

export default component$((props: DropdownProps) => {
  const { options, userName, email, logoutAction } = props;
  const isOpen = useSignal(false);

  return (
    <div class="relative inline-block text-left">
      <button
        type="button"
        class="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        id="menu-button"
        aria-expanded={isOpen.value}
        aria-haspopup="true"
        onClick$={() => {
          isOpen.value = !isOpen.value;
        }}
      >
        <Ghost />
        <span class="truncate max-w-[100px]">{userName}</span>
        <svg
          class="-mr-1 h-5 w-5 text-primary"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <div
        class={`absolute right-0 mt-2 w-56 origin-top-right rounded-md dark:bg-cyan-950 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition ${
          isOpen.value
            ? "ease-out duration-100 transform opacity-100 scale-100 z-10"
            : "ease-in duration-75 transform opacity-0 scale-95 -z-10"
        }`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
      >
        <div role="none">
          <div class="py-3 px-5 bg-primary bg-opacity-20 rounded-t-lg">
            <p class="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
            <p class="text-sm font-medium text-primary truncate">{email}</p>
          </div>
          <div class="mb-2 mt-2">
            {options.map((option: Option, index: number) => (
              <a
                key={option?.href}
                href={option?.href}
                class="text-zinc-800 dark:text-zinc-200 block px-4 py-2 text-sm font-medium hover:bg-primary hover:bg-opacity-10"
                role="menuitem"
                id={`menu-item-${index}`}
              >
                {option?.label}
              </a>
            ))}
            <button
              class="text-gray-500 dark:text-gray-400 block px-4 py-2 text-sm font-medium hover:bg-primary hover:bg-opacity-10 text-left w-full"
              onClick$={async () => {
                try {
                  await logoutAction.submit();
                } catch {
                  showNotification("Error while logging out!", "error");
                }
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
