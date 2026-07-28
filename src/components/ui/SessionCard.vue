<script setup>
import { computed } from 'vue'
import { useFormatters } from '../../composables/useFormatters.js'
import { isSoldOut } from '../../utils/capacity.js'
import CapacityBar from './CapacityBar.vue'
import TrackBadge from './TrackBadge.vue'

const props = defineProps({
  session: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  conflicted: { type: Boolean, default: false },
})

defineEmits(['toggle'])

const { timeRange } = useFormatters()

// The design never draws a sold-out card; the greyed treatment is borrowed. See PLAN.md §3.
const soldOut = computed(() => isSoldOut(props.session))

const textClass = computed(() => (soldOut.value ? 'text-neutral-disabled' : null))
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="selected"
    :aria-disabled="soldOut || undefined"
    class="flex flex-col gap-2 rounded-m p-4 text-left transition-[background-color,box-shadow] duration-150"
    :class="[
      soldOut
        ? 'card-edge cursor-not-allowed bg-surface-l2'
        : conflicted
          ? 'card-edge-danger bg-danger-subtle-rest'
          : selected
            ? 'card-edge-selected bg-brand-subtle-rest'
            : 'card-edge bg-surface-l0 hover:bg-neutral-quiet-hover',
    ]"
    @click="soldOut || $emit('toggle', session.id)"
  >
    <span class="flex items-start justify-between gap-2">
      <TrackBadge :track="session.track" :muted="soldOut" />

      <span
        v-if="!soldOut"
        class="flex size-4 shrink-0 items-center justify-center rounded-xs border transition-colors"
        :class="
          selected
            ? 'border-brand-emphasis bg-brand-emphasis-rest text-inverse'
            : 'border-neutral-emphasis bg-surface-l0'
        "
      >
        <svg v-if="selected" viewBox="0 0 16 16" class="size-3" fill="none" aria-hidden="true">
          <path
            d="M3 8.5L6.5 12L13 4.5"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </span>

    <span class="text-subtitle1" :class="textClass ?? 'text-neutral'">{{ session.title }}</span>

    <span class="text-sm leading-4" :class="textClass ?? 'text-neutral-muted'">
      {{ session.speaker }}, {{ session.speakerTitle }}
    </span>

    <span class="text-[11px] leading-[14px]" :class="textClass ?? 'text-neutral-quiet'">
      {{ timeRange(session.date, session.endDate) }}
    </span>

    <CapacityBar :record="session" />
  </button>
</template>
