import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { formatDistanceToNow } from "date-fns";
import type { ApplicationSchema } from "~/model/applications";
import { ChevronRightIcon } from "../icons/chevronRightIcon";
import ProjectImage from "../projectImage";

type ApplicationsProps = {
  applications: ApplicationSchema[];
};

export default component$(({ applications = [] }: ApplicationsProps) => {
  const isEmpty = applications?.length === 0;
  return (
    <>
      {isEmpty ? (
        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Create your first application now and experience the power of
          efficient documentation.
        </p>
      ) : (
        <ol class="mt-6">
          {applications?.map((project, index) => (
            <Link href={`/applications/${project.id}`} key={project.id}>
              <li
                key={index}
                class="mx-3 flex gap-4 rounded-lg px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div class="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                  <ProjectImage
                    src={project.logo}
                    name={project?.name}
                    alt={`${project?.name} application`}
                  />
                </div>
                <dl class="flex flex-auto flex-wrap items-center gap-x-2">
                  <dt class="sr-only">Company</dt>
                  <div>
                    <dd class="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {project.name}
                    </dd>
                    <dt class="sr-only">Link</dt>
                    <dd class="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
                      Created on{" "}
                      {project.created_at &&
                        formatDistanceToNow(new Date(project.created_at), {
                          addSuffix: true,
                        })}
                    </dd>
                  </div>
                  <dt class="sr-only">Go to docs</dt>
                  <dd class="ml-auto text-xs text-zinc-400 dark:text-zinc-500">
                    <ChevronRightIcon styles="ml-1 h-5 w-5 stroke-current" />
                  </dd>
                </dl>
              </li>
            </Link>
          ))}
        </ol>
      )}
    </>
  );
});
