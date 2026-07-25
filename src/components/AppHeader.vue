<script setup>
import { event } from '../mocks/event.js'
import BrandMark from './ui/BrandMark.vue'
</script>

<template>
  <header class="flex items-center gap-3 border-b divider-default bg-surface-l0 px-12 py-4">
    <!-- 8px is a literal in Figma too; border-radius/* defines 2/6/10/12/full, with no 8. -->
    <div
      class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-brand-emphasis-rest text-inverse"
    >
      <BrandMark class="w-7" />
    </div>

    <p class="text-h4 text-neutral">{{ event.name }}</p>
  </header>
</template>
