<script setup lang="ts">
const model = defineModel<undefined>()
</script>

<template>
  <div class="relative">
    <input
      v-model="model"
      :name="hpFieldName"
      type="text"
      class="invisible absolute left-0 top-0"
      aria-hidden="true"
      autocomplete="off"
      tabindex="-1"
    >
  </div>
</template>
