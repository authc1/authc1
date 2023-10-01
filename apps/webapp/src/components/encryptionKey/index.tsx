import { $, component$, useSignal } from "@builder.io/qwik";
import { CloseEye } from "../icons/closeEye";
import { OpenEye } from "../icons/openEye";

interface RevealEncryptionKeyProps {
  encryptionKey: string;
}

export const RevealEncryptionKeyComponent =
  component$<RevealEncryptionKeyProps>((props) => {
    const isKeyVisible = useSignal(false);
    const onClick = $(() => {
      isKeyVisible.value = !isKeyVisible.value;
    });
    const isKeyVisibleValue = isKeyVisible.value;
    return (
      <div class="flex items-center">
        <div
          class={`text-xs font-medium text-zinc-500 dark:text-zinc-400 p-4 pl-0 ${
            isKeyVisibleValue ? "" : "blur-sm"
          }`}
        >
          {props.encryptionKey}
        </div>
        <div>
          <button
            type="button"
            onClick$={onClick}
            class="px-2 py-2 text-sm text-white font-medium rounded-md border-input border"
          >
            {isKeyVisibleValue ? <CloseEye /> : <OpenEye />}
          </button>
        </div>
      </div>
    );
  });
