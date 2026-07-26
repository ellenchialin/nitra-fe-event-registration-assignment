<script setup>
defineProps({
  tabs: { type: Array, required: true },
  ariaLabel: { type: String, default: undefined },
})

const model = defineModel({ type: String, default: '' })
</script>

<template>
  <div
    role="tablist"
    :aria-label="ariaLabel"
    class="flex w-fit shrink-0 gap-1 self-start rounded bg-surface-l2 p-1"
  >
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="model === tab.value"
      class="rounded-[8px] px-5 py-2 text-[13px] leading-4 font-semibold transition-colors"
      :class="
        model === tab.value
          ? 'bg-brand-emphasis-rest text-inverse'
          : 'text-neutral-muted hover:text-neutral'
      "
      @click="model = tab.value"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
