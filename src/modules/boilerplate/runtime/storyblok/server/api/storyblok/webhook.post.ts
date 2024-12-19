import { z } from 'zod'

const SbWebHook = z.object({
  text: z.string(),
  action: z.enum([ 'published', 'unpublished', 'deleted', 'moved' ]),
  space_id: z.number(),
  story_id: z.number(),
  full_slug: z.string(),
})

export default defineEventHandler(async event => {
  const result = await readValidatedBody(event, body => SbWebHook.safeParse(body))
  if (result.error) {
    return createError({ statusMessage: 'Invalid request body', status: 500, data: result.error })
  }

  const config = useRuntimeConfig(event)
  if (!config.app.netlifyBuildHookUrl) {
    return createError({ statusMessage: 'Netlify build hook URL not configured', status: 500 })
  }

  return $fetch(config.app.netlifyBuildHookUrl, { method: 'POST' })
    .then(data => ({ message: 'Success', storyblokWebhook: result.data, buildHook: data || 'Success' }))
})
