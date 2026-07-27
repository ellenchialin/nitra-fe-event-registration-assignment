<script setup>
import { STEP_STATUS, TOTAL_STEPS } from '../composables/useStepper.js'

defineProps({
  steps: { type: Array, required: true },
})

const emit = defineEmits(['select'])

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
        :aria-current="step.status === STEP_STATUS.ACTIVE ? 'step' : undefined"
        @click="emit('select', step.number)"
      >
        <span
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

        <span
          class="text-[13px] transition-colors duration-200"
          :class="LABEL_CLASSES[step.status]"
        >
          <span class="sr-only tablet:not-sr-only">{{ $t(`steps.${step.key}`) }}</span>
          <span class="sr-only">
            {{ $t('a11y.stepOf', { number: step.number, total: TOTAL_STEPS, label: '' }) }}
          </span>
        </span>
      </button>
    </template>
  </nav>
</template>
