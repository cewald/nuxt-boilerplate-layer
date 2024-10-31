import config from '@cewald/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

const corporateConfig = config({ tailwindcss: true, initStylisticPlugin: false })
export default withNuxt([ ...corporateConfig, {
  files: [
    'playground/app.{js,ts,jsx,tsx,vue}',
    'playground/components/*/**/*.{js,ts,jsx,tsx,vue}',
    'playground/error.{js,ts,jsx,tsx,vue}',
    'playground/layouts/**/*.{js,ts,jsx,tsx,vue}',
    'playground/pages/**/*.{js,ts,jsx,tsx,vue}',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
  },
} ])
