<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAddons } from '../../composables/useAddons.js'
import { ADDON_CATEGORY } from '../../composables/useRegistration.js'
import AddonCard from '../ui/AddonCard.vue'
import MerchandiseCard from '../ui/MerchandiseCard.vue'
import OrderSummary from '../ui/OrderSummary.vue'
import SegmentedTabs from '../ui/SegmentedTabs.vue'
import ShippingBanner from '../ui/ShippingBanner.vue'

const {
  categories,
  activeCategory,
  activeAddons,
  hasMerchandise,
  isAddonSelected,
  isAddonUnavailable,
  conflictingSessionsFor,
  getAddonSelection,
  setAddonQuantity,
  setAddonSize,
  toggleAddon,
} = useAddons()

const { t } = useI18n()

const categoryTabs = computed(() =>
  categories.map((category) => ({ value: category.value, label: t(category.labelKey) })),
)

const showsMerchandise = computed(() => activeCategory.value === ADDON_CATEGORY.MERCHANDISE)
</script>

<template>
  <div class="flex flex-col gap-8 desktop:flex-row desktop:items-start">
    <div class="flex min-w-0 flex-1 flex-col gap-6">
      <h2 class="text-h3 text-neutral">{{ $t('step3.title') }}</h2>

      <SegmentedTabs
        v-model="activeCategory"
        :tabs="categoryTabs"
        :aria-label="$t('step3.selectCategory')"
      />

      <ShippingBanner v-if="showsMerchandise && hasMerchandise" />

      <template v-if="showsMerchandise">
        <MerchandiseCard
          v-for="addon in activeAddons"
          :key="addon.id"
          :addon="addon"
          :selection="getAddonSelection(addon.id)"
          @update:quantity="setAddonQuantity"
          @update:size="setAddonSize"
        />
      </template>

      <template v-else>
        <AddonCard
          v-for="addon in activeAddons"
          :key="addon.id"
          :addon="addon"
          :selected="isAddonSelected(addon.id)"
          :unavailable="isAddonUnavailable(addon.id)"
          :conflicts="conflictingSessionsFor(addon)"
          @toggle="toggleAddon"
        />
      </template>
    </div>

    <OrderSummary class="w-full desktop:sticky desktop:top-24 desktop:w-95 desktop:shrink-0" />
  </div>
</template>
