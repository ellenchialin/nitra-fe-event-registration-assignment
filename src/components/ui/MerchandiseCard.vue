<script setup>
import { computed } from 'vue'
import { useFormatters } from '../../composables/useFormatters.js'
import { toCents } from '../../utils/currency.js'
import QuantityPicker from './QuantityPicker.vue'
import SizeSelect from './SizeSelect.vue'

const props = defineProps({
  addon: { type: Object, required: true },
  selection: { type: Object, required: true },
})

const emit = defineEmits(['update:quantity', 'update:size'])

const { currency } = useFormatters()

const selected = computed(() => props.selection.quantity > 0)

// A sized item in the order without a size is incomplete. Saying so here, rather than only in the
// Step 4 error summary, puts the requirement on the control that satisfies it.
const needsSize = computed(
  () => selected.value && Boolean(props.addon.sizes?.length) && !props.selection.size,
)
</script>

<template>
  <div
    class="flex flex-col gap-2 rounded-m p-4 transition-[background-color,box-shadow] duration-150"
    :class="selected ? 'card-edge-selected bg-brand-subtle-rest' : 'card-edge bg-surface-l0'"
  >
    <div class="flex items-start justify-between gap-4">
      <h3 class="text-subtitle1 text-neutral">{{ addon.name }}</h3>
      <span class="text-subtitle1 shrink-0 text-neutral">
        {{ currency(toCents(addon.price)) }}
      </span>
    </div>

    <p class="text-sm text-neutral-muted">{{ addon.description }}</p>

    <div class="flex flex-wrap items-center gap-4">
      <SizeSelect
        v-if="addon.sizes"
        :model-value="selection.size ?? ''"
        :emphasis="needsSize"
        :sizes="addon.sizes"
        :item-name="addon.name"
        @update:model-value="emit('update:size', addon.id, $event || null)"
      />

      <QuantityPicker
        :model-value="selection.quantity"
        :max="addon.maxQuantity"
        :item-name="addon.name"
        @update:model-value="emit('update:quantity', addon.id, $event)"
      />
    </div>

    <p v-if="needsSize" class="text-[11px] leading-[14px] font-semibold text-warning-emphasis">
      {{ $t('step3.sizeRequired') }}
    </p>

    <p
      v-else-if="selected"
      class="flex items-center gap-1 text-[11px] leading-[14px] font-semibold text-success"
    >
      <svg viewBox="0 0 16 16" class="size-3 shrink-0" fill="none" aria-hidden="true">
        <path
          d="M3 8.5L6.5 12L13 4.5"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {{ $t('step3.addedToOrder') }}
    </p>
  </div>
</template>
