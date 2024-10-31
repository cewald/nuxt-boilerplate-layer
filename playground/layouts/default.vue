<script setup lang="ts">
const mockSbNavi: SbComponentLinkInternal [] = [
  {
    _uid: '1',
    path: '/',
    title: 'Home',
    component: 'link_internal',
  },
  {
    _uid: '2',
    path: '/test',
    title: 'Test',
    component: 'link_internal',
  },
]
</script>

<template>
  <div>
    <HeaderNavigation :links="mockSbNavi" />
    <p>Some default layout content shared across all pages</p>
    <slot />
  </div>
</template>
