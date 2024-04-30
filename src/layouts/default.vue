<script setup lang="ts">
const head = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true,
})

useHead({
  htmlAttrs: {
    lang: head.value.htmlAttrs!.lang,
    dir: head.value.htmlAttrs!.dir,
  },
  link: [
    ...(head.value.link || []),
  ],
  title: 'Index',
  titleTemplate: titleChunk => {
    const suffix = import.meta.env.VITE_APP_TITLE
    return titleChunk ? `${titleChunk} @ ${suffix}` : suffix
  },
  meta: [
    { name: 'description', content: 'In iaculis eget risus non hendrerit.' },
  ],
})
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-between px-4 py-12">
    <TopNavigation class="mb-8" />
    <div class="container mx-auto font-serif">
      <slot />
    </div>
    <LanguageSwitch class="mt-8" />
  </div>
</template>
