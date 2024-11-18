<script setup lang="ts">
const model = defineModel<undefined>()
</script>

<template>
  <input
    v-model="model"
    type="text"
    :name="hpFieldName"
    class="hidden"
  >
</template>
