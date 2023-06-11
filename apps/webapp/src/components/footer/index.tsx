import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

import { navigation } from "../authenticatedHeader";
import { GitHubIcon, TwitterIcon } from "../icons/socials";

export const NavLink = component$(({ href, isActive, target }: any) => {
  return (
    <Link
      href={href}
      class={
        isActive
          ? "text-primary active dark:text-primary"
          : "transition hover:text-primary dark:hover:text-light"
      }
      target={target}
    >
      <Slot />
    </Link>
  );
});

export const SocialLink = component$(({ ...props }: any) => {
  return (
    <Link class="group -m-1 p-1" {...props}>
      <div class="h-5 w-5 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300">
        <Slot />
      </div>
    </Link>
  );
});

export default component$(() => {
  return (
    <footer class="mt-32 p-4">
      <div>
        <div class="border-t border-zinc-100 pt-10 pb-16 dark:border-zinc-700/40">
          <div>
            <div class="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div class="flex gap-6">
                <SocialLink
                  href="https://github.com/subhendukundu/authc1"
                  aria-label="Follow on Twitter"
                >
                  <GitHubIcon />
                </SocialLink>
                <SocialLink
                  href="https://twitter.com/authc1_com"
                  aria-label="Follow on GitHub"
                >
                  <TwitterIcon />
                </SocialLink>
              </div>
              <div class="flex flex-wrap gap-6 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {navigation.map((nav) => (
                  <NavLink href={nav.href} key={`footer-${nav.href}`}>
                    {nav.name}
                  </NavLink>
                ))}
              </div>
              <p class="text-sm text-zinc-400 dark:text-zinc-500">
                &copy; {new Date().getFullYear()} AuthC1.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});
