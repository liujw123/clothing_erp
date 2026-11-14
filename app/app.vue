<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'zh-CN' },
  title: '服装外贸 ERP'
})
</script>

<template>
  <UApp :toaster="{ position: 'bottom-left', class: 'sm:w-72' }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
