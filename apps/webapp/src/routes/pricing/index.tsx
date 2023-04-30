import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <section class="py-10 sm:py-16 lg:py-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="mx-auto max-w-2xl text-center">
            <h2 class="text-3xl font-bold leading-tight text-gray-700 dark:text-gray-200 sm:text-4xl lg:text-5xl">
              Pricing &amp; Plans
            </h2>
            <p class="mx-auto mt-4 max-w-md text-base leading-relaxed text-gray-600 dark:text-gray-200">
              While in Alpha, AuthC1 will be free for all users.
            </p>
          </div>
          <div class="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3 md:gap-9">
            <div class="overflow-hidden rounded-md border-2 border-primary-ultradark bg-transparent">
              <div class="p-6 md:py-8 md:px-9">
                <h3 class="text-xl font-semibold text-black dark:text-white">
                  Starter Tier
                </h3>
                <p class="mt-2.5 text-sm text-gray-600 dark:text-gray-200">
                  Simple & Secure
                </p>
                <div class="mt-5 flex items-end">
                  <div class="flex items-start">
                    <span class="text-xl font-medium text-gray-500 dark:text-gray-200">
                      $
                    </span>
                    <p class="text-6xl font-medium tracking-tight text-gray-500 dark:text-gray-200">
                      6.9
                    </p>
                  </div>
                  <span class="ml-0.5 text-lg text-gray-500 dark:text-gray-200">
                    / month
                  </span>
                </div>
                <a
                  href="#"
                  title=""
                  class="mt-6 inline-flex w-full items-center justify-center rounded-full border-2 border-primary-ultradark bg-transparent px-4 py-3 font-semibold text-gray-600 transition-all duration-200 hover:bg-primary-ultradark hover:text-white dark:text-gray-200"
                  role=""
                >
                  Get started
                </a>
                <ul class="mt-8 flex flex-col space-y-4">
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-600 dark:text-gray-200">
                      Included: 69,000 logins
                    </span>
                    <svg
                      class="ml-0.5 h-4 w-4 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-600 dark:text-gray-200">
                      Additional logins: $0.00012 per login
                    </span>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-600 dark:text-gray-200">
                      Additional SMS OTP: $0.006 per OTP
                    </span>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-600 dark:text-gray-200">
                      Additional email verification: $0.00012 per verification
                    </span>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-600 dark:text-gray-200">
                      Premium Support
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="overflow-hidden rounded-md border-2 border-transparent bg-primary-ultradark">
              <div class="p-6 md:py-8 md:px-9">
                <h3 class="text-xl font-semibold text-white">Growth Tier</h3>
                <p class="mt-2.5 text-sm text-gray-200">Robust & Reliable</p>
                <div class="mt-5 flex items-end">
                  <div class="flex items-start">
                    <span class="text-xl font-medium text-white">$</span>
                    <p class="text-6xl font-medium tracking-tight text-white">
                      69
                    </p>
                  </div>
                  <span class="ml-0.5 text-lg text-gray-200">/ month</span>
                </div>
                <a
                  href="#"
                  title=""
                  class="mt-6 inline-flex w-full items-center justify-center rounded-full border-2 border-transparent px-4 py-3 font-semibold text-primary-ultradark transition-all duration-200 bg-white"
                  role=""
                >
                  Get started
                </a>
                <ul class="mt-8 flex flex-col space-y-4">
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-200">
                      Included: Up to 690,000 users
                    </span>
                    <svg
                      class="ml-0.5 h-4 w-4 text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-200">
                      Additional logins: $0.0001 per login
                    </span>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-200">
                      Additional SMS OTP: $0.0055 per OTP
                    </span>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-200">
                      Additional email verification: $0.00012 per verificatio
                    </span>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-200">
                      Premium Support
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="overflow-hidden rounded-md border-2 border-primary-ultradark bg-transparent">
              <div class="p-6 md:py-8 md:px-9">
                <h3 class="text-xl font-semibold text-black dark:text-white">
                  Enterprise Tier
                </h3>
                <p class="mt-2.5 text-sm text-gray-600 dark:text-gray-200">
                  Customizable Solution
                </p>
                <div class="mt-5 flex items-end">
                  <div class="flex items-start">
                    <span class="text-xl font-medium text-gray-500 dark:text-gray-200">
                      $
                    </span>
                    <p class="text-6xl font-medium tracking-tight text-gray-500 dark:text-gray-200">
                      Custom
                    </p>
                  </div>
                </div>
                <a
                  href="#"
                  title=""
                  class="mt-6 inline-flex w-full items-center justify-center rounded-full border-2 border-primary-ultradark bg-transparent px-4 py-3 font-semibold text-gray-600 transition-all duration-200 hover:bg-primary-ultradark hover:text-white dark:text-gray-200"
                  role=""
                >
                  Get started
                </a>
                <ul class="mt-8 flex flex-col space-y-4">
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-600 dark:text-gray-200">
                      Included: Customizable based on customer needs
                    </span>
                    <svg
                      class="ml-0.5 h-4 w-4 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-600 dark:text-gray-200">
                      Additional logins: Contact us for pricing
                    </span>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-600 dark:text-gray-200">
                      Additional SMS OTP: Contact us for pricing
                    </span>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-600 dark:text-gray-200">
                      Additional email verification: Contact us for pricing
                    </span>
                  </li>
                  <li class="inline-flex items-center space-x-2">
                    <svg
                      class="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-200"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    <span class="text-base font-medium text-gray-600 dark:text-gray-200">
                      Premium Support
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div class="space-y-16 py-24">
        <div class="mx-auto flex max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col items-center space-y-6 md:w-3/4">
            <div class="space-y-4 justify-self-center">
              <p class="text-center text-4xl font-semibold leading-10 text-zinc-800 dark:text-zinc-100">
                Frequently asked questions
              </p>
              <p class="text-center text-xl leading-loose text-gray-700 dark:text-gray-200">
                Everything you need to know about the product and billing.
              </p>
            </div>
            <div class="divide-y divide-gray-300">
              <div class="flex justify-between space-x-6 py-6">
                <div class="inline-flex flex-col items-start justify-start space-y-2">
                  <p class="text-lg font-medium leading-7 text-gray-700 dark:text-gray-100">
                    Is there a free trial available?
                  </p>
                  <p class="text-base leading-normal text-gray-500 dark:text-gray-400">
                    Yes, you can try us for free for 30 days. If you want, we’ll
                    provide you with a free, personalized 30-minute onboarding
                    call to get you up and running as soon as possible.
                  </p>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    class="h-6 w-6 text-primary-ultradark"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="flex justify-between space-x-6 py-6">
                <div class="inline-flex flex-col items-start justify-start space-y-2">
                  <p class="text-lg font-medium leading-7 text-gray-700 dark:text-gray-100">
                    Can I change my plan later?
                  </p>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    class="h-6 w-6 text-primary-ultradark"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="flex justify-between space-x-6 py-6">
                <div class="inline-flex flex-col items-start justify-start space-y-2">
                  <p class="text-lg font-medium leading-7 text-gray-700 dark:text-gray-100">
                    What is your cancellation policy?
                  </p>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    class="h-6 w-6 text-primary-ultradark"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="flex justify-between space-x-6 py-6">
                <div class="inline-flex flex-col items-start justify-start space-y-2">
                  <p class="text-lg font-medium leading-7 text-gray-700 dark:text-gray-100">
                    Can other info be added to an invoice?
                  </p>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    class="h-6 w-6 text-primary-ultradark"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="flex justify-between space-x-6 py-6">
                <div class="inline-flex flex-col items-start justify-start space-y-2">
                  <p class="text-lg font-medium leading-7 text-gray-700 dark:text-gray-100">
                    How does billing work?
                  </p>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    class="h-6 w-6 text-primary-ultradark"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
              </div>
              <div class="flex justify-between space-x-6 py-6">
                <div class="inline-flex flex-col items-start justify-start space-y-2">
                  <p class="text-lg font-medium leading-7 text-gray-700 dark:text-gray-100">
                    How do I change my account email?
                  </p>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    class="h-6 w-6 text-primary-ultradark"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
