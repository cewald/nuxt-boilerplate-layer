import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import type { ThemeConfig } from 'tailwindcss/types/config'

const config: Config = {
  content: [ './src/**/*.{vue,js,ts,jsx,tsx,scss}' ],
  plugins: [
    /**
     * Add custom basic utilities
     */
    plugin(({ addUtilities }) => {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.stretch-full': {
          'margin-left': 'calc(-50vw + 50%)',
          'margin-right': 'calc(-50vw + 50%)',
        },
        '.stretch-full-reset': {
          'margin-left': 'auto',
          'margin-right': 'auto',
        },
      })
    }),

    /**
     * Add text-clamp-* utility
     * Based on: https://www.marcbacon.com/understanding-clamp/
     */
    plugin(({ matchUtilities, theme }) => {
      const toRem = (value: string) => {
        const unit = value.replace(/\d|\./g, '')
        if (unit === 'rem') {
          return parseFloat(value)
        } else if (unit === 'px') {
          return parseFloat(value) / 16
        } else {
          console.warn(`Unknown unit: ${unit} in ${value}`)
          return parseFloat(value)
        }
      }

      const screens = theme('screens') as Record<string, string>
      const screensRange = Object.entries(screens)
        .map(([ key, value ]) => ({ value, key }))
        .sort((a, b) => toRem(a.value) - toRem(b.value))
        .reduce((acc, cur, i, arr) => {
          acc = [ toRem(arr[0].value), toRem(arr[arr.length - 1].value) ]
          return acc
        }, [] as unknown as [ min: number, max: number ])

      const fontSizes = Object.entries(theme('fontSize') as ThemeConfig['fontSize'])
      const values = fontSizes.reduce((acc, [ key, value ]) => {
        const pickVal = (value: ThemeConfig['fontSize']) => Array.isArray(value) ? value[0] : value
        fontSizes.forEach(([ subKey, subValue ]) => {
          if (key === subKey) return
          acc[`${key}-${subKey}`] = [ pickVal(value), pickVal(subValue) ]
        })
        return acc
      }, {} as Record<string, [ key: string, subKey: string]>)

      matchUtilities(
        {
          'text-clamp': v => {
            if (typeof v === 'string') {
              v = v.split(',', 2) as [ key: string, subKey: string]
            }

            const minF = toRem(v[0])
            const maxF = toRem(v[1])
            const minV = screensRange[0]
            const maxV = screensRange[1]

            const s = (maxF - minF) / (maxV - minV)
            const b = -screensRange[0] * s + minF

            return {
              fontSize: `clamp(${v[0]}, ${b.toFixed(2)}rem + ${(s * 100).toFixed(2)}vw, ${v[1]})`,
            }
          },
        },
        { values }
      )
    }),
  ],
}

export default config
