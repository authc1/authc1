import Head from 'next/head'
import { Router, useRouter } from 'next/router'
import { MDXProvider } from '@mdx-js/react'

import { Layout } from '@/components/Layout'
import * as mdxComponents from '@/components/mdx'
import { useMobileNavigationStore } from '@/components/MobileNavigation'

import '@/styles/tailwind.css'
import 'focus-visible'
import LayoutHome from '@/components/home/LayoutHome'
import {slugifyWithCounter} from "@sindresorhus/slugify";

function onRouteChange() {
  useMobileNavigationStore.getState().close()
}

Router.events.on('hashChangeStart', onRouteChange)
Router.events.on('routeChangeComplete', onRouteChange)
Router.events.on('routeChangeError', onRouteChange)

function getNodeText(node) {
  let text = ''
  for (let child of node.children ?? []) {
    if (typeof child === 'string') {
      text += child
    }
    text += getNodeText(child)
  }
  return text
}

function collectHeadings(nodes, slugify = slugifyWithCounter()) {
  let sections = []

  for (let node of nodes) {
    if (node.name === 'h2' || node.name === 'h3') {
      let title = getNodeText(node)
      if (title) {
        let id = slugify(title)
        node.attributes.id = id
        if (node.name === 'h3') {
          if (!sections[sections.length - 1]) {
            throw new Error(
              'Cannot add `h3` to table of contents without a preceding `h2`'
            )
          }
          sections[sections.length - 1].children.push({
            ...node.attributes,
            title,
          })
        } else {
          sections.push({ ...node.attributes, title, children: [] })
        }
      }
    }

    sections.push(...collectHeadings(node.children ?? [], slugify))
  }

  return sections
}

export default function App({ Component, pageProps }) {
  let router = useRouter()

  /**
   * Changement du path pour inclure le scope de la doc
   */
  if (router.pathname.startsWith('/')) {
    let title = pageProps.title

    let description = pageProps.markdoc?.frontmatter.description

    let tableOfContents = pageProps.markdoc?.content
      ? collectHeadings(pageProps.markdoc.content)
      : []

    return (
      <>
        <Head>
          {router.pathname === '/' ? (
            <title>Reforged API Reference</title>
          ) : (
            <title>{`${title} - Reforged API Reference`}</title>
          )}
          {description && <meta name="description" content={description} />}
        </Head>
        <MDXProvider components={mdxComponents} tableOfContents={tableOfContents}>
          <Layout {...pageProps}>
            <Component {...pageProps} />
          </Layout>
        </MDXProvider>
      </>
    )
  }

  /**
   * Création du router dans le LayoutHome à votre guise
   */
  return (
    <>
      <LayoutHome>
        <Component key={router.asPath} {...pageProps} />
      </LayoutHome>
    </>
  )
}
