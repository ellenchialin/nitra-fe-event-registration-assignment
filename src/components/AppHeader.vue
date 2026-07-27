<script setup>
import { event } from '../mocks/event.js'
import BrandMark from './ui/BrandMark.vue'
import LocaleSwitcher from './ui/LocaleSwitcher.vue'
</script>

<template>
  <!-- Tracks the content column's gutter, capped at the design's 48px. A breakpoint cannot do
       this: between 1248px and 1296px the gutter slides from 24 to 48. `100%` not `100vw`, so a
       scrollbar cannot skew it. -->
  <header
    class="flex items-center gap-3 border-b divider-default bg-surface-l0 py-4 px-[clamp(24px,calc((100%-1200px)/2),48px)]"
  >
    <!-- 8px is a literal in Figma too; border-radius/* defines 2/6/10/12/full, with no 8. -->
    <div
      class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-brand-emphasis-rest text-inverse"
    >
      <BrandMark class="w-7" />
    </div>

    <!-- At h4 the event name wraps on a phone and pushes the header past the design's 73px. -->
    <p class="text-subtitle1 text-neutral tablet:text-h4">{{ event.name }}</p>

    <!-- Not in the design; see PLAN.md section 3. -->
    <LocaleSwitcher class="ml-auto" />
  </header>
</template>
