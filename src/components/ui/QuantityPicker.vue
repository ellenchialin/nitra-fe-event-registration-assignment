<script setup>
import { computed } from 'vue'

const props = defineProps({
  max: { type: Number, required: true },
  itemName: { type: String, required: true },
})

const quantity = defineModel({ type: Number, default: 0 })

const canDecrease = computed(() => quantity.value > 0)
const canIncrease = computed(() => quantity.value < props.max)

const STEP_CLASSES =
  'flex size-7 shrink-0 items-center justify-center rounded-m border border-neutral-muted bg-surface-l1 text-neutral transition-colors hover:bg-neutral-muted-hover disabled:cursor-not-allowed disabled:text-neutral-disabled disabled:hover:bg-surface-l1'
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-neutral-muted">{{ $t('step3.quantity') }}</span>

    <button
      type="button"
      :class="STEP_CLASSES"
      :disabled="!canDecrease"
      :aria-label="$t('step3.decreaseFor', { name: itemName })"
      @click="quantity -= 1"
    >
      <svg viewBox="0 0 12 12" class="size-3" fill="none" aria-hidden="true">
        <path d="M1 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>

    <output class="w-6 text-center text-sm font-semibold text-neutral">{{ quantity }}</output>

    <button
      type="button"
      :class="STEP_CLASSES"
      :disabled="!canIncrease"
      :aria-label="$t('step3.increaseFor', { name: itemName })"
      @click="quantity += 1"
    >
      <svg viewBox="0 0 12 12" class="size-3" fill="none" aria-hidden="true">
        <path d="M6 1V11M1 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>

    <span class="text-[10px] leading-3 text-neutral-quiet">
      {{ $t('step3.maxQuantity', { count: max }) }}
    </span>
  </div>
</template>
