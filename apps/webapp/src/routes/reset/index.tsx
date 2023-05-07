import { component$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import Button from "~/components/button";
import { VerfiyHero } from "~/components/icons/verify-hero";
import { forgotPassword, confirmNewPassowrd } from "~/utils/auth";

import type { ErrorResponse } from "~/utils/fetch";

export const useSendCodeAction = routeAction$(
  async (data, { cookie, env }) => {
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const baseUrl = env.get("VITE_API_URL") as string;
    const result = await forgotPassword(data, cookie, appId, baseUrl);
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
  },
  zod$({
    email: z.string(),
  })
);

export const useConfirmCodeAction = routeAction$(
  async (data, { cookie, fail, redirect, env }) => {
    const { email, code, confirm_password, password } = data;
    if (confirm_password !== password) {
      return fail(403, {
        message: "The password and confirm password fields must match.",
      });
    }
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const baseUrl = env.get("VITE_API_URL") as string;
    const result = await confirmNewPassowrd(
      {
        email,
        code,
        password,
      },
      cookie,
      appId,
      baseUrl
    );
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
    email: z.string(),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
  })
);

export default component$(() => {
  const confirmEmail = useConfirmCodeAction();
  const sendAction = useSendCodeAction();
  const localState: any = useStore({
    showPassword: undefined,
    status: "error",
  });
  const { showPassword } = localState;

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
                type="email"
                name="email"
                value={sendAction?.formData?.get("email")}
                placeholder="Email"
                class="w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
              />
              {confirmEmail.value?.fieldErrors?.email && (
                <p class="text-red-500 text-xs italic">
                  {confirmEmail.value?.fieldErrors?.email}
                </p>
              )}
            </label>
            <label class="block space-y-2 mt-8">
              <input
                required
                type="text"
                name="code"
                placeholder="Code"
                class="w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
              />
              {confirmEmail.value?.fieldErrors?.code && (
                <p class="text-red-500 text-xs italic">
                  {confirmEmail.value?.fieldErrors?.code}
                </p>
              )}
            </label>
            <label class="block relative space-y-2 mt-8">
              <input
                required
                minLength={8}
                name="password"
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,24}"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                class="w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
              />
              {confirmEmail.value?.fieldErrors?.password && (
                <p class="text-red-500 text-xs italic">
                  {confirmEmail.value?.fieldErrors?.password}
                </p>
              )}
              <div
                class="absolute top-0 right-4 text-gray-400 dark:text-gray-600 cursor-pointer"
                onClick$={() => (localState.showPassword = !showPassword)}
                aria-hidden="true"
              >
                {showPassword ? "Hide" : "Show"}
              </div>
            </label>
            <label class="block relative space-y-2 mt-8">
              <input
                required
                minLength={8}
                name="confirm_password"
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,24}"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                class="w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
              />
              {confirmEmail.value?.fieldErrors?.confirm_password && (
                <p class="text-red-500 text-xs italic">
                  {confirmEmail.value?.fieldErrors?.confirm_password}
                </p>
              )}
              <div
                class="absolute top-0 right-4 text-gray-400 dark:text-gray-600 cursor-pointer"
                onClick$={() => (localState.showPassword = !showPassword)}
                aria-hidden="true"
              >
                {showPassword ? "Hide" : "Show"}
              </div>
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
            <label class="block space-y-2 mt-12">
              <input
                required
                type="email"
                name="email"
                placeholder="Email"
                class="w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
              />
              {sendAction.value?.fieldErrors?.email && (
                <p class="text-red-500 text-xs italic">
                  {sendAction.value?.fieldErrors?.email}
                </p>
              )}
            </label>
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
