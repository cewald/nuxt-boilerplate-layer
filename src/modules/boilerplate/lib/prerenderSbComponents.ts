import { addPrerenderRoutes } from '@nuxt/kit'
import StoryblokClient from 'storyblok-js-client'
import type { ModuleOptions } from '../'

export const prerenderSbPages = async (options: ModuleOptions) => {
  if (!options?.storyblok || !options?.storyblok?.prerender) return
  const { components, aliasMap } = options.storyblok.prerender

  const api = new StoryblokClient({
    accessToken: options.storyblok.apiKey,
    cache: { type: 'memory', clear: 'auto' },
  })

  const requestDefaults = {
    version: import.meta.env.DEV === true ? 'draft' : 'published',
    cv: Date.now(),
  }

  const routes: string[] = await api.getStories({
    ...requestDefaults as unknown as Record<string, unknown>,
  }).then(resp => {
    return resp.data.stories
      .filter(s => components.includes(s.content.component as string))
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
