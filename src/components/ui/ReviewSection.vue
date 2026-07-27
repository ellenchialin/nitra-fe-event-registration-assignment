<script setup>
defineProps({
  title: { type: String, required: true },
  editStep: { type: Number, required: true },
  invalid: { type: Boolean, default: false },
})

defineEmits(['edit'])
</script>

<template>
  <section
    class="flex flex-col gap-3 rounded-m bg-surface-l1 p-5 transition-shadow duration-150"
    :class="invalid ? 'card-edge-danger' : 'card-edge'"
  >
    <div class="flex items-start justify-between gap-4">
      <h3 class="text-subtitle1" :class="invalid ? 'text-danger' : 'text-neutral'">{{ title }}</h3>

      <!-- #3A7679 lives in teal-500; text-brand is a step darker. -->
      <button
        type="button"
        class="shrink-0 text-sm font-semibold text-teal-500 underline transition-colors hover:text-brand"
        @click="$emit('edit', editStep)"
      >
        {{ $t('step4.edit', { step: editStep }) }}
      </button>
    </div>

    <slot />
  </section>
</template>
