<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormatters } from '../../composables/useFormatters.js'
import { WORKSHOP_DISCOUNT_PERCENT, usePricing } from '../../composables/usePricing.js'
import { useRegistration } from '../../composables/useRegistration.js'
import { toCents } from '../../utils/currency.js'
import ReviewRow from '../ui/ReviewRow.vue'
import ReviewSection from '../ui/ReviewSection.vue'
import ValidationErrorBanner from '../ui/ValidationErrorBanner.vue'

const props = defineProps({
  visibleErrors: { type: Array, required: true },
})

const emit = defineEmits(['jump'])

const { attendee, selectedSessions, hasMerchandise, submitAttempted } = useRegistration()
const { ticketType, ticketCents, addonLines, workshopDiscountCents, totalCents } = usePricing()
const { currency, priceShort, dayAndTime } = useFormatters()
const { t } = useI18n()

// The two review frames disagree on which attendee rows appear, and one rule reconciles them: a
// row is shown when it carries a value, or when it is required. Job Title is absent from the error
// frame because it is optional and empty; Shipping Address appears there only because merchandise
// makes it required. See PLAN.md section 3.
const ATTENDEE_FIELDS = [
  { key: 'fullName', required: () => true },
  { key: 'email', required: () => true },
  { key: 'phone', required: () => true },
  { key: 'company', required: () => true },
  { key: 'jobTitle', required: () => false },
]

const attendeeRows = computed(() => {
  const rows = ATTENDEE_FIELDS.filter(
    (field) => attendee[field.key].trim() || field.required(),
  ).map((field) => ({
    key: field.key,
    label: t(`step4.fields.${field.key}`),
    value: attendee[field.key].trim() || t('step4.requiredPlaceholder'),
    // The placeholder states a fact and always shows; only its danger colour waits for a submit
    // attempt, so the review never turns red before the user has asked for it.
    missing: !attendee[field.key].trim() && submitAttempted.value,
  }))

  if (ticketType.value) {
    rows.push({
      key: 'ticketType',
      label: t('step4.fields.ticketType'),
      value: t('step4.ticketValue', {
        name: ticketType.value.name,
        price: priceShort(ticketCents.value),
      }),
      missing: false,
    })
  }

  const shipping = attendee.shippingAddress.trim()
  if (shipping || hasMerchandise.value) {
    rows.push({
      key: 'shippingAddress',
      label: t('step4.fields.shippingAddress'),
      value: shipping || t('step4.requiredForMerchandise'),
      missing: !shipping && submitAttempted.value,
    })
  }

  return rows
})

// A section turns red when its own step is failing, which is what makes the banner's list
// actionable without every bullet needing to be a link of its own.
const erroredSteps = computed(() => new Set(props.visibleErrors.map((error) => error.step)))

const errorBanner = ref(null)

/**
 * Moves focus to the error summary, which both scrolls it into view and announces it.
 *
 * @returns {void}
 */
function focusErrors() {
  errorBanner.value?.$el?.focus()
}

defineExpose({ focusErrors })

const addonRows = computed(() =>
  addonLines.value.map((line) => ({
    key: line.addon.id,
    label: t(`step4.categories.${line.addon.category}`),
    value: line.addon.maxQuantity
      ? t('step4.addonValueQuantity', {
          name: line.addon.name,
          quantity: line.quantity,
          price: priceShort(line.subtotalCents),
        })
      : t('step4.addonValue', {
          name: line.addon.name,
          price: priceShort(toCents(line.addon.price)),
        }),
  })),
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <ValidationErrorBanner
      v-if="props.visibleErrors.length"
      ref="errorBanner"
      :errors="props.visibleErrors"
    />

    <h2 class="text-h3 text-neutral">{{ $t('step4.title') }}</h2>

    <ReviewSection
      :title="$t('step4.sections.attendee')"
      :edit-step="1"
      :invalid="erroredSteps.has(1)"
      @edit="emit('jump', $event)"
    >
      <ReviewRow
        v-for="row in attendeeRows"
        :key="row.key"
        :label="row.label"
        :value="row.value"
        :missing="row.missing"
      />
    </ReviewSection>

    <ReviewSection
      :title="$t('step4.sections.sessions')"
      :edit-step="2"
      :invalid="erroredSteps.has(2)"
      @edit="emit('jump', $event)"
    >
      <ReviewRow
        v-for="session in selectedSessions"
        :key="session.id"
        :label="dayAndTime(session.date)"
        :value="session.title"
      />
      <p v-if="!selectedSessions.length" class="text-sm text-neutral-quiet">
        {{ $t('step4.noSessions') }}
      </p>
    </ReviewSection>

    <ReviewSection
      :title="$t('step4.sections.addons')"
      :edit-step="3"
      :invalid="erroredSteps.has(3)"
      @edit="emit('jump', $event)"
    >
      <ReviewRow v-for="row in addonRows" :key="row.key" :label="row.label" :value="row.value" />
      <p v-if="!addonRows.length" class="text-sm text-neutral-quiet">
        {{ $t('step4.noAddons') }}
      </p>
    </ReviewSection>

    <section class="card-edge flex flex-col gap-2 rounded-m bg-surface-l1 p-5">
      <h3 class="text-subtitle1 mb-1 text-neutral">{{ $t('step4.sections.pricing') }}</h3>

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

      <div class="mt-1 border-t divider-default" />

      <div class="flex items-baseline justify-between gap-4 text-sm font-semibold text-neutral">
        <span>{{ $t('step4.grandTotal') }}</span>
        <span class="shrink-0">{{ currency(totalCents) }}</span>
      </div>
    </section>
  </div>
</template>
