import type { PropFunction } from "@builder.io/qwik";
import {
  component$,
  useVisibleTask$,
  useStore,
} from "@builder.io/qwik";
import Loader from "../loader";

type Props = {
  isRunning: boolean;
  onClick$?: PropFunction<() => void>;
};

export default component$(({ isRunning, onClick$ }: Props) => {
  const store = useStore({
    count: 60,
    buttonEnabled: true,
  });

  useVisibleTask$(() => {
    const timer = setInterval(() => {
      if (store.count > 0) {
        store.count--;
      } else if (store.count === 0) {
        store.buttonEnabled = false;
      }
    }, 1000);

    return () => clearInterval(timer);
  });

  return (
    <>
      {isRunning ? (
        <Loader />
      ) : store.buttonEnabled ? (
        <span class="text-sm font-medium space-x-1 text-gray-500">
          Resend in {store.count}s
        </span>
      ) : (
        <div class="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
          <p>Didn't recieve code?</p>{" "}
          <button
            class="flex flex-row items-center text-blue-600"
            onClick$={async () => {
              if (typeof onClick$ === "function") {
                await onClick$();
                store.count = 60;
                store.buttonEnabled = true;
              }
            }}
            type="button"
          >
            Resend
          </button>
        </div>
      )}
    </>
  );
});
