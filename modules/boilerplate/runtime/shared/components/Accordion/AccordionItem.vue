<script setup lang="ts">
const { uName, open = false, tag = 'li' } = defineProps<{
  uName: string
  open?: boolean
  tag?: string
}>()

const isOpen = ref(open)

function toggle() {
  isOpen.value = !isOpen.value
  emit('toggle', isOpen.value, uName)
}

watchEffect(() => {
  isOpen.value = open
})

const emit = defineEmits<{
  (event: 'toggle', value: boolean, uName: string): void
}>()
</script>

<template>
  <component
    :is="tag"
    class="group/a-item"
  >
    <div
      :id="`accordion-header-${uName}`"
      role="button"
      tabindex="0"
      :aria-expanded="isOpen"
      :aria-controls="`accordion-panel-${uName}`"
      @click="toggle()"
      @keydown.enter="toggle()"
    >
      <slot name="title" />
    </div>
    <div
      v-show="isOpen"
      :id="`accordion-panel-${uName}`"
      role="region"
      :aria-labelledby="`accordion-header-${uName}`"
    >
      <slot />
    </div>
  </component>
</template>
