import StoryblokClient from 'storyblok-js-client'

export const clientFactory = (accessToken: string) =>
  new StoryblokClient({
    accessToken,
    cache: { type: 'memory', clear: 'auto' },
  })

export default clientFactory
