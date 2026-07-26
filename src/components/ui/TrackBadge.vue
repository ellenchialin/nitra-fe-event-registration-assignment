<script setup>
defineProps({
  track: { type: String, required: true },
  muted: { type: Boolean, default: false },
})

// The design assigns frontend two different colours across cards (orange on s2, yellow on s4)
// and reuses orange for devops. Four tracks need four distinct colours, so frontend takes the
// yellow and devops keeps the orange. See PLAN.md section 3.
const TRACK_CLASSES = {
  main: 'bg-neutral-subtle-rest text-neutral-muted',
  frontend: 'bg-warning-muted-rest text-warning-emphasis',
  backend: 'bg-info-muted-rest text-info-emphasis',
  devops: 'bg-accent-muted-rest text-accent-emphasis',
}
</script>

<template>
  <span
    class="rounded-full px-2 py-1 text-[10px] leading-3 font-semibold tracking-wide uppercase"
    :class="muted ? 'bg-surface-l2 text-neutral-disabled' : TRACK_CLASSES[track]"
  >
    {{ $t(`tracks.${track}`) }}
  </span>
</template>
