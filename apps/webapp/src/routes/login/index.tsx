import { component$, useStore } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { getRedirectUrl, signIn } from "~/utils/auth";
import Button from "~/components/button";
import { LoginHero } from "~/components/icons/login-hero";

export const useSigninAction = routeAction$(
  async (data, { cookie, fail, redirect, env }) => {
    try {
      const appId = env.get("VITE_APPLICTION_ID") as string;
      const baseUrl = env.get("VITE_API_URL") as string;
      const result = await signIn(data, cookie, appId, baseUrl);
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

export const useRedirectUrl = routeLoader$(({ cookie, env }) => {
  const appId = env.get("VITE_APPLICTION_ID") as string;
  const baseUrl = env.get("VITE_API_URL") as string;
  const url = getRedirectUrl(cookie, appId, baseUrl, "github");
  return {
    url,
  };
});

export default component$(() => {
  const localState: any = useStore({
    showPassword: undefined,
    status: "error",
  });
  const { showPassword } = localState;
  const signIn = useSigninAction();
  const urlData = useRedirectUrl();
  const url = urlData.value?.url as string;

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
              href="/reset"
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
          <div class="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
            <p class="mx-4 mb-0 text-center dark:text-white font-light text-xs">
              OR CONTINUE WITH
            </p>
          </div>
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors ring-offset-background border border-input hover:bg-zinc-700/[0.25] h-10 py-2 px-4 dark:text-white w-full mt-2"
            type="button"
          >
            <svg viewBox="0 0 438.549 438.549" class="mr-2 h-4 w-4">
              <path
                fill="currentColor"
                d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
              ></path>
            </svg>
            Github
          </button>
          <div>
            <a href={url}>Github</a>
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
