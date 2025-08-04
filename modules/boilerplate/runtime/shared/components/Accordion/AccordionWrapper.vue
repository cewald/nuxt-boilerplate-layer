<script setup lang="ts">
const { uniqueNames = [], tag = 'ul' } = defineProps<{
  uniqueNames?: string[]
  tag?: string
}>()

const activeTab = ref<string>()
function handleToggle(value: boolean, uName: string) {
  if (value) activeTab.value = uName
  else activeTab.value = undefined
}
</script>

<template>
  <component :is="tag">
    <template
      v-for="(uname, index) in uniqueNames"
      :key="index"
    >
      <AccordionItem
        class="w-full"
        :u-name="uname"
        :open="uname === activeTab"
        @toggle="handleToggle"
      >
        <template #title>
          <slot
            name="title"
            :uname="uname"
            :index="index"
            :on-toggle="handleToggle"
            :active="activeTab === uname"
          />
        </template>
        <slot
          :uname="uname"
          :index="index"
        />
      </AccordionItem>
    </template>
  </component>
</template>
