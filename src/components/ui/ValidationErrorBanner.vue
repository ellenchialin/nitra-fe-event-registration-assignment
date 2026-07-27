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

    <!-- Bullet is text, so the list marker is off — both would render two. -->
    <ul class="flex list-none flex-col gap-2">
      <li v-for="(error, index) in errors" :key="`${error.field}-${index}`" class="text-sm">
        &bull; {{ $t('errors.item', { step: error.step, message: error.message }) }}
      </li>
    </ul>
  </div>
</template>
