import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <div class="flex flex-col items-center h-screen w-screen justify-center">
      <h1 class="text-2xl font-medium text-red-600">
        AuthC1 has failed to load!
      </h1>
      <p class="text-gray-600 mt-4">
        It looks like AuthC1 has run into some trouble and can't be loaded.
      </p>
      <p class="text-gray-600 mt-2">
        Maybe try checking your internet connection and try again later.
      </p>
    </div>
  );
});
