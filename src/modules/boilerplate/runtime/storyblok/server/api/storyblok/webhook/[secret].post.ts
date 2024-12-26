import { z } from 'zod'

const SbWebHook = z.object({
  text: z.string(),
  action: z.enum([ 'published', 'unpublished', 'deleted', 'moved' ]),
  space_id: z.number(),
  story_id: z.number(),
  full_slug: z.string(),
})

export default defineEventHandler(async event => {
  const config = useRuntimeConfig(event)
  const { netlifyBuildHookSecret, netlifyBuildHookUrl } = config.app
  const requestSecret = getRouterParam(event, 'secret')

  if (!requestSecret || !netlifyBuildHookSecret || requestSecret !== netlifyBuildHookSecret) {
    return createError({ statusMessage: 'Invalid secret', status: 403 })
  }

  const result = await readValidatedBody(event, body => SbWebHook.safeParse(body))
  if (result.error) {
    return createError({ statusMessage: 'Invalid request body', status: 500, data: result.error })
  }

  if (!netlifyBuildHookUrl) {
    return createError({ statusMessage: 'Netlify build hook URL not configured', status: 500 })
  }

  return $fetch(netlifyBuildHookUrl, { method: 'POST' })
    .then(data => ({ message: 'Success', storyblokWebhook: result.data, buildHook: data || 'Success' }))
})
