<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegistration } from '../../composables/useRegistration.js'
import { useValidation } from '../../composables/useValidation.js'
import { event } from '../../mocks/event.js'
import FormField from '../ui/FormField.vue'
import TicketCard from '../ui/TicketCard.vue'

const { t } = useI18n()
const { attendee, ticketTypeId, hasMerchandise } = useRegistration()
const { fieldError } = useValidation()

const isShippingRequired = computed(() => hasMerchandise.value)

const shippingLabel = computed(() =>
  isShippingRequired.value
    ? t('fields.shippingAddress.labelRequired')
    : t('fields.shippingAddress.labelOptional'),
)
</script>

<template>
  <div class="flex flex-col gap-8">
    <section class="flex flex-col gap-4">
      <h2 class="text-subtitle1 text-neutral">{{ $t('step1.ticketTypeTitle') }}</h2>

      <div
        role="radiogroup"
        :aria-label="$t('step1.ticketTypeTitle')"
        class="flex flex-col gap-4 tablet:flex-row"
      >
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

      <div class="grid grid-cols-1 gap-x-6 gap-y-5 tablet:grid-cols-2">
        <FormField
          v-model="attendee.fullName"
          :label="$t('fields.fullName.label')"
          :placeholder="$t('fields.fullName.placeholder')"
          :required="true"
          :error-message="fieldError('fullName')"
          autocomplete="name"
        />
        <FormField
          v-model="attendee.email"
          type="email"
          :label="$t('fields.email.label')"
          :placeholder="$t('fields.email.placeholder')"
          :required="true"
          :error-message="fieldError('email')"
          autocomplete="email"
        />
        <FormField
          v-model="attendee.phone"
          type="tel"
          :label="$t('fields.phone.label')"
          :placeholder="$t('fields.phone.placeholder')"
          :required="true"
          :error-message="fieldError('phone')"
          autocomplete="tel"
        />
        <FormField
          v-model="attendee.company"
          :label="$t('fields.company.label')"
          :placeholder="$t('fields.company.placeholder')"
          :required="true"
          :error-message="fieldError('company')"
          autocomplete="organization"
        />
        <FormField
          v-model="attendee.jobTitle"
          class="tablet:col-span-2"
          :label="$t('fields.jobTitle.label')"
          :placeholder="$t('fields.jobTitle.placeholder')"
          :required="true"
          :error-message="fieldError('jobTitle')"
          autocomplete="organization-title"
        />
        <FormField
          v-model="attendee.shippingAddress"
          class="tablet:col-span-2"
          :label="shippingLabel"
          :placeholder="$t('fields.shippingAddress.placeholder')"
          :required="isShippingRequired"
          :emphasis="isShippingRequired"
          :error-message="fieldError('shippingAddress')"
          autocomplete="street-address"
        />
      </div>
    </section>
  </div>
</template>
