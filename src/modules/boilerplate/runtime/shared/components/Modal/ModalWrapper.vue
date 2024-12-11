<script lang="ts" setup>
import type { Component } from 'vue'

const { mid: id, component, scrollLock = true, teleportTo = '#layout' } = defineProps<{
  mid: string
  component: Component
  componentBindings?: object
  scrollLock?: boolean
  teleportTo?: string
}>()

const modalStore = useModalStore()
const { current } = storeToRefs(modalStore)
const { add } = modalStore

onMounted(() => {
  add({ id, component, scrollLock })
})
</script>

<template>
  <Suspense v-if="current?.id === id">
    <template #default>
      <Teleport :to="teleportTo">
        <component
          :is="component"
          v-bind="componentBindings"
          :id="id"
          role="dialog"
          aria-modal="true"
        />
      </Teleport>
    </template>
  </Suspense>
</template>
