<template>
  <div
    role="status"
    class="flex gap-3 rounded-m border border-info-muted bg-info-subtle-rest p-4 text-neutral"
  >
    <svg viewBox="0 0 16 16" class="mt-0.5 size-4 shrink-0 text-info-default" aria-hidden="true">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M8 7.25V11.5M8 4.5V5"
        stroke="var(--bg-surface-l0)"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>

    <div class="flex min-w-0 flex-col gap-1">
      <p class="text-md font-semibold">{{ $t('step3.shipping.title') }}</p>
      <p class="text-md">{{ $t('step3.shipping.body') }}</p>
    </div>
  </div>
</template>
