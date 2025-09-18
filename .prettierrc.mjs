import { prettier } from '@cewald/eslint-config/prettier'

export default prettier({
  tailwindcss: true,
  tailwindConfig: './.nuxt/tailwind/postcss.mjs',
})
