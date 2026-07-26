<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, default: '' },
  missing: { type: Boolean, default: false },
})
</script>

<template>
  <div class="flex items-baseline justify-between gap-4 text-sm">
    <span class="shrink-0 text-neutral-muted">{{ label }}</span>
    <!-- The value wraps rather than holding its width: a session title beside its label overflows
         a phone otherwise. -->
    <span class="min-w-0 text-right" :class="missing ? 'text-danger' : 'text-neutral'">
      {{ value }}
    </span>
  </div>
</template>
