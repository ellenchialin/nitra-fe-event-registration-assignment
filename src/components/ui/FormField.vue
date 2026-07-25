<script setup>
import { computed, useId } from 'vue'

const model = defineModel({ type: String, default: '' })

const props = defineProps({
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: undefined },
  required: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})

const fieldId = useId()
const errorId = computed(() => `${fieldId}-error`)
const hasError = computed(() => Boolean(props.errorMessage))

const borderClass = computed(() => {
  if (hasError.value) return 'border-danger-emphasis'
  return props.required ? 'border-neutral-emphasis' : 'border-neutral-muted'
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      :for="fieldId"
      class="text-[12px] font-medium"
      :class="hasError ? 'text-danger' : 'text-neutral'"
    >
      {{ label }}
    </label>

    <input
      :id="fieldId"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :aria-invalid="hasError || undefined"
      :aria-describedby="hasError ? errorId : undefined"
      class="h-11 rounded-m border bg-surface-l0 px-3 text-[16px] text-neutral transition-colors placeholder:text-neutral-quiet focus:border-brand-emphasis focus:outline-none"
      :class="borderClass"
    />

    <p v-if="hasError" :id="errorId" class="text-[11px] text-danger">{{ errorMessage }}</p>
  </div>
</template>
