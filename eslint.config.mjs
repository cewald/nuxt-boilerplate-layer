import config from '@cewald/eslint-config'
import withNuxt from './.nuxt/eslint.config.mjs'

const corporateConfig = config({ tailwindcss: true, initStylisticPlugin: false })
export default withNuxt(corporateConfig)
