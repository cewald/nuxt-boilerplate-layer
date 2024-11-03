import StoryblokClient from 'storyblok-js-client'

let api: StoryblokClient

export const useStoryblokApiStore = defineStore('storyblok', () => {
  const cv = ref<number>(Date.now())

  if (!api) {
    api = new StoryblokClient({
      accessToken: import.meta.env.VITE_STORYBLOK_ACCESS_TOKEN,
      cache: { type: 'memory', clear: 'auto' },
    })
  }

  const requestDefaults = computed<SbStoryParams>(() => ({
    version: import.meta.env.DEV === true ? 'draft' : 'published',
    cv: cv.value,
  }))

  return { api, requestDefaults, cv }
})

export const SbStoreUtilityFactory = <C = SbComponentType<string>>({
  path = '',
  items,
  notFound,
}: {
  path?: string
  items: Ref<SbStoryData<C>[]>
  notFound: Ref<string[]>
}) => {
  const { requestDefaults, api: sb, cv } = toRefs(useStoryblokApiStore())

  const load = async (params: SbStoriesParams = {}) => {
    return sb.value?.getStories({
      ...requestDefaults.value,
      cv: cv.value,
      starts_with: `${path}`,
      ...params,
    }).then(resp => {
      cv.value = resp?.data.cv
      items.value = (resp as SbStories<C>).data.stories
      return items.value
    })
  }

  const loadByKey = async (slug: string) => {
    const checkIfExists = items.value?.find(s => s.slug === slug)
    if (checkIfExists) return Promise.resolve(checkIfExists)

    const checkIfNotFound = notFound.value?.find(s => s === slug)
    if (checkIfNotFound) return Promise.reject(new Error('Not found'))

    return sb.value?.getStory(`${path}/${slug}`, {
      ...requestDefaults.value,
      cv: cv.value,
    }).then(resp => {
      cv.value = resp?.data.cv
      const story = (resp as SbStory<C>).data.story
      items.value?.push(story)
      return story
    }).catch(err => {
      if (err.status !== 404) {
        console.error('Storyblok returned and error:', JSON.stringify(err))
      }

      notFound.value?.push(slug)
      return Promise.reject(new Error('Not found'))
    })
  }

  return { load, loadByKey }
}
