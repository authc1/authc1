import { component$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { signIn } from "~/utils/auth";
import Button from "~/components/button";
import { LoginHero } from "~/components/icons/login-hero";

export const useSigninAction = routeAction$(
  async (data, { cookie, fail, redirect, env }) => {
    try {
      const appId = env.get("VITE_APPLICTION_ID") as string;
      const result = await signIn(data, cookie, appId);
      if (result instanceof Error) {
        return fail(403, {
          message: "Invalid username or password",
        });
      }

      throw redirect(302, "/dashboard");
    } catch (e) {
      return fail(403, {
        message: "Invalid username or password",
      });
    }
  },
  zod$({
    email: z.string(),
    password: z.string(),
  })
);

export default component$(() => {
  const localState: any = useStore({
    showPassword: undefined,
    status: "error",
  });
  const { showPassword } = localState;
  const signIn = useSigninAction();

  return (
    <>
      <div class="flex flex-1 flex-col lg:flex-row mt-12 md:mt-24">
        <Form
          class="flex-1 lg:max-w-md lg:mx-auto mt-16"
          action={signIn}
          spaReset
        >
          <h1 class="text-3xl font-medium text-zinc-800 dark:text-zinc-100">
            Welcome back!
          </h1>
          <label class="block space-y-2 mt-12">
            <input
              required
              type="email"
              name="email"
              placeholder="Email"
              class="w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
            />
            {signIn.value?.fieldErrors?.email && (
              <p class="text-red-500 text-xs italic">
                {signIn.value?.fieldErrors?.email}
              </p>
            )}
          </label>
          <label class="block relative space-y-2 mt-8">
            <input
              required
              minLength={8}
              name="password"
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              class="w-full flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-light dark:focus:ring-light/10 sm:text-sm"
            />
            {signIn.value?.fieldErrors?.password && (
              <p class="text-red-500 text-xs italic">
                {signIn.value?.fieldErrors?.password}
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

          {signIn.value?.failed && (
            <p class="text-red-500 text-xs italic">{signIn.value?.message}</p>
          )}
          <Button
            isRunning={signIn.isRunning}
            type="submit"
            label="Login"
            styles="mt-8 w-full bg-primary"
          />
          <div class="flex justify-between pt-6 text-sm text-zinc-800 dark:text-zinc-200">
            <Link
              href="/login"
              class="transition hover:text-primary dark:hover:text-light"
            >
              Reset Password
            </Link>
            <Link
              href="/register"
              class="transition hover:text-primary dark:hover:text-light"
            >
              Register
            </Link>
          </div>
        </Form>
        <div class="flex-1 lg:max-w-lg lg:mx-auto mt-16">
          <LoginHero />
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "AuthC1 | Login",
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
