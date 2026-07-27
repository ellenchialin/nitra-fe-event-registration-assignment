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
    <div class="relative flex size-20 shrink-0 items-center justify-center">
      <!-- One ripple out from the badge. Its resting opacity is 0, so a reduced-motion viewer
           never sees a stray halo. -->
      <span
        class="absolute inset-0 rounded-full bg-success-emphasis-rest opacity-0 motion-safe:animate-badge-ring motion-safe:animate-delay-200"
        aria-hidden="true"
      />

      <div
        class="relative flex size-20 items-center justify-center rounded-full bg-success-emphasis-rest text-inverse motion-safe:animate-badge-pop"
      >
        <svg viewBox="0 0 36 28" class="w-9" fill="none" aria-hidden="true">
          <!-- `pathLength="1"` normalises the stroke so the dash covers it exactly, whatever the
             geometry; the resting dashoffset is 0, so without the animation the tick is simply
             drawn rather than hidden. -->
          <path
            d="M2 15L13 26L34 2"
            path-length="1"
            stroke-dasharray="1"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="motion-safe:animate-check-draw motion-safe:animate-delay-300"
          />
        </svg>
      </div>
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
