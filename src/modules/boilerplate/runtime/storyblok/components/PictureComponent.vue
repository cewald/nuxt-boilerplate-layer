<script setup lang="ts">
const {
  sbImage,
  sbImagePortrait,
  breakpoints = [],
  preload = true,
  lazyload = false,
  portraitCropRatio,
  portraitMediaQuery: portraitMediaQueryProp,
  sizes = '100vw',
  imgClass = '',
  title,
  alt,
  quality = 75,
  format = 'webp',
  previewImageScale = 0.01,
} = defineProps<{
  sbImage: SbImage
  sbImagePortrait?: SbImage
  breakpoints?: number[]
  preload?: boolean
  lazyload?: boolean
  portraitMediaQuery?: string
  portraitCropRatio?: string
  sizes?: string
  imgClass?: string
  title?: string
  alt?: string
  quality?: number
  format?: string
  previewImageScale?: number
}>()

const { breakpoints: defaultBreakpoints, getMediaQuery } = useScreens()

const picture = ref<HTMLPictureElement | null>(null)
const portraitMediaQuery = portraitMediaQueryProp || getMediaQuery('md', 'max')

const { getFileDimenstions, getPath, getRatio } = useSbImage()

const hasPortraitImage = computed(() => !!sbImagePortrait
  && !!sbImagePortrait.id && sbImagePortrait.filename !== sbImage.filename)

const orgSize = computed(() => getFileDimenstions(sbImage))
const size = computed(() => orgSize.value)
const portraitSize = computed(() => hasPortraitImage.value && sbImagePortrait
  ? getFileDimenstions(sbImagePortrait)
  : getRatio(0, orgSize.value.height, portraitCropRatio || `${size.value.width}:${size.value.height}`))

const breakpointValues = computed(() => {
  return [ 210, 480, ...defaultBreakpoints.value, ...breakpoints ]
    .sort((a, b) => a - b)
})

const createSrcSet = (image: SbImage, dWidth: number, dRatio?: string) => {
  return breakpointValues.value
    .map(width => {
      if (width > dWidth) width = dWidth
      if (!dRatio) return { path: getPath(width, undefined, image, format, quality), width }
      const { height } = getRatio(width, 0, dRatio)
      return { path: getPath(width, height, sbImage, format, quality), width }
    })
    .filter((b, i, arr) => arr.findIndex(a => a.path === b.path) === i)
    .map(b => `${b.path} ${b.width}w`)
    .join(', ')
}

const srcset = computed(() =>
  createSrcSet(sbImage, size.value.width))

const portraitSrcset = computed(() => {
  if (hasPortraitImage.value && sbImagePortrait) {
    return createSrcSet(sbImagePortrait, portraitSize.value.width)
  }
  return createSrcSet(sbImage, portraitSize.value.width, portraitCropRatio)
})

const mediaQuery = computed(() => {
  const regex = /^(\()(max|min)(-\w+:\s)(\d+)(\w+\))$/mg
  const results = regex.exec(portraitMediaQuery)
  if (!results) return undefined
  const size = parseInt(results[4]) + 1
  const minMax = results[2] === 'max' ? 'min' : results[2]
  return portraitMediaQuery.replace(regex, `$1${minMax}$3${size}$5`)
})

const previewImage = computed(() => {
  const { width } = size.value
  return sbImage.filename + '/m/'
    + `${Math.ceil(width * previewImageScale)}x0/filters:quality(10):blur(10)`
})

onBeforeMount(() => {
  useHead({
    link: [
      { key: 'preconnect-sb', rel: 'preconnect', href: 'https://a.storyblok.com' },
    ],
  })

  if (preload) {
    if (!!portraitCropRatio || hasPortraitImage.value === true) {
      useHead({
        link: [
          {
            rel: 'preload',
            as: 'image',
            imagesrcset: portraitSrcset.value,
            media: portraitMediaQuery,
            imagesizes: sizes,
          },
          {
            rel: 'preload',
            href: sbImage.filename + '/m/',
            as: 'image',
            imagesrcset: srcset.value,
            media: mediaQuery.value,
            imagesizes: sizes,
          },
        ],
      })
    } else {
      useHead({
        link: [
          { rel: 'preload',
            href: sbImage.filename + '/m/',
            as: 'image',
            imagesrcset: srcset.value,
            imagesizes: sizes,
          },
        ],
      })
    }
  }
})

onMounted(() => {
  if (!lazyload) return
  lazyloadPicture(picture.value as HTMLPictureElement)
})

const description = computed(() => alt || sbImage.name || sbImage.alt)
</script>

<template>
  <picture ref="picture">
    <source
      v-if="!!portraitCropRatio || hasPortraitImage"
      v-bind="{
        [`${!!lazyload ? 'data-' : ''}srcset`]: portraitSrcset,
      }"
      :sizes="sizes"
      :media="portraitMediaQuery"
      :width="portraitSize.width"
      :height="portraitSize.height"
    >
    <img
      v-bind="{
        src: !!lazyload ? previewImage : undefined,
        [`${!!lazyload ? 'data-' : ''}src`]: sbImage.filename + '/m/',
        [`${!!lazyload ? 'data-' : ''}srcset`]: srcset,
      }"
      :sizes="sizes"
      :width="size.width"
      :height="size.height"
      :class="imgClass || 'max-w-full text-transparent'"
      :alt="description"
      :aria-label="description"
      :title="title || sbImage.title"
    >
  </picture>
</template>
