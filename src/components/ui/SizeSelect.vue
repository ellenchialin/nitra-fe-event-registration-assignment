<script setup>
defineProps({
  sizes: { type: Array, required: true },
  itemName: { type: String, required: true },
})

const size = defineModel({ type: String, default: '' })
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-neutral-muted">{{ $t('step3.size') }}</span>

    <div class="relative">
      <select
        v-model="size"
        class="h-7 appearance-none rounded-m border border-neutral-muted bg-surface-l0 pl-3 pr-6 text-sm transition-colors hover:bg-neutral-quiet-hover"
        :class="size ? 'text-neutral' : 'text-neutral-quiet'"
        :aria-label="$t('step3.sizeFor', { name: itemName })"
      >
        <option value="">{{ $t('step3.selectSize') }}</option>
        <option v-for="option in sizes" :key="option" :value="option">{{ option }}</option>
      </select>

      <!-- The design draws a solid caret glyph, not a stroked chevron. -->
      <svg
        viewBox="0 0 6 4"
        class="pointer-events-none absolute right-3 top-1/2 w-1.5 -translate-y-1/2 text-neutral-quiet"
        aria-hidden="true"
      >
        <path d="M0 0H6L3 4Z" fill="currentColor" />
      </svg>
    </div>
  </div>
</template>
