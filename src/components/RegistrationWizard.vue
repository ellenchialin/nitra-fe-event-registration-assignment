<script setup>
import { provideRegistration } from '../composables/useRegistration.js'
import { useStepper } from '../composables/useStepper.js'
import AppHeader from './AppHeader.vue'
import WizardStepper from './WizardStepper.vue'
import AttendeeInfoStep from './steps/AttendeeInfoStep.vue'
import BaseButton from './ui/BaseButton.vue'

// A component cannot inject what it provides, so the root passes its own instance through.
const registration = provideRegistration()

const { steps, currentStep, isFirstStep, isLastStep, advanceLabelKey, goNext, goBack, goToStep } =
  useStepper({ registration })
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-l0">
    <AppHeader />

    <div class="border-b divider-default px-6">
      <WizardStepper :steps="steps" class="content-column" @select="goToStep" />
    </div>

    <main class="flex-1 px-6 py-10">
      <div class="content-column">
        <AttendeeInfoStep v-if="currentStep === 1" />
        <!-- Steps 2-4 land here in the following commits. -->
        <p v-else class="text-neutral-muted">Step {{ currentStep }}</p>
      </div>
    </main>

    <div class="border-t divider-default bg-surface-l0 px-6">
      <div
        class="content-column flex items-center py-4"
        :class="isFirstStep ? 'justify-end' : 'justify-between'"
      >
        <BaseButton v-if="!isFirstStep" variant="secondary" @click="goBack">
          {{ $t('nav.back') }}
        </BaseButton>

        <BaseButton v-if="!isLastStep" @click="goNext">
          {{ $t(advanceLabelKey) }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
