import { addPrerenderRoutes } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import type { ModuleOptions } from '../'
import { clientFactory } from './'

export const prerenderSbPages = async (options: ModuleOptions, nuxt: Nuxt) => {
  if (!options?.storyblok
    || !options?.storyblok?.prerender
    || !options.storyblok?.apiKey
    || options?.storyblok?.editor) {
    return
  }

  /**
   * If we want to enable prerendering we need to set `crawlLinks` to `true`.
   * Otherwise pages won't be crawled for links when we build the site using hybrig-mode of Nuxt.
   * We can't use just `npm run generate` if we want to use the app in hybrid mode or
   * SSR features like API routes wont be available due to just static serving. So if we
   * enable `crawlLinks` we still can use the app in hybrid mode and prerendered all linked pages.
   * @see https://nuxt.com/docs/getting-started/prerendering#selective-pre-rendering
   */
  if (!nuxt.options.nitro.prerender) {
    nuxt.options.nitro.prerender = { crawlLinks: true }
  } else {
    nuxt.options.nitro.prerender.crawlLinks = true
  }

  const { types, aliasMap } = options.storyblok.prerender
  const api = clientFactory(options.storyblok.apiKey)

  const requestDefaults = {
    version: import.meta.env.DEV === true ? 'draft' : 'published',
    cv: Date.now(),
  }

  const routes: string[] = await api.getStories({
    ...requestDefaults as unknown as Record<string, unknown>,
  }).then(resp => {
    return resp.data.stories
      .filter(s => types.includes(s.content.component as string))
      .map(s => `/${s.full_slug}`)
  }).catch(e => {
    console.error(e)
    return []
  })

  /**
   * `addPrerenderRoutes` ignores route aliases
   * so we need to add them manually
   */
  routes.forEach(r => {
    for (const route in aliasMap) {
      if (r.startsWith(route)) {
        aliasMap[route].forEach(alias => {
          routes.push(r.replace(route, alias))
        })
      }
    }
  })

  addPrerenderRoutes(routes as string[])
}

export default prerenderSbPages
