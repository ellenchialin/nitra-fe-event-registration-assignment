<script setup>
import { useFormatters } from '../../composables/useFormatters.js'
import { WORKSHOP_DISCOUNT_PERCENT, usePricing } from '../../composables/usePricing.js'

const { ticketType, ticketCents, addonLines, workshopDiscountCents, totalCents } = usePricing()

const { currency } = useFormatters()
</script>

<template>
  <aside class="flex flex-col gap-4 rounded-m border border-neutral-muted bg-surface-l1 p-6">
    <h3 class="text-subtitle1 text-neutral">{{ $t('summary.title') }}</h3>

    <div v-if="ticketType" class="flex items-baseline justify-between gap-4 text-sm">
      <span class="text-neutral-muted">
        {{ $t('summary.ticketLine', { name: ticketType.name }) }}
      </span>
      <span class="shrink-0 text-neutral">{{ currency(ticketCents) }}</span>
    </div>

    <div
      v-for="line in addonLines"
      :key="line.addon.id"
      class="flex items-baseline justify-between gap-4 text-sm"
    >
      <span class="text-neutral-muted">
        {{ line.addon.name }}
        <template v-if="line.addon.maxQuantity">&#215; {{ line.quantity }}</template>
      </span>
      <span class="shrink-0 text-neutral">{{ currency(line.subtotalCents) }}</span>
    </div>

    <!-- #264D4F lives in teal-700; text-brand-emphasis is a step darker. -->
    <div
      v-if="workshopDiscountCents"
      class="flex items-baseline justify-between gap-4 text-[11px] leading-[14px] text-teal-700"
    >
      <span>
        {{
          $t('summary.workshopDiscount', {
            ticket: ticketType?.name,
            percent: WORKSHOP_DISCOUNT_PERCENT,
          })
        }}
      </span>
      <span class="shrink-0">-{{ currency(workshopDiscountCents) }}</span>
    </div>

    <div class="border-t divider-default" />

    <div class="flex items-baseline justify-between gap-4 text-sm font-semibold text-neutral">
      <span>{{ $t('summary.total') }}</span>
      <span class="shrink-0">{{ currency(totalCents) }}</span>
    </div>
  </aside>
</template>
