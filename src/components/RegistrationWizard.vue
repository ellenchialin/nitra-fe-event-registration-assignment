<script setup>
import { computed, nextTick, ref } from 'vue'
import { provideRegistration, SUBMISSION_STATUS } from '../composables/useRegistration.js'
import { useStepper } from '../composables/useStepper.js'
import { useValidation } from '../composables/useValidation.js'
import AppHeader from './AppHeader.vue'
import SuccessScreen from './SuccessScreen.vue'
import WizardStepper from './WizardStepper.vue'
import AddonSelectionStep from './steps/AddonSelectionStep.vue'
import AttendeeInfoStep from './steps/AttendeeInfoStep.vue'
import ReviewSubmitStep from './steps/ReviewSubmitStep.vue'
import SessionSelectionStep from './steps/SessionSelectionStep.vue'
import BaseButton from './ui/BaseButton.vue'

// A component cannot inject what it provides, so the root passes its own instance through.
const registration = provideRegistration()

const { submitAttempted, submissionStatus, submitRegistration } = registration
const { isValid, visibleErrors, erroredSteps } = useValidation({ registration })

const { steps, currentStep, isFirstStep, isLastStep, advanceLabelKey, goNext, goBack, goToStep } =
  useStepper({ registration, erroredSteps })

const reviewStep = ref(null)

const isSubmitting = computed(() => submissionStatus.value === SUBMISSION_STATUS.SUBMITTING)
const hasSucceeded = computed(() => submissionStatus.value === SUBMISSION_STATUS.SUCCEEDED)

/**
 * Validates every step at once, then either submits or surfaces the failures.
 *
 * @returns {Promise<void>} Resolves once the submission settles or the errors are shown.
 */
async function handleSubmit() {
  submitAttempted.value = true

  if (!isValid.value) {
    await nextTick()
    reviewStep.value?.focusErrors()
    return
  }

  await submitRegistration()
}

/**
 * Moves to a step, used by the stepper, the review sections' Edit buttons and the error list.
 *
 * @param {number} step - Target step number.
 * @returns {void}
 */
function jumpToStep(step) {
  goToStep(step)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface-l0">
    <AppHeader />

    <SuccessScreen v-if="hasSucceeded" />

    <template v-else>
      <div class="sticky top-0 z-10 border-b divider-default bg-surface-l0 px-6">
        <WizardStepper :steps="steps" class="content-column" @select="jumpToStep" />
      </div>

      <main class="flex-1 px-6 py-10">
        <div class="content-column">
          <AttendeeInfoStep v-if="currentStep === 1" />
          <SessionSelectionStep v-else-if="currentStep === 2" />
          <AddonSelectionStep v-else-if="currentStep === 3" />
          <ReviewSubmitStep
            v-else
            ref="reviewStep"
            :visible-errors="visibleErrors"
            @jump="jumpToStep"
          />
        </div>
      </main>

      <div class="sticky bottom-0 z-10 border-t divider-default bg-surface-l0 px-6">
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

          <BaseButton v-else size="lg" :loading="isSubmitting" @click="handleSubmit">
            {{ $t(advanceLabelKey) }}
          </BaseButton>
        </div>
      </div>
    </template>
  </div>
</template>
