import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import Button from "~/components/button";
import { VerfiyHero } from "~/components/icons/verify-hero";
import { verify, confirm } from "~/utils/auth";

import type { ErrorResponse } from "~/utils/fetch";

export const useSendCodeAction = routeAction$(async (data, { cookie, env }) => {
  const appId = env.get("VITE_APPLICTION_ID") as string;
  const result = await verify(cookie, appId);
  if ((result as ErrorResponse)?.error) {
    const { error } = result as ErrorResponse;
    return {
      suceess: false,
      message: error?.message,
    };
  }
  return {
    suceess: true,
    message: "",
  };
});

export const useConfirmCodeAction = routeAction$(
  async (data, { cookie, fail, redirect, env }) => {
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const result = await confirm(data, cookie, appId);
    if ((result as ErrorResponse)?.error) {
      const { error } = result as ErrorResponse;
      return fail(403, {
        message: error?.message,
      });
    }
    throw redirect(302, "/");
  },
  zod$({
    code: z.string(),
  })
);

export default component$(() => {
  const confirmEmail = useConfirmCodeAction();
  const sendAction = useSendCodeAction();

  return (
    <>
      <div class="flex flex-1 flex-col lg:flex-row mt-12 md:mt-24">
        {sendAction.value?.suceess ? (
          <Form
            class="flex-1 lg:max-w-lg lg:mx-auto mt-16"
            action={confirmEmail}
            spaReset
          >
            <h1 class="text-3xl font-medium text-zinc-800 dark:text-zinc-100">
              One step closer.
            </h1>
            <label class="block space-y-2 mt-12">
              <input
                required
                type="text"
                name="code"
                placeholder="Code"
                class="w-full px-3 py-2 text-sm border border-opacity-30 border-primary rounded"
              />
              {confirmEmail.value?.fieldErrors?.code && (
                <p class="text-red-500 text-xs italic">
                  {confirmEmail.value?.fieldErrors?.code}
                </p>
              )}
            </label>
            {confirmEmail.value?.failed && (
              <p class="text-red-500 text-xs italic">
                {confirmEmail.value?.message}
              </p>
            )}
            <Button
              isRunning={confirmEmail.isRunning}
              type="submit"
              label="Verify code"
              styles="mt-8 w-full bg-primary"
            />
          </Form>
        ) : (
          <Form
            class="flex-1 lg:max-w-lg lg:mx-auto mt-16"
            action={sendAction}
            spaReset
          >
            <h1 class="text-3xl font-medium text-zinc-800 dark:text-zinc-100">
              Reset Password and Regain Access!
            </h1>
            <Button
              isRunning={sendAction.isRunning}
              type="submit"
              label="Send code"
              styles="mt-8 w-full bg-primary"
            />
            {sendAction.value?.message && (
              <p class="text-red-500 text-xs italic">
                {sendAction.value?.message}
              </p>
            )}
          </Form>
        )}
        <div class="flex-1 lg:max-w-lg lg:mx-auto mt-16">
          <VerfiyHero />
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Authc1 | Verify",
  meta: [
    {
      name: "description",
      content:
        "Implement secure authentication and authorization features like login, password reset, and email verification with AuthC1. Our privacy-first API is fully customizable and affordable at any scale, without storing any user data. Get lightning-fast performance globally for your app with AuthC1.",
    },
    {
      name: "keywords",
      content:
        "AuthC1, authentication, authorization, security, privacy, API, login, password reset, email verification, customizable, affordable, global, performance",
    },
  ],
};
