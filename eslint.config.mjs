// @ts-check
import stylistic from '@stylistic/eslint-plugin'
// @ts-expect-error
import pluginTailwindCSS from 'eslint-plugin-tailwindcss'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  /**
   * `eslint-plugin-tailwindcss` is not ported to the new eslint flat config syntax yet.
   * @see https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/335
   */
  {
    plugins: { tailwindcss: pluginTailwindCSS },
    rules: pluginTailwindCSS.configs.recommended.rules,
  },
  {
    // @ts-expect-error
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
