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

    <!-- opacity-0, not `invisible`: the label must keep its width and stay in the a11y tree. -->
    <span class="inline-flex items-center gap-2" :class="{ 'opacity-0': loading }">
      <slot />
    </span>
  </button>
</template>
