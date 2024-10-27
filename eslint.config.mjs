import config from '@cewald/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

const corporateConfig = config({ tailwindcss: true, initStylistic: false })
export default withNuxt(corporateConfig)
