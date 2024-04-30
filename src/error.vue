<script setup lang="ts">
const err = useError() as unknown as Record<string, unknown>
</script>

<template>
  <NuxtLayout>
    <div class="text-center">
      <h1 class="mb-2 text-4xl lowercase">
        _{{ $t('Error: {statusCode}', { statusCode: err.statusCode }) }}
      </h1>
      <div>
        [ {{ err.message }} ]
      </div>
    </div>
  </NuxtLayout>
</template>
