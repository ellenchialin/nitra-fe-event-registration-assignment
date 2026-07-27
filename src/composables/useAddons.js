import { computed } from 'vue'
import { addons } from '../mocks/addons.js'
import { schedulesOverlap } from '../utils/time.js'
import { ADDON_CATEGORY, useRegistration } from './useRegistration.js'

/** Tab order for the add-on categories, matching the design's left-to-right order. */
export const ADDON_CATEGORIES = Object.freeze([
  { value: ADDON_CATEGORY.WORKSHOP, labelKey: 'step3.categories.workshop' },
  { value: ADDON_CATEGORY.MEAL, labelKey: 'step3.categories.meal' },
  { value: ADDON_CATEGORY.MERCHANDISE, labelKey: 'step3.categories.merchandise' },
])

/**
 * Add-on list state: the active category tab, and each add-on's availability.
 *
 * Availability itself is owned by the registration state, since pricing has to honour it too;
 * this composable only resolves the reason, which is what the card renders.
 *
 * @returns {object} The category tabs, the active category's add-ons, and selection helpers.
 */
export function useAddons() {
  const {
    selectedSessions,
    unavailableAddonIds,
    activeAddonCategory,
    hasMerchandise,
    getAddonSelection,
    setAddonQuantity,
    setAddonSize,
    toggleAddon,
  } = useRegistration()

  const activeAddons = computed(() =>
    addons.filter((addon) => addon.category === activeAddonCategory.value),
  )

  /**
   * Reports whether an add-on is in the order.
   *
   * @param {string} addonId - Add-on identifier.
   * @returns {boolean} `true` when its quantity is positive and it is still available.
   */
  function isAddonSelected(addonId) {
    return getAddonSelection(addonId).quantity > 0 && !unavailableAddonIds.value.has(addonId)
  }

  /**
   * Reports whether an add-on cannot be ordered.
   *
   * @param {string} addonId - Add-on identifier.
   * @returns {boolean} `true` when sold out or in conflict with a selected session.
   */
  function isAddonUnavailable(addonId) {
    return unavailableAddonIds.value.has(addonId)
  }

  /**
   * Selected sessions a scheduled add-on runs against.
   *
   * @param {{date?: string, endDate?: string}} addon - Add-on to test.
   * @returns {Array<object>} Overlapping selected sessions; empty for undated add-ons.
   */
  function conflictingSessionsFor(addon) {
    return selectedSessions.value.filter((session) => schedulesOverlap(addon, session))
  }

  return {
    categories: ADDON_CATEGORIES,
    activeCategory: activeAddonCategory,
    activeAddons,
    hasMerchandise,
    isAddonSelected,
    isAddonUnavailable,
    conflictingSessionsFor,
    getAddonSelection,
    setAddonQuantity,
    setAddonSize,
    toggleAddon,
  }
}
