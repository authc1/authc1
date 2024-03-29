import { component$ } from "@builder.io/qwik";

export const One = component$(({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" {...props}>
      <path d="m30.29 40.55 2.83 2.83 10.49-10.49-10.49-10.48-2.83 2.83 5.66 5.65H6.01v4h29.94l-5.66 5.66z"></path>
      <path d="m51.43 13.78-1.37-.19A27.92 27.92.0 0134.69 6L33.5 4.66h-3L29.34 6A27.82 27.82.0 0114 13.59l-1.37.19-1.72 2V27h4v-9.5A32.11 32.11.0 0032 9a32.16 32.16.0 0017.15 8.5v12.4C49.15 46.26 34 54.73 32 55.75 30.47 55 20.58 49.43 16.57 39h-4.24c4.41 13.43 17.42 20.09 18.08 20.42l.71.36h1.79l.71-.36c.8-.39 19.53-10 19.53-29.52V15.76l-1.72-1.98z"></path>
    </svg>
  );
});

export const Pages = component$(({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
      <path d="m21.375 7.5-1.95 3H9v27h8.7l-.525 3H7.5L6 39V9l1.5-1.5h13.875zm9.45.0H40.5L42 9v30l-1.5 1.5H26.625l1.95-3H39v-27h-8.7l.525-3z"></path>
      <path d="M21.45 28.5h-8.7l-1.275-2.325 15.6-24 2.7 1.125-3.225 16.2h8.7l1.275 2.325-15.6 24-2.7-1.125 3.225-16.2zM11.175 13.725a1.05 1.05.0 100-2.1 1.05 1.05.0 000 2.1zm2.775.0a1.05 1.05.0 100-2.1 1.05 1.05.0 000 2.1zm2.775.0a1.05 1.05.0 100-2.1 1.05 1.05.0 000 2.1z"></path>
    </svg>
  );
});

export const Queues = component$(({ ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      {...props}
    >
      <path d="M11.154 19.894L5.33 14.21l-1.612 1.65 2.656 2.594H1.942a1.442 1.442 0 100 2.884h4.433L3.72 23.927l1.61 1.653 5.823-5.685zm28.352 0l-5.823-5.685-1.612 1.65 2.656 2.594h-4.433a1.442 1.442 0 100 2.884h4.433l-2.655 2.591 1.611 1.651 5.823-5.685z"></path>
      <rect width="23.07" height="2.884" x="7.911" y="7" rx="1.442"></rect>
      <rect width="23.07" height="2.884" x="7.911" y="30.07" rx="1.442"></rect>
      <path d="M13.679 14.21c.796 0 1.442.645 1.442 1.441v8.651a1.442 1.442 0 11-2.884 0v-8.65c0-.797.646-1.443 1.442-1.443zm5.767 0c.797 0 1.442.645 1.442 1.441v8.651a1.442 1.442 0 11-2.884 0v-8.65c0-.797.646-1.443 1.442-1.443zm5.768 0c.796 0 1.442.645 1.442 1.441v8.651a1.442 1.442 0 11-2.884 0v-8.65c0-.797.645-1.443 1.442-1.443z"></path>
    </svg>
  );
});

export const Workers = component$(({ ...props }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 49" {...props}>
      <path d="M18.63 37.418l-9.645-12.9 9.592-12.533-1.852-2.527L5.917 23.595l-.015 1.808 10.86 14.542 1.868-2.527z"></path>
      <path d="M21.997 6.503h-3.712l13.387 18.3-13.072 17.7h3.735L35.4 24.81 21.997 6.503z"></path>
      <path d="M29.175 6.503h-3.758l13.598 18.082-13.598 17.918h3.765l12.908-17.01v-1.808L29.175 6.503z"></path>
    </svg>
  );
});
