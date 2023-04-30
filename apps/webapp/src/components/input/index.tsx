import { component$ } from "@builder.io/qwik";

interface Props {
  label: string;
  name: string;
  placeholder: string;
  ariaLabel: string;
  type?: string;
  className?: string;
}

export default component$(
  ({
    label,
    name,
    placeholder,
    ariaLabel,
    type = "text",
    className,
  }: Props) => {
    return (
      <div class="mb-4">
        <label class="block text-black-500 font-medium mb-2" for={name}>
          {label}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          aria-label={ariaLabel}
          class={`min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm ${className}`}
        />
      </div>
    );
  }
);
