<script setup>
import { useFormatters } from '../../composables/useFormatters.js'
import { toCents } from '../../utils/currency.js'
import CircleCheckIcon from './CircleCheckIcon.vue'

defineProps({
  ticket: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

const { priceShort } = useFormatters()
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="selected"
    class="flex flex-1 flex-col items-start gap-3 rounded-m p-5 text-left shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08),0px_1px_3px_0px_rgba(0,0,0,0.04)] transition-colors"
    :class="
      selected
        ? 'border-2 border-brand-emphasis bg-brand-subtle-rest'
        : 'border border-neutral-muted bg-surface-l1 hover:bg-neutral-subtle-hover'
    "
  >
    <span class="flex w-full items-center justify-between text-subtitle1 text-neutral">
      <span>{{ ticket.name }}</span>
      <span>{{ priceShort(toCents(ticket.price)) }}</span>
    </span>

    <span class="text-[12px] leading-4 text-neutral-muted">{{ ticket.description }}</span>

    <span v-for="perk in ticket.perks" :key="perk" class="flex w-full items-center gap-2">
      <CircleCheckIcon class="size-3.5 shrink-0 text-neutral" />
      <span class="text-[12px] leading-4 text-neutral-muted">{{ perk }}</span>
    </span>

    <span
      v-if="selected"
      class="rounded-full bg-success-bold-rest px-[9px] py-[3px] text-[11px] leading-[14px] font-medium text-inverse"
    >
      <span aria-hidden="true">✓</span>
      {{ $t('step1.selected') }}
    </span>
  </button>
</template>
