<script setup>
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES } from '../../i18n/index.js'

const { locale } = useI18n()
</script>

<template>
  <q-select
    v-model="locale"
    class="locale-switcher size-8 rounded-m border border-neutral-muted bg-surface-l0 text-neutral-muted transition-colors hover:border-neutral-emphasis focus-within:border-brand-emphasis"
    :options="SUPPORTED_LOCALES"
    option-value="code"
    option-label="label"
    popup-content-class="locale-switcher__popup rounded-m text-sm"
    menu-anchor="bottom end"
    menu-self="top end"
    :menu-offset="[0, 4]"
    dense
    borderless
    emit-value
    map-options
    hide-dropdown-icon
  >
    <!-- The trigger is the icon at every locale, so the value is carried by the focus target's own
         `value` rather than shown. The sr-only text names the combobox, which Quasar leaves unnamed
         — see SizeSelect for the same treatment. -->
    <template #selected>
      <svg viewBox="0 0 24 24" class="size-5" fill="currentColor" aria-hidden="true">
        <path
          d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"
        />
      </svg>
      <span class="sr-only">{{ $t('a11y.language') }}</span>
    </template>
  </q-select>
</template>

<style scoped>
/* Same QField skeleton override as SizeSelect: Quasar sizes it for a 40px dense control. Here the
   target is a square icon button, so the control fills the box and centres its single child. */
.locale-switcher :deep(.q-field__control),
.locale-switcher :deep(.q-field__native) {
  min-height: 0;
  height: 30px;
  padding: 0;
}

.locale-switcher :deep(.q-field__native) {
  justify-content: center;
  color: inherit;
}
</style>

<!-- Teleported out of scoped reach; rows are Quasar's 48px touch target otherwise. -->
<style>
.locale-switcher__popup .q-item {
  min-height: 32px;
  padding: 4px 12px;
}
</style>
