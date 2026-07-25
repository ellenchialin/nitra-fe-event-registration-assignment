import { useI18n } from 'vue-i18n'
import { formatCurrency } from '../utils/currency.js'
import {
  formatDayAndTime,
  formatDayAndTimeRange,
  formatDayLabel,
  formatTimeRange,
} from '../utils/time.js'

/**
 * Locale-aware wrappers over the pure formatting utilities.
 *
 * The utilities take an explicit locale so they stay testable outside a component; this binds
 * them to the active one. Reading `locale.value` inside each call makes every formatted string
 * re-render on a locale change, which is what keeps dates and prices switching along with copy
 * rather than staying frozen in the initial language.
 *
 * @returns {{currency: (cents: number) => string, dayLabel: (iso: string) => string,
 *   timeRange: (startIso: string, endIso: string) => string,
 *   dayAndTime: (iso: string) => string,
 *   dayAndTimeRange: (startIso: string, endIso: string) => string}} Bound formatters.
 */
export function useFormatters() {
  const { locale } = useI18n()

  return {
    currency: (cents) => formatCurrency(cents, locale.value),
    dayLabel: (iso) => formatDayLabel(iso, locale.value),
    timeRange: (startIso, endIso) => formatTimeRange(startIso, endIso, locale.value),
    dayAndTime: (iso) => formatDayAndTime(iso, locale.value),
    dayAndTimeRange: (startIso, endIso) => formatDayAndTimeRange(startIso, endIso, locale.value),
  }
}
