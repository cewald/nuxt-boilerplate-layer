import { defineNuxtModule, addPrerenderRoutes } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'prerender',
    configKey: 'prerender',
  },
  defaults: {
    src: 'https://dummyjson.com/quotes',
    urlKey: 'id',
  },
  async setup({ src, urlKey }) {
    const routes = await fetch(src)
      .then(async v => {
        const resp: {
          quotes: { quote: string, author: string, id: number }[]
        } = await v.json()
        if (!resp.quotes) return []
        return resp.quotes.map(q => `/${q[urlKey as 'id']}`).slice(0, 9)
      }).catch(e => {
        console.error(e)
        return []
      })

    addPrerenderRoutes(routes as string[])
  },
})
