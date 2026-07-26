<script setup>
import { computed } from 'vue'
import { useFormatters } from '../../composables/useFormatters.js'
import { isSoldOut, remainingSpots } from '../../utils/capacity.js'
import { toCents } from '../../utils/currency.js'

const props = defineProps({
  addon: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  unavailable: { type: Boolean, default: false },
  conflicts: { type: Array, default: () => [] },
})

defineEmits(['toggle'])

const { dayAndTimeRange, priceShort } = useFormatters()

const textClass = computed(() => (props.unavailable ? 'text-neutral-disabled' : null))
const conflictTitles = computed(() => props.conflicts.map((session) => session.title).join(', '))

const soldOut = computed(() => isSoldOut(props.addon))
const remaining = computed(() => remainingSpots(props.addon))

// Add-on cards state capacity in text/neutral/quiet rather than the banded colours session cards
// use — there is no bar here for the colour to belong to. "Sold Out" keeps full contrast.
const capacityClass = computed(() => {
  if (props.unavailable && !soldOut.value) return 'text-neutral-disabled'
  return soldOut.value ? 'text-neutral' : 'text-neutral-quiet'
})
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="selected"
    :aria-disabled="unavailable || undefined"
    class="flex flex-col gap-2 rounded-m p-4 text-left transition-[background-color,box-shadow] duration-150"
    :class="[
      unavailable
        ? 'card-edge cursor-not-allowed bg-surface-l2'
        : selected
          ? 'card-edge-selected bg-brand-subtle-rest'
          : 'card-edge bg-surface-l0 hover:bg-neutral-quiet-hover',
    ]"
    @click="unavailable || $emit('toggle', addon.id)"
  >
    <span class="flex items-start justify-between gap-4">
      <span class="text-subtitle1" :class="textClass ?? 'text-neutral'">{{ addon.name }}</span>
      <span class="text-subtitle1 shrink-0" :class="textClass ?? 'text-neutral'">
        {{ priceShort(toCents(addon.price)) }}
      </span>
    </span>

    <span class="text-sm" :class="textClass ?? 'text-neutral-muted'">{{ addon.description }}</span>

    <span
      v-if="addon.date"
      class="text-[11px] leading-[14px]"
      :class="textClass ?? 'text-neutral-quiet'"
    >
      {{ dayAndTimeRange(addon.date, addon.endDate) }}
    </span>

    <span
      v-if="addon.capacity"
      class="text-[11px] leading-[14px] font-medium"
      :class="capacityClass"
    >
      {{ soldOut ? $t('capacity.soldOut') : $t('capacity.spotsRemaining', { count: remaining }) }}
    </span>

    <span v-if="conflicts.length" class="text-[11px] leading-[14px] font-medium text-danger">
      {{ $t('step3.conflictsWith', { sessions: conflictTitles }) }}
    </span>
  </button>
</template>
