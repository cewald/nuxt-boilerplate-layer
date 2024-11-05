# @cewald/nuxt-boilerplate

[![](https://github.com/cewald/nuxt-boilerplate/actions/workflows/release.yml/badge.svg)](https://github.com/cewald/nuxt-boilerplate/actions/workflows/release.yml)
[![](https://img.shields.io/npm/v/@cewald/nuxt-boilerplate/latest.svg)](https://npmjs.com/package/@cewald/nuxt-boilerplate)
[![](https://img.shields.io/npm/dt/@cewald/nuxt-boilerplate.svg)](https://npmjs.com/package/@cewald/nuxt-boilerplate)

– More infos are following.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

---

## Troubleshooting

### Use global types as root generic type parameters of `defineProps`

If you want to use global types as root generic type parameters of `defineProps` like `defineProps<MyComponentProps>` Vue is going to drop an exception like: `ERROR  Pre-transform error: [@vue/compiler-sfc] Unresolvable type reference or unsupported built-in utility type`. This is a bug in Nuxt/Vue and made ticket in their tracker for it: https://github.com/nuxt/nuxt/issues/29757

Until it is solved, you can bypass this problem by using this syntax:
```js
const { propType } = defineProps<{ propType: MyGlobalPropType }>()
```
