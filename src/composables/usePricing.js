import { computed } from 'vue'
import { event } from '../mocks/event.js'
import { percentOf, toCents } from '../utils/currency.js'
import { ADDON_CATEGORY, VIP_TICKET_TYPE_ID, useRegistration } from './useRegistration.js'

/** VIP holders take this much off every workshop in the order. */
export const WORKSHOP_DISCOUNT_PERCENT = 10

/**
 * Order totals, in integer cents throughout.
 *
 * The discount is a single rounding on the workshop subtotal rather than one per line, so the
 * breakdown the summary prints always adds up to the total it prints beside it.
 *
 * @returns {object} The ticket, the priced add-on lines, the discount and the total.
 */
export function usePricing() {
  const { ticketTypeId, selectedAddonLines } = useRegistration()

  const ticketType = computed(
    () => event.ticketTypes.find((type) => type.id === ticketTypeId.value) ?? null,
  )

  const ticketCents = computed(() => toCents(ticketType.value?.price))

  /** Selected add-ons with their line subtotals resolved. */
  const addonLines = computed(() =>
    selectedAddonLines.value.map(({ addon, quantity, size }) => ({
      addon,
      quantity,
      size,
      subtotalCents: toCents(addon.price) * quantity,
    })),
  )

  const addonSubtotalCents = computed(() =>
    addonLines.value.reduce((sum, line) => sum + line.subtotalCents, 0),
  )

  const workshopSubtotalCents = computed(() =>
    addonLines.value
      .filter((line) => line.addon.category === ADDON_CATEGORY.WORKSHOP)
      .reduce((sum, line) => sum + line.subtotalCents, 0),
  )

  const workshopDiscountCents = computed(() =>
    ticketTypeId.value === VIP_TICKET_TYPE_ID
      ? percentOf(workshopSubtotalCents.value, WORKSHOP_DISCOUNT_PERCENT)
      : 0,
  )

  const totalCents = computed(
    () => ticketCents.value + addonSubtotalCents.value - workshopDiscountCents.value,
  )

  return {
    ticketType,
    ticketCents,
    addonLines,
    addonSubtotalCents,
    workshopSubtotalCents,
    workshopDiscountCents,
    totalCents,
  }
}
