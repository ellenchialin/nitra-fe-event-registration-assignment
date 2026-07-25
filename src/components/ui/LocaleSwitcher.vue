<script setup>
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES } from '../../i18n/index.js'

const { locale } = useI18n()
</script>

<template>
  <select
    v-model="locale"
    :aria-label="$t('a11y.language')"
    class="rounded-m border border-neutral-muted bg-surface-l0 px-2 py-1 text-[14px] text-neutral-muted transition-colors hover:border-neutral-emphasis"
  >
    <option v-for="option in SUPPORTED_LOCALES" :key="option.code" :value="option.code">
      {{ option.label }}
    </option>
  </select>
</template>
