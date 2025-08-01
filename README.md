# @cewald/nuxt-boilerplate-layer

[![](https://github.com/cewald/nuxt-boilerplate-layer/actions/workflows/release.yml/badge.svg)](https://github.com/cewald/nuxt-boilerplate-layer/actions/workflows/release.yml)
[![](https://img.shields.io/npm/v/@cewald/nuxt-boilerplate-layer/latest.svg)](https://npmjs.com/package/@cewald/nuxt-boilerplate-layer)
[![](https://img.shields.io/npm/dt/@cewald/nuxt-boilerplate-layer.svg)](https://npmjs.com/package/@cewald/nuxt-boilerplate-layer)

This is a personal-preference boilerplate for [Nuxt](https://nuxt.com/) projects which can be implement as a [Nuxt layer](https://nuxt.com/docs/getting-started/layers) into a plain project. It has a bunch of features and is published as a NPM package.

## Configs

You can set all configruations in your `nuxt.config.ts` over the `boilerplate` config-name. A full list of configurations, you can see in the `module/index.ts` of the [main local module](https://github.com/cewald/nuxt-boilerplate-layer/blob/main/src/modules/boilerplate/index.ts) of the boilerplate-layer.

## Features

### Installed modules

* `@nuxt/eslint`
* `@nuxtjs/fontaine`
* `@nuxtjs/google-fonts`
* `@nuxtjs/i18n` (optional)
* `@nuxtjs/tailwindcss` (optional)
* `nuxt-lodash`
* `@pinia/nuxt`
* `nuxt-svgo`

### Installed packages (peer-deps)

* `dayjs`
* `storyblok-js-client` (optional)
* `zod`
* `@vueuse/core`
* `gemoji`
* `@cewald/eslint-config`

### Composables

* `useScreen`: TailwindCSS based media-query helper which uses the project TW config
* `useDayJs`: `dayjs` lib composable
* `useHideWhileScrolling`: hide elements while scrolling is in progress
* `useLoadScript`: helper to load and init external scripts
* `useLocalizedRoute`: helper to modify and transform paths using `vue-i18n`
* `useValidation`: validate a set of refs using a `zod` schema
* `useModalStore`: store for modal-handling in combination with the `ModalWrapper` component
* `useDataCompliance`: composable to safe simple-data compliance values for compliance-dialogs
* `useScroller`: library to build accessible [scroller components](https://tailwindcss.com/docs/scroll-snap-type) using `scroll-snap-type`

### Components

* `AccordionWrapper`/`AccordionItem`: modular accordion component
* `ModalWrapper`: wrapper for a modal based on `useModalStore` store
* `FormHoneypotInput`: form-input for honey-pot-form validation

### Utils

* `cloneDeep`
* `randomBetween`
* `sample`
* `shuffle`
* `lazyloadPicture`: lazyload picture elements using intersection-observer
* `honeypot`: Return honeypot field name for form antispam

### TailwindCSS utilities

Those are custom TailwindCSS classes that are generated on behalf of your theme.  
Important: You have to reference the TailwindCSS config-file generated by Nuxt in the ESlint config.

* `text-clamp-base-2xl`: Clamp [utility based](https://www.marcbacon.com/understanding-clamp/) on the viewports and available font-sizes
* `scrollbar-hide`
* `stretch-full`/`stretch-full-reset`

### Storyblok

There are a lot functionalities around the Storyblok API and javascript SDK.

#### Typescript types auto-generation and -import

This module can automatically generate types from the components of your Storyblok space using their management API, which you then can use in your project for typesafety. You'll have to supply your space-id and oAuth token using the configs or environment variables.

#### Components

* `SbPictureComponent`: A component to serve `SbImage` images as they are stored in Storyblok
* `SbRichtextComponent`: A component to serve `SbRichtText` content from Storyblok

#### Stores

* `SbStoreFactory`: A one-line factory for typed Storyblok stores in your project
* `SbStoreUtilityFactory`: The utility-factory that `SbStoreFactory` is using, in case you need a more granular implementation of your store

#### Composables

* `useStoryblokApiStore`: Pinia store for an initialized `StoryblokClient`
* `useRichTextResolver`: Tooling to resolve structured-data Storyblok strings into HTML
* `useSbImage`: Composable for image calculations based in Storyblok images
* `useSbBridge`: Load Storyblok bridge as composable for Storyblok editor 

#### Utils

* `getSbImageOrientation`: get image orientation by Storyblok image object
* `isRichTextEmpty`: checks if a rich-text variable is possibly just an empty skeleton

#### Prerendering

If you are using prerendering for specific routes this module can automatically load content URLs of specific component-types from Storyblok and add them using `addPrerenderRoutes`.

#### Prerendering by build-hook

If you are using Netlify and want to automatically update your prerendered content, you can use a [Storyblok web-hook](https://www.storyblok.com/docs/guide/in-depth/webhooks) to trigger a build using a [Netlify build-hook](https://docs.netlify.com/configure-builds/build-hooks/). There are two config-params necessary for it: `netlifyBuildHookUrl` & `netlifyBuildHookSecret`. The `netlifyBuildHookSecret` is a random secret string to secure the URL from outside-calls and the `netlifyBuildHookUrl` is the URL of the Netlify build-hook we mentioned earlier. If you have configured those two params you can serve the `/api/storyblok/webhook/[your-secret]` endpoint as a webhook in Storyblok and a new build is triggered each time you save a story.

## Installation

1. Just install the package using your package manager:
   ```sh
   npm i -D @cewald/nuxt-boilerplate-layer
   ```
1. Add the layer to your `nuxt.config.ts`:
   ```ts
   export default defineNuxtConfig({
   extends: [ '@cewald/nuxt-boilerplate-layer' ],
   boilerplate: {
    // custom configs ...
   }
   //...
   })
   ```

---

## Troubleshooting

### Use global types as root generic type parameters of `defineProps`

If you want to use global types as root generic type parameters of `defineProps` like `defineProps<MyComponentProps>` Vue is going to drop an exception like: `ERROR  Pre-transform error: [@vue/compiler-sfc] Unresolvable type reference or unsupported built-in utility type`. This is a bug in Nuxt/Vue and made ticket in their tracker for it: https://github.com/nuxt/nuxt/issues/29757

Until it is solved, you can bypass this problem by using this syntax:
```js
const { propType } = defineProps<{ propType: MyGlobalPropType }>()
```

---

## Development

You can create a `/playground` folder, where you mount or checkout your project you want to test.

If you want to use it in devcontainer, uncomment the `mount` configuration in the `.devcontainer/devcontainer.json` file, replace the path you want to mount and rebuild your container.

In your target project you now have to replace the boilerplate-module path to `../`. 

Now run `npm run dev` and your playground-project is using the current nuxt-boilerplate.

---

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).