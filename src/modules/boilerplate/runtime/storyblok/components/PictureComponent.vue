<script setup lang="ts">
import { useHead } from 'unhead'

const {
  sbImage,
  sbImagePortrait,
  breakpoints = [],
  preload = true,
  lazyload = false,
  portraitCropRatio,
  portraitMediaQuery: portraitMediaQueryProp,
  sizes = '100w',
  imgClass = '',
  title,
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
}>()

const { breakpoints: defaultBreakpoints, getMediaQuery } = useScreens()

const picture = ref<HTMLPictureElement | null>(null)
const portraitMediaQuery = portraitMediaQueryProp || getMediaQuery('md', 'max')

const filenameRegExp = (file: SbImage) => {
  const regex = /storyblok.com\/\w\/(?<id>\d+)\/(?<sizes>\d+x\d+)\/(\w+)(?<path>.*)$/m
  return regex.exec(file.filename)?.groups as { id: string, sizes: string, path: string } || null
}

const getFileDimenstions = (file: SbImage) => {
  const split = filenameRegExp(file)?.sizes.split('x')
  return { width: parseInt(split[0] || '0'), height: parseInt(split[1] || '0') }
}

const isSVG = (file: SbImage) => /\.svg$/.test(file.filename)

const hasPortraitImage = computed(() => !!sbImagePortrait
  && !!sbImagePortrait.id && sbImagePortrait.filename !== sbImage.filename)

const orgSize = computed(() => getFileDimenstions(sbImage))
const size = computed(() => orgSize.value)
const portraitSize = computed(() => hasPortraitImage.value && sbImagePortrait
  ? getFileDimenstions(sbImagePortrait)
  : getRatio(0, orgSize.value.height, portraitCropRatio || `${size.value.width}:${size.value.height}`))

const getPath = (width: number = 0, height: number = 0, image = sbImage) => {
  if (isSVG(image)) return image.filename
  return `${image.filename}/m/${width}x${height}`
}

const getRatio = (width: number = 0, height: number = 0, ratio: string) => {
  const [ oWidth, oHeight ] = ratio.split(':').map(n => parseInt(n))
  if (width === 0 && height === 0) return { width: oWidth, height: oHeight }
  if (height === 0 && width > 0) {
    return { width, height: Math.round((width / oWidth) * oHeight) }
  } else if (width === 0 && height > 0) {
    return { width: Math.round((height / oHeight) * oWidth), height }
  }
  return { width, height }
}

const breakpointValues = computed(() => {
  return [ 210, 480, ...defaultBreakpoints.value, ...breakpoints ]
    .sort((a, b) => a - b)
})

const createSrcSet = (image: SbImage, dWidth: number, dRatio?: string) => {
  return breakpointValues.value
    .map(width => {
      if (width > dWidth) width = dWidth
      if (!dRatio) return { path: getPath(width, undefined, image), width }
      const { height } = getRatio(width, 0, dRatio)
      return { path: getPath(width, height), width }
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
    + `${Math.ceil(width * 0.01)}x0/filters:quality(10):blur(10)`
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

const description = computed(() => title || sbImage.name || sbImage.alt || sbImage.title)
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
      :class="imgClass || 'w-full max-w-full text-transparent'"
      :alt="description"
      :aria-label="description"
    >
  </picture>
</template>
