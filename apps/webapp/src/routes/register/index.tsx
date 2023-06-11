import { component$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { register } from "~/utils/auth";
import type { ErrorResponse } from "~/utils/fetch";
import { RegisterHero } from "~/components/icons/register-hero";
import Button from "~/components/button";
import { showNotification } from "~/utils/notification";

export const useRegisterAction = routeAction$(
  async (data, { cookie, fail, redirect, env }) => {
    const { name, email, confirm_password, password } = data;
    if (confirm_password !== password) {
      return fail(403, {
        message: "The password and confirm password fields must match.",
      });
    }
    const appId = env.get("VITE_APPLICTION_ID") as string;
    const baseUrl = env.get("VITE_API_URL") as string;
    const result = await register(
      {
        email,
        password,
        name,
      },
      cookie,
      appId,
      baseUrl
    );

    if ((result as ErrorResponse)?.error) {
      return fail(403, {
        message: (result as ErrorResponse)?.error?.message,
      });
    }

    showNotification(
      "User created successfully! Please log in to get started.",
      "success"
    );

    throw redirect(302, "/");
  },
  zod$({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
  })
);

export default component$(() => {
  const localState: any = useStore({
    showPassword: undefined,
    status: "error",
  });
  const { showPassword } = localState;
  const register = useRegisterAction();

  return (
    <>
      <div class="flex flex-1 flex-col lg:flex-row mt-12 md:mt-24">
        <Form
          class="flex-1 lg:max-w-lg lg:mx-auto mt-16"
          action={register}
          spaReset
        >
          <h1 class="text-3xl font-medium text-zinc-800 dark:text-zinc-100">
            Ready to Sign Up with AuthC1?
          </h1>
          <label class="block space-y-2 mt-12">
            <input
              required
              type="email"
              name="email"
              placeholder="Email"
              class="w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
            />
            {register.value?.fieldErrors?.email && (
              <p class="text-red-500 text-xs italic">
                {register.value?.fieldErrors?.email}
              </p>
            )}
          </label>
          <label class="block space-y-2 mt-8">
            <input
              required
              type="text"
              name="name"
              placeholder="Name"
              class="w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
            />
            {register.value?.fieldErrors?.name && (
              <p class="text-red-500 text-xs italic">
                {register.value?.fieldErrors?.name}
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
            {register.value?.fieldErrors?.password && (
              <p class="text-red-500 text-xs italic">
                {register.value?.fieldErrors?.password}
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
            {register.value?.fieldErrors?.confirm_password && (
              <p class="text-red-500 text-xs italic">
                {register.value?.fieldErrors?.confirm_password}
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
          {register.value?.failed && (
            <p class="text-red-500 text-xs italic">{register.value?.message}</p>
          )}
          <Button
            isRunning={register.isRunning}
            type="submit"
            label="Register"
            styles="mt-8 w-full bg-primary"
          />
          <p class="text-sm mt-4 text-zinc-600 dark:text-zinc-400">
            Already have an account?
            <Link
              href="/login"
              class="text-sm transition text-zinc-800 dark:text-zinc-200 hover:text-primary dark:hover:text-light ml-2"
            >
              Login
            </Link>
          </p>
        </Form>
        <div class="flex-1 lg:max-w-lg lg:mx-auto mt-16">
          <RegisterHero />
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "AuthC1 | Register",
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
