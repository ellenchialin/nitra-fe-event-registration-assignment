/**
 * Field-level predicates for the validation rule set. Each accepts anything and returns a
 * boolean, so rules never guard against `undefined` first.
 */

// Practical shape, not RFC 5322: a compliant pattern is unreadable and the authoritative
// check for an address is always delivery.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

const PHONE_ALLOWED_CHARS = /^[+\d\s().-]+$/

const PHONE_MIN_DIGITS = 7
const PHONE_MAX_DIGITS = 15

/**
 * Checks that a value carries non-whitespace content.
 *
 * @param {unknown} value - Value to test; typically a string from a form field.
 * @returns {boolean} `true` when the value is a string with at least one non-space character.
 */
export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Checks that a value looks like a usable email address.
 *
 * @param {unknown} value - Value to test.
 * @returns {boolean} `true` when the value resembles an email address.
 */
export function isValidEmail(value) {
  if (!isNonEmpty(value)) return false
  return EMAIL_PATTERN.test(value.trim())
}

/**
 * Checks that a value looks like a usable phone number.
 *
 * Counts digits against the E.164 range (7–15) rather than matching a national pattern, so
 * `+1 (555) 123-4567` passes without rejecting non-US numbers.
 *
 * @param {unknown} value - Value to test.
 * @returns {boolean} `true` when the value resembles a phone number.
 */
export function isValidPhone(value) {
  if (!isNonEmpty(value)) return false

  const trimmed = value.trim()
  if (!PHONE_ALLOWED_CHARS.test(trimmed)) return false

  const digitCount = (trimmed.match(/\d/g) ?? []).length
  return digitCount >= PHONE_MIN_DIGITS && digitCount <= PHONE_MAX_DIGITS
}
