import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import BuiltWith from "~/components/builtWith";
import Footer from "~/components/footer";
import { Hero } from "~/components/icons/hero";

export default component$(() => {
  return (
    <>
      <div class="relative mx-auto mt-16 w-full max-w-container grid grid-cols-1 md:grid-cols-2 gap-16 px-4 sm:mt-20 sm:px-6 lg:px-8 xl:mt-32">
        <div class="col-span-1">
          <h1 class="text-4xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            Secure and Affordable Authentication with
            <span class="text-primary pl-2">AuthC1</span>
          </h1>
          <p class="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            Authc1 provides secure and scalable authentication and authorization
            for your app, without compromising on privacy. Our fully
            customizable API allows you to implement features like sign up,
            login, password reset, and email verification easily and affordably,
            without storing any user data. Plus, with our global infrastructure,
            you can ensure quick and seamless performance no matter where your
            users are located.
          </p>
          <div class="mt-4">
            <BuiltWith />
          </div>
        </div>
        <div class="col-span-1 flex justify-center items-center mt-6 md:mt-0">
          <Hero />
        </div>
      </div>
      <Footer />
    </>
  );
});

export const head: DocumentHead = {
  title: "AuthC1: Secure Authentication & Authorization for Your App",
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

