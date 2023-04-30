import { component$ } from "@builder.io/qwik";

type Props = {
  styles: string;
}

export const ChevronRightIcon = component$(({ styles }: Props) => {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class={styles}>
      <path
        d="M6.75 5.75 9.25 8l-2.5 2.25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});
