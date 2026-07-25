import { useI18n } from 'vue-i18n'
import { formatCurrency, formatPriceShort } from '../utils/currency.js'
import {
  formatDayAndTime,
  formatDayAndTimeRange,
  formatDayLabel,
  formatTimeRange,
} from '../utils/time.js'

/**
 * Locale-aware wrappers over the pure formatting utilities.
 *
 * Reading `locale.value` per call is what makes formatted output re-render on a locale change
 * rather than freezing in the initial language.
 *
 * @returns {{currency: (cents: number) => string, priceShort: (cents: number) => string,
 *   dayLabel: (iso: string) => string,
 *   timeRange: (startIso: string, endIso: string) => string,
 *   dayAndTime: (iso: string) => string,
 *   dayAndTimeRange: (startIso: string, endIso: string) => string}} Bound formatters.
 */
export function useFormatters() {
  const { locale } = useI18n()

  return {
    currency: (cents) => formatCurrency(cents, locale.value),
    priceShort: (cents) => formatPriceShort(cents, locale.value),
    dayLabel: (iso) => formatDayLabel(iso, locale.value),
    timeRange: (startIso, endIso) => formatTimeRange(startIso, endIso, locale.value),
    dayAndTime: (iso) => formatDayAndTime(iso, locale.value),
    dayAndTimeRange: (startIso, endIso) => formatDayAndTimeRange(startIso, endIso, locale.value),
  }
}
