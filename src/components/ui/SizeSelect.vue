<script setup>
defineProps({
  sizes: { type: Array, required: true },
  itemName: { type: String, required: true },
  // Same "requirement has just become true" treatment the shipping address uses.
  emphasis: { type: Boolean, default: false },
})

const size = defineModel({ type: String, default: '' })
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-neutral-muted">{{ $t('step3.size') }}</span>

    <q-select
      v-model="size"
      class="size-select h-7 rounded-m border bg-surface-l0 text-sm transition-colors hover:bg-neutral-quiet-hover focus-within:border-brand-emphasis"
      :class="[
        size ? 'text-neutral' : 'text-neutral-quiet',
        emphasis ? 'border-neutral-emphasis' : 'border-neutral-muted',
      ]"
      :options="sizes"
      popup-content-class="size-select__popup rounded-m text-sm"
      menu-anchor="bottom start"
      menu-self="top start"
      :menu-offset="[0, 4]"
      dense
      borderless
      emit-value
      hide-dropdown-icon
    >
      <!-- The value is already exposed through the focus target's own `value`; hiding this visual
           copy keeps it out of the accessible name, which is composed from the whole label. -->
      <template #selected>
        <span aria-hidden="true">{{ size || $t('step3.selectSize') }}</span>
      </template>

      <template #append>
        <!-- QSelect routes `aria-label` to a presentational div and puts `role="combobox"` on an
             inner focus target, leaving it unnamed. The root element is a `<label for>` pointing at
             that target, so text placed anywhere inside names it. -->
        <span class="sr-only">{{ $t('step3.sizeFor', { name: itemName }) }}</span>

        <svg viewBox="0 0 6 4" class="w-1.5 text-neutral-quiet" aria-hidden="true">
          <path d="M0 0H6L3 4Z" fill="currentColor" />
        </svg>
      </template>
    </q-select>
  </div>
</template>

<style scoped>
/* QSelect renders a QField skeleton sized for Material's 40px dense control. Reaching those
   internals needs :deep() — the only place in this app that styles a third-party component. */
.size-select :deep(.q-field__control),
.size-select :deep(.q-field__native),
.size-select :deep(.q-field__append) {
  min-height: 0;
  height: 26px;
  padding: 0;
}

/* The popup anchors to `.q-field__control`, so the control has to fill the bordered box rather
   than sit inside it — otherwise the menu lines up with the text and not the button. */
.size-select :deep(.q-field__control) {
  padding: 0 8px 0 12px;
}

.size-select :deep(.q-field__native) {
  font: inherit;
  color: inherit;
}

.size-select :deep(.q-field__append) {
  padding-left: 8px;
}
</style>

<!-- The popup teleports to <body>, so radius and type come from utilities on `popup-content-class`
     and only the rows, which have no element of our own to hang a class on, need CSS. Quasar sizes
     them for a 48px touch target, well off this design's scale. -->
<style>
.size-select__popup .q-item {
  min-height: 32px;
  padding: 4px 12px;
}
</style>
