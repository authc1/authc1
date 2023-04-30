import { component$ } from "@builder.io/qwik";
import type { ActionStore, FailReturn } from "@builder.io/qwik-city";
import { Link, useLocation } from "@builder.io/qwik-city";
import { NavLink } from "../footer";
import UserDropdown from "../user-dropdown/user-dropdown";

export const authenticatedNavigation = [
  { label: "Dashboard", href: "/dashboard" },
];

export const unAuthenticatedNavigation = [
  {
    label: "Documentation",
    href: "/docs",
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
];

interface Props {
  isLoggedIn: boolean;
  userName: string;
  email: string;
  logoutAction: ActionStore<
    FailReturn<{ message: string }>,
    Record<string, any>,
    true
  >;
}

export default component$(
  ({ isLoggedIn, logoutAction, userName, email }: Props) => {
    const loc = useLocation();
    const { url } = loc;
    const { pathname } = url;
    const navigationOptions = isLoggedIn
      ? authenticatedNavigation
      : unAuthenticatedNavigation;
    return (
      <header class="flex items-center justify-between p-4 border-b border-gray-900/10 dark:border-gray-300/10">
        <Link href="/">
          <div class="flex items-center">
            <img
              src="/logo/authc1-logo.svg"
              alt="AuthC1 Logo"
              class="w-12 h-12"
            />
          </div>
        </Link>
        <nav class="flex items-center">
          <div class="flex flex-wrap gap-6 text-sm font-medium text-zinc-800 dark:text-zinc-200 mr-8">
            {navigationOptions.map((nav) => (
              <NavLink
                href={nav.href}
                key={nav.href}
                isActive={pathname === nav.href}
              >
                {nav.label}
              </NavLink>
            ))}
          </div>
          {isLoggedIn ? (
            <UserDropdown
              options={unAuthenticatedNavigation}
              logoutAction={logoutAction}
              userName={userName}
              email={email}
            />
          ) : (
            <Link
              class="group flex items-center rounded-full bg-zinc-800/90 px-4 py-2 text-xs font-medium text-zinc-50 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur whitespace-nowrap transition hover:bg-zinc-600 dark:bg-zinc-100 dark:text-zinc-800 dark:ring-white/10 dark:hover:bg-zinc-200 sm:text-sm"
              href="/login"
            >
              Login
            </Link>
          )}
        </nav>
      </header>
    );
  }
);
