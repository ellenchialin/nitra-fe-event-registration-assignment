<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAddons } from '../../composables/useAddons.js'
import AddonCard from '../ui/AddonCard.vue'
import OrderSummary from '../ui/OrderSummary.vue'
import SegmentedTabs from '../ui/SegmentedTabs.vue'

const {
  categories,
  activeCategory,
  activeAddons,
  isAddonSelected,
  isAddonUnavailable,
  conflictingSessionsFor,
  toggleAddon,
} = useAddons()

const { t } = useI18n()

const categoryTabs = computed(() =>
  categories.map((category) => ({ value: category.value, label: t(category.labelKey) })),
)
</script>

<template>
  <div class="flex items-start gap-8">
    <div class="flex min-w-0 flex-1 flex-col gap-6">
      <h2 class="text-h3 text-neutral">{{ $t('step3.title') }}</h2>

      <SegmentedTabs
        v-model="activeCategory"
        :tabs="categoryTabs"
        :aria-label="$t('step3.selectCategory')"
      />

      <AddonCard
        v-for="addon in activeAddons"
        :key="addon.id"
        :addon="addon"
        :selected="isAddonSelected(addon.id)"
        :unavailable="isAddonUnavailable(addon.id)"
        :conflicts="conflictingSessionsFor(addon)"
        @toggle="toggleAddon"
      />
    </div>

    <OrderSummary class="sticky top-24 w-95 shrink-0" />
  </div>
</template>
