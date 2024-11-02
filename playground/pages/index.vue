<script setup lang="ts">
const image: SbImage = {
  id: 17715625,
  alt: '',
  name: '',
  focus: '',
  title: '',
  source: '',
  filename: 'https://a.storyblok.com/f/272238/2160x2700/0305900bf3/zeichenflache-1-kopie-14-2x.png',
  copyright: '',
  fieldtype: 'asset',
  meta_data: {},
  is_external_url: false,
}

const richtText: SbRichText = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          text: 'Für Uni Leipzig international haben wir ein frisches Erscheinungsbild entwickelt,'
            + 'das sich am bestehenden Corporate Design der Universität orientiert – mit einem modernen Twist,'
            + ' um internationalen Studierenden Lust auf das Leben und den Austausch in Leipzig zu machen. ',
          type: 'text',
        },
      ],
    },
  ],
}
</script>

<template>
  <div>
    {{ $t('welcome') }}
    <SbRichtextComponent :content="richtText" />
    <SbPictureComponent
      :sb-image="image"
      :alt="image.alt"
      :lazyload="true"
      :preload="true"
    />
  </div>
</template>
