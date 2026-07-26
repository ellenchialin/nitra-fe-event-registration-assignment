<script setup>
defineProps({
  errors: { type: Array, required: true },
})
</script>

<template>
  <div
    role="alert"
    tabindex="-1"
    class="flex flex-col gap-2 rounded-m border border-danger-muted bg-danger-subtle-rest p-4 text-danger focus:outline-none"
  >
    <p class="text-sm font-semibold">{{ $t('errors.title') }}</p>

    <!-- The bullet is drawn as text to match the design's spacing, so the list marker is off; a
         marker as well would render two. Jumping to a step is the section's Edit link's job. -->
    <ul class="flex list-none flex-col gap-2">
      <li v-for="(error, index) in errors" :key="`${error.field}-${index}`" class="text-sm">
        &bull; {{ $t('errors.item', { step: error.step, message: error.message }) }}
      </li>
    </ul>
  </div>
</template>
