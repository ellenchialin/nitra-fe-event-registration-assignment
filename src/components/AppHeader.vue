<script setup>
import { event } from '../mocks/event.js'
import BrandMark from './ui/BrandMark.vue'
import LocaleSwitcher from './ui/LocaleSwitcher.vue'
</script>

<template>
  <!-- The design's 48px padding holds wherever there is room for it. Below that the header tracks
       the content column's own gutter — `(100% - 1200px) / 2`, floored at the 24px page gutter —
       so the two stay aligned. No single breakpoint does this: between 1248px and 1296px the
       column's gutter slides from 24 to 48, and a fixed padding would drift against it. The
       percentage resolves against the containing block rather than `100vw`, so a classic
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
