/**
 * Currency helpers. Pricing runs in integer cents and formats only at the display boundary —
 * the 10% VIP discount in floats yields 14.900000000000002 and risks a grand total that
 * disagrees with the sum of its own line items.
 */

const CENTS_PER_UNIT = 100

/**
 * Converts a major-unit price (as authored in the mock data) to integer cents.
 *
 * @param {number} amount - Price in major units, e.g. `149` for $149.00.
 * @returns {number} Whole cents, or `0` when the input is not a finite number.
 */
export function toCents(amount) {
  if (!Number.isFinite(amount)) return 0
  return Math.round(amount * CENTS_PER_UNIT)
}

/**
 * Applies a percentage discount to a cent amount, rounding to the nearest cent.
 *
 * Rounds once on the total rather than per line item, so a breakdown always reconciles.
 *
 * @param {number} cents - Amount to discount, in whole cents.
 * @param {number} percent - Discount percentage, e.g. `10` for 10%.
 * @returns {number} Discount amount in whole cents, never negative.
 */
export function percentOf(cents, percent) {
  if (!Number.isFinite(cents) || !Number.isFinite(percent)) return 0
  return Math.max(0, Math.round((cents * percent) / 100))
}

/**
 * Formats a cent amount as a currency string, e.g. `'$1,234.00'`.
 *
 * @param {number} cents - Amount in whole cents. Negative values render with a leading sign.
 * @param {string} [locale] - BCP 47 locale tag.
 * @param {string} [currency] - ISO 4217 currency code.
 * @returns {string} Localised currency string; treats non-finite input as zero.
 */
export function formatCurrency(cents, locale = 'en-US', currency = 'USD') {
  const safeCents = Number.isFinite(cents) ? cents : 0
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(safeCents / CENTS_PER_UNIT)
}

/**
 * Formats a cent amount, dropping the decimals when the value is a whole unit.
 *
 * Cards render `$299`; the order summary and review render `$299.00`. Both are in the design.
 *
 * @param {number} cents - Amount in whole cents.
 * @param {string} [locale] - BCP 47 locale tag.
 * @param {string} [currency] - ISO 4217 currency code.
 * @returns {string} Localised currency string without trailing `.00`.
 */
export function formatPriceShort(cents, locale = 'en-US', currency = 'USD') {
  const safeCents = Number.isFinite(cents) ? cents : 0
  const isWholeUnit = safeCents % CENTS_PER_UNIT === 0

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: isWholeUnit ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safeCents / CENTS_PER_UNIT)
}
