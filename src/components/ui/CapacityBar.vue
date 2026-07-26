<script setup>
import { computed } from 'vue'
import {
  CAPACITY_BAND,
  capacityBand,
  fillPercent,
  isSoldOut,
  remainingSpots,
} from '../../utils/capacity.js'

const props = defineProps({
  record: { type: Object, required: true },
})

const BAR_CLASSES = {
  [CAPACITY_BAND.LOW]: 'bg-brand-emphasis-rest',
  [CAPACITY_BAND.MEDIUM]: 'bg-warning-bold-rest',
  [CAPACITY_BAND.HIGH]: 'bg-accent-bold-rest',
  [CAPACITY_BAND.FULL]: 'bg-danger-emphasis-rest',
}

// Figma fills these labels with orange/700 and text/brand/emphasis (#A13B02, #264D4F). Neither
// value exists in the starter's semantic text scale — its --text-brand-emphasis is #1E3C3E — so
// these use palette utilities, which are still theme-backed rather than literal hex.
const LABEL_CLASSES = {
  [CAPACITY_BAND.LOW]: 'text-teal-700',
  [CAPACITY_BAND.MEDIUM]: 'text-warning-default',
  [CAPACITY_BAND.HIGH]: 'text-orange-700',
  [CAPACITY_BAND.FULL]: 'text-neutral',
}

const band = computed(() => capacityBand(props.record))
const percent = computed(() => fillPercent(props.record))
const soldOut = computed(() => isSoldOut(props.record))
const remaining = computed(() => remainingSpots(props.record))
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div class="h-1.5 w-full overflow-hidden rounded-full bg-surface-l2">
      <div
        class="h-full rounded-full transition-all"
        :class="BAR_CLASSES[band]"
        :style="{ width: `${percent}%` }"
      />
    </div>

    <p class="text-[11px] leading-[14px] font-medium" :class="LABEL_CLASSES[band]">
      {{ soldOut ? $t('capacity.soldOut') : $t('capacity.spotsLeft', { count: remaining }) }}
    </p>
  </div>
</template>
