<script setup>
import { usePricing } from '../composables/usePricing.js'
import { useRegistration } from '../composables/useRegistration.js'
import { event } from '../mocks/event.js'
import BaseButton from './ui/BaseButton.vue'

const { attendee, confirmationCode, reset } = useRegistration()
const { ticketType } = usePricing()
</script>

<template>
  <main class="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
    <div
      class="flex size-20 items-center justify-center rounded-full bg-success-emphasis-rest text-inverse"
    >
      <svg viewBox="0 0 36 28" class="w-9" fill="none" aria-hidden="true">
        <path
          d="M2 15L13 26L34 2"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <h2 class="text-h2 text-success">{{ $t('success.title') }}</h2>

    <p class="text-lg text-neutral">{{ $t('success.confirmation', { code: confirmationCode }) }}</p>

    <p class="max-w-[420px] text-sm text-neutral-muted">
      {{
        $t('success.body', {
          name: attendee.fullName,
          ticket: ticketType?.name,
          event: event.name,
          email: attendee.email,
        })
      }}
    </p>

    <BaseButton class="mt-2" @click="reset">{{ $t('success.backHome') }}</BaseButton>
  </main>
</template>
