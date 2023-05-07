import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'

const guides = [
  {
    href: '/api-reference',
    name: 'API Reference',
    description: "Learn about the various endpoints available in our API.",
  },
  {
    href: '/implementation-guide',
    name: 'Implementation Guide',
    description:
      "Learn how to implement our API in your application.",
  },
  {
    href: '/webhooks',
    name: 'Webhooks',
    description:
      'This endpoint is used to receive notifications about events that occur in the Authc1 app. Use this to receive fast, automated callbacks.',
  },
]

export function Guides() {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="guides">
        Guides
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 dark:border-white/5 sm:grid-cols-2 xl:grid-cols-4">
        {guides.map((guide) => (
          <div key={guide.href}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {guide.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {guide.description}
            </p>
            <p className="mt-4">
              <Button href={guide.href} variant="text" arrow="right">
                Learn more
              </Button>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
