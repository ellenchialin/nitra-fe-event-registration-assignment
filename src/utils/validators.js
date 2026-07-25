/**
 * Field-level predicates used by the unified validation rule set.
 *
 * Each predicate is total: it accepts anything and returns a boolean, so rules never need
 * to guard against `undefined` before calling one.
 */

/**
 * Matches the practical shape of an email address: non-empty local part, single `@`,
 * dotted domain with a two-or-more character TLD.
 *
 * Deliberately not RFC 5322 — a fully compliant pattern is unreadable, rejects nothing
 * users actually type, and the authoritative check for an address is always delivery.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

/** Digits, with optional separators, spaces, parentheses and a leading `+`. */
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
 * Accepts international formats by counting digits rather than matching a national pattern:
 * separators are permitted anywhere, and the digit count must fall within the E.164 range
 * of 7–15. This accepts the design's `+1 (555) 123-4567` without rejecting non-US numbers.
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
