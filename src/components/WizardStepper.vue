<script setup>
import { useI18n } from 'vue-i18n'
import { STEP_STATUS, TOTAL_STEPS } from '../composables/useStepper.js'

defineProps({
  steps: { type: Array, required: true },
})

const emit = defineEmits(['select'])

const { t } = useI18n()

const STATUS_SUFFIX_KEYS = {
  [STEP_STATUS.COMPLETED]: 'a11y.stepCompleted',
  [STEP_STATUS.ERROR]: 'a11y.stepHasErrors',
}

/**
 * The whole announcement for a step button.
 *
 * Status is otherwise carried only by colour and a bare "!", which assistive tech cannot read, so
 * a failing step would sound identical to a passing one. Composed here as a single `aria-label`
 * rather than layered sr-only spans, so the name is exactly one string with no stray fragments.
 *
 * @param {{number: number, key: string, status: string}} step - Step to describe.
 * @returns {string} Position, label, and status where the status is not already implied.
 */
function stepAriaLabel(step) {
  const name = t('a11y.stepOf', {
    number: step.number,
    total: TOTAL_STEPS,
    label: t(`steps.${step.key}`),
  })

  const suffixKey = STATUS_SUFFIX_KEYS[step.status]
  return suffixKey ? `${name}, ${t(suffixKey)}` : name
}

const CIRCLE_CLASSES = {
  [STEP_STATUS.ACTIVE]: 'bg-brand-emphasis-rest text-inverse',
  [STEP_STATUS.COMPLETED]: 'bg-brand-emphasis-rest text-inverse',
  [STEP_STATUS.ERROR]: 'bg-danger-emphasis-rest text-inverse',
  [STEP_STATUS.UPCOMING]: 'bg-surface-l2 text-neutral-quiet',
}

const LABEL_CLASSES = {
  [STEP_STATUS.ACTIVE]: 'text-neutral font-semibold',
  [STEP_STATUS.COMPLETED]: 'text-neutral font-semibold',
  [STEP_STATUS.ERROR]: 'text-danger font-semibold',
  [STEP_STATUS.UPCOMING]: 'text-neutral-quiet font-regular',
}
</script>

<template>
  <nav :aria-label="$t('a11y.progress')" class="flex items-center py-6">
    <template v-for="(step, index) in steps" :key="step.key">
      <span
        v-if="index > 0"
        class="mx-4 h-0.5 min-w-px flex-1 overflow-hidden rounded-xs bg-surface-l2"
      >
        <!-- Scaled, not widened: width 0 -> 100% registers no transition and would snap. -->
        <span
          class="block h-full w-full origin-left rounded-xs bg-brand-emphasis-rest transition-transform duration-300 ease-out"
          :class="step.status === STEP_STATUS.UPCOMING ? 'scale-x-0' : 'scale-x-100'"
        />
      </span>

      <button
        type="button"
        class="flex shrink-0 items-center gap-2.5 rounded transition-opacity hover:opacity-80"
        :aria-label="stepAriaLabel(step)"
        :aria-current="step.status === STEP_STATUS.ACTIVE ? 'step' : undefined"
        @click="emit('select', step.number)"
      >
        <span
          aria-hidden="true"
          class="flex size-8 items-center justify-center rounded-full text-[14px] font-semibold transition-colors duration-200"
          :class="CIRCLE_CLASSES[step.status]"
        >
          <template v-if="step.status === STEP_STATUS.COMPLETED">
            <svg viewBox="0 0 16 16" class="size-4" fill="none" aria-hidden="true">
              <path
                d="M3 8.5L6.5 12L13 4.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
          <template v-else-if="step.status === STEP_STATUS.ERROR">!</template>
          <template v-else>{{ step.number }}</template>
        </span>

        <!-- Decorative: the button's aria-label already carries label and status. Hidden below
             tablet because four labels plus connectors do not fit a phone. -->
        <span
          aria-hidden="true"
          class="hidden text-[13px] transition-colors duration-200 tablet:inline"
          :class="LABEL_CLASSES[step.status]"
        >
          {{ $t(`steps.${step.key}`) }}
        </span>
      </button>
    </template>
  </nav>
</template>
