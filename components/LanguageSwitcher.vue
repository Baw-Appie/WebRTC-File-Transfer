<template>
  <div class="flex items-center gap-2">
    <UButton
      v-for="locale in availableLocales"
      :key="locale.code"
      :variant="locale.code === $i18n.locale ? 'solid' : 'outline'"
      :color="locale.code === $i18n.locale ? 'primary' : 'gray'"
      size="sm"
      @click="switchLocale(locale.code)"
      class="min-w-0 px-2"
    >
      <span class="text-xs font-medium">{{ locale.name }}</span>
    </UButton>
  </div>
</template>

<script setup>
const { $i18n } = useNuxtApp()

const availableLocales = computed(() => {
  return $i18n.locales.value.filter(locale => locale.code !== $i18n.locale)
})

const switchLocale = (localeCode) => {
  $i18n.setLocale(localeCode)
}
</script>
