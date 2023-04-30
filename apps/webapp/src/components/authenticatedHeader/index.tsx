import { component$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { NavLink } from "../footer";

export const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Documentation",
    href: "/docs",
  },
];

export default component$(() => {
  const loc = useLocation();
  const { url } = loc;
  const { pathname } = url;
  return (
    <header class="flex items-center justify-between p-4 bg-white border-b">
      <Link href="/dashboard">
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
          {navigation.map((nav) => (
            <NavLink
              href={nav.href}
              key={nav.href}
              isActive={pathname.includes(nav.href)}
            >
              {nav.name}
            </NavLink>
          ))}
        </div>
        <Link
          class="group flex items-center rounded-full bg-zinc-800/90 px-4 py-2 text-xs font-medium text-zinc-50 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur whitespace-nowrap transition hover:bg-zinc-600 dark:bg-zinc-100 dark:text-zinc-800 dark:ring-white/10 dark:hover:bg-zinc-200 sm:text-sm"
          href="/logout"
        >
          Logout
        </Link>
      </nav>
    </header>
  );
});
