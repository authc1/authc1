import { component$ } from "@builder.io/qwik";
import { One, Pages, Queues, Workers } from "../icons/cloudflare";

interface LogoDetails {
  icon: any;
  alt: string;
}

export const builtWithLogos: LogoDetails[] = [
  {
    icon: Workers,
    alt: "Cloudflare Workers logo",
  },
  {
    icon: Queues,
    alt: "Queues logo",
  },
  {
    icon: Pages,
    alt: "Pages logo",
  },
  {
    icon: One,
    alt: "Cloudflare Zero Trust",
  },
];

export default component$(() => {
  return (
    <div class="mt-10">
      <h2 class="text-xl font-medium mr-2 text-gray-800 dark:text-white">Built with:</h2>
      <div class="flex mt-4">
        {builtWithLogos.map(({ icon: Icon, alt }) => (
          <Icon key={alt} class="w-12 h-12 mr-4 text-gray-600 dark:text-gray-400 fill-current" />
        ))}
      </div>
    </div>
  );
});
