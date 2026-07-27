<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['md', 'lg'].includes(value),
  },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})

// The design gives the final submit a 48px button in an 80px action bar, against 40px in 72px
// everywhere else.
const SIZE_CLASSES = {
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3.5',
}

const VARIANT_CLASSES = {
  primary:
    'bg-accent-emphasis-rest hover:bg-accent-emphasis-hover active:bg-accent-emphasis-active text-inverse',
  secondary:
    'bg-neutral-muted-rest hover:bg-neutral-muted-hover active:bg-neutral-muted-active text-neutral-muted',
}

const variantClasses = computed(() => VARIANT_CLASSES[props.variant])
const isInteractive = computed(() => !props.disabled && !props.loading)
</script>

<template>
  <button
    :type="type"
    :disabled="!isInteractive"
    :aria-busy="loading || undefined"
    class="relative inline-flex min-w-[72px] items-center justify-center rounded text-[14px] leading-5 font-semibold transition-colors duration-150 disabled:cursor-not-allowed"
    :class="[variantClasses, SIZE_CLASSES[size]]"
  >
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <span
        class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden="true"
      />
    </span>

    <!-- The label holds its place at zero opacity so the button keeps its width while submitting.
         `invisible` would do the same visually but drops the label from the accessibility tree,
         leaving the button unnamed at exactly the moment it is describing what it is doing. -->
    <span class="inline-flex items-center gap-2" :class="{ 'opacity-0': loading }">
      <slot />
    </span>
  </button>
</template>
