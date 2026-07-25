<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegistration } from '../../composables/useRegistration.js'
import { event } from '../../mocks/event.js'
import { isNonEmpty } from '../../utils/validators.js'
import FormField from '../ui/FormField.vue'
import TicketCard from '../ui/TicketCard.vue'

const { t } = useI18n()
const { attendee, ticketTypeId, hasMerchandise, submitAttempted } = useRegistration()

// Label and border react to merchandise immediately; the error waits for a submit attempt, so
// nothing the user types here triggers inline validation.
const isShippingRequired = computed(() => hasMerchandise.value)

const shippingLabel = computed(() =>
  isShippingRequired.value
    ? t('fields.shippingAddress.labelRequired')
    : t('fields.shippingAddress.labelOptional'),
)

const shippingError = computed(() => {
  const isMissing = isShippingRequired.value && !isNonEmpty(attendee.shippingAddress)
  return submitAttempted.value && isMissing
    ? t('fields.shippingAddress.requiredForMerchandise')
    : ''
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <section class="flex flex-col gap-4">
      <h2 class="text-subtitle1 text-neutral">{{ $t('step1.ticketTypeTitle') }}</h2>

      <div role="radiogroup" :aria-label="$t('step1.ticketTypeTitle')" class="flex gap-4">
        <TicketCard
          v-for="ticket in event.ticketTypes"
          :key="ticket.id"
          :ticket="ticket"
          :selected="ticketTypeId === ticket.id"
          @click="ticketTypeId = ticket.id"
        />
      </div>
    </section>

    <section class="flex flex-col gap-8">
      <h2 class="text-h3 text-neutral">{{ $t('step1.attendeeTitle') }}</h2>

      <div class="grid grid-cols-2 gap-x-6 gap-y-5">
        <FormField
          v-model="attendee.fullName"
          :label="$t('fields.fullName.label')"
          :placeholder="$t('fields.fullName.placeholder')"
          autocomplete="name"
        />
        <FormField
          v-model="attendee.email"
          type="email"
          :label="$t('fields.email.label')"
          :placeholder="$t('fields.email.placeholder')"
          autocomplete="email"
        />
        <FormField
          v-model="attendee.phone"
          type="tel"
          :label="$t('fields.phone.label')"
          :placeholder="$t('fields.phone.placeholder')"
          autocomplete="tel"
        />
        <FormField
          v-model="attendee.company"
          :label="$t('fields.company.label')"
          :placeholder="$t('fields.company.placeholder')"
          autocomplete="organization"
        />
        <FormField
          v-model="attendee.jobTitle"
          class="col-span-2"
          :label="$t('fields.jobTitle.label')"
          :placeholder="$t('fields.jobTitle.placeholder')"
          autocomplete="organization-title"
        />
        <FormField
          v-model="attendee.shippingAddress"
          class="col-span-2"
          :label="shippingLabel"
          :placeholder="$t('fields.shippingAddress.placeholder')"
          :required="isShippingRequired"
          :error-message="shippingError"
          autocomplete="street-address"
        />
      </div>
    </section>
  </div>
</template>
