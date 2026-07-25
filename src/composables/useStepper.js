import { computed, unref } from 'vue'
import { useRegistration } from './useRegistration.js'

/** Wizard steps in order. `key` addresses both the i18n label and the step component. */
export const STEPS = Object.freeze([
  { number: 1, key: 'attendee' },
  { number: 2, key: 'sessions' },
  { number: 3, key: 'addons' },
  { number: 4, key: 'review' },
])

export const TOTAL_STEPS = STEPS.length

export const STEP_STATUS = Object.freeze({
  COMPLETED: 'completed',
  ACTIVE: 'active',
  UPCOMING: 'upcoming',
  ERROR: 'error',
})

/**
 * Navigation and per-step status for the wizard stepper.
 *
 * @param {object} [options] - Optional dependencies.
 * @param {ReturnType<typeof import('./useRegistration.js').createRegistrationState>}
 *   [options.registration] - Registration state to drive. Defaults to injecting it; the wizard
 *   root must pass its own instance, since a component cannot inject what it provides.
 * @param {import('vue').Ref<number[]>|number[]} [options.erroredSteps] - Step numbers failing
 *   validation, supplied by `useValidation` after a submit attempt.
 * @returns {{steps: import('vue').ComputedRef<Array<{number: number, key: string,
 *   status: string}>>, currentStep: import('vue').Ref<number>,
 *   isFirstStep: import('vue').ComputedRef<boolean>,
 *   isLastStep: import('vue').ComputedRef<boolean>,
 *   advanceLabelKey: import('vue').ComputedRef<string>, goNext: () => void,
 *   goBack: () => void, goToStep: (step: number) => void}} Stepper state and navigation.
 */
export function useStepper({ registration, erroredSteps = [] } = {}) {
  const { currentStep, goToStep } = registration ?? useRegistration()

  const isFirstStep = computed(() => currentStep.value === 1)
  const isLastStep = computed(() => currentStep.value === TOTAL_STEPS)

  const steps = computed(() => {
    const errored = new Set(unref(erroredSteps))

    return STEPS.map((step) => {
      let status = STEP_STATUS.UPCOMING
      if (errored.has(step.number)) status = STEP_STATUS.ERROR
      else if (step.number === currentStep.value) status = STEP_STATUS.ACTIVE
      else if (step.number < currentStep.value) status = STEP_STATUS.COMPLETED

      return { ...step, status }
    })
  })

  // On the last step the forward action submits instead of advancing, so the label comes from
  // the step being moved to — STEPS is zero-indexed, making STEPS[currentStep] the next one.
  const advanceLabelKey = computed(() =>
    isLastStep.value ? 'nav.submit' : `nav.next.${STEPS[currentStep.value].key}`,
  )

  /**
   * Advances one step, stopping at the last.
   *
   * @returns {void}
   */
  function goNext() {
    if (!isLastStep.value) goToStep(currentStep.value + 1)
  }

  /**
   * Returns one step, stopping at the first.
   *
   * @returns {void}
   */
  function goBack() {
    if (!isFirstStep.value) goToStep(currentStep.value - 1)
  }

  return { steps, currentStep, isFirstStep, isLastStep, advanceLabelKey, goNext, goBack, goToStep }
}
