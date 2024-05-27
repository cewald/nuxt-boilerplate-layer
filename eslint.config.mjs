import stylistic from '@stylistic/eslint-plugin'
import pluginTailwindCSS from 'eslint-plugin-tailwindcss'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  ...pluginTailwindCSS.configs['flat/recommended'],
  {
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/semi': [ 2, 'never' ],
      '@stylistic/indent': [ 'error', 2 ],
      '@stylistic/max-len': [ 'error', { code: 120 } ],
      '@stylistic/object-curly-spacing': [ 'error', 'always' ],
      '@stylistic/quotes': [ 2, 'single', { avoidEscape: true, allowTemplateLiterals: false } ],
      '@stylistic/arrow-parens': [ 'error', 'as-needed' ],
      '@stylistic/eol-last': [ 'error', 'always' ],
      '@stylistic/no-trailing-spaces': [ 'error' ],
      '@stylistic/brace-style': [ 'error', '1tbs', { allowSingleLine: true } ],
      '@stylistic/array-bracket-spacing': [ 'error', 'always' ],
    },
  },
])
