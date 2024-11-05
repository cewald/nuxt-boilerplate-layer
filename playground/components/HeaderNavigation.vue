<template>
  <div>
    <NuxtLinkLocale to="/">
      Home
    </NuxtLinkLocale> |
    <NuxtLinkLocale to="/test">
      Test
    </NuxtLinkLocale> |
    <SwitchLocalePathLink locale="de">
      German
    </SwitchLocalePathLink> |
    <SwitchLocalePathLink locale="en">
      English
    </SwitchLocalePathLink>
  </div>
</template>
