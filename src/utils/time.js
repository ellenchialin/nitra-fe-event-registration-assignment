/**
 * Time helpers. Every mock timestamp is UTC and is treated as UTC throughout — grouping,
 * comparison and display. Local-time grouping would file `ws2` (15:30–18:30Z) under the wrong
 * day in UTC+8, where it runs 23:30–02:30 the next day.
 */

const UTC = 'UTC'

const RANGE_SEPARATOR = ' – '

/**
 * Converts an ISO 8601 timestamp to epoch milliseconds.
 *
 * @param {string} isoTimestamp - ISO 8601 timestamp, e.g. `'2028-11-15T09:00:00Z'`.
 * @returns {number} Epoch milliseconds, or `NaN` if the input is absent or unparseable.
 */
export function toEpochMs(isoTimestamp) {
  if (!isoTimestamp) return NaN
  return new Date(isoTimestamp).getTime()
}

/**
 * Determines whether two time ranges overlap.
 *
 * Half-open (`[start, end)`), so back-to-back ranges are not a conflict. Ranges with missing
 * or unparseable bounds return `false`, letting undated add-ons use the same comparison.
 *
 * @param {string} startA - ISO start of the first range.
 * @param {string} endA - ISO end of the first range.
 * @param {string} startB - ISO start of the second range.
 * @param {string} endB - ISO end of the second range.
 * @returns {boolean} `true` when the two ranges share any instant in time.
 */
export function rangesOverlap(startA, endA, startB, endB) {
  const aStart = toEpochMs(startA)
  const aEnd = toEpochMs(endA)
  const bStart = toEpochMs(startB)
  const bEnd = toEpochMs(endB)

  if ([aStart, aEnd, bStart, bEnd].some(Number.isNaN)) return false

  return aStart < bEnd && bStart < aEnd
}

/**
 * Determines whether two scheduled records overlap in time.
 *
 * Takes the `{ date, endDate }` shape shared by `sessions.js` and `addons.js`.
 *
 * @param {{date?: string, endDate?: string}} a - First scheduled record.
 * @param {{date?: string, endDate?: string}} b - Second scheduled record.
 * @returns {boolean} `true` when both are scheduled and their times overlap.
 */
export function schedulesOverlap(a, b) {
  if (!a || !b) return false
  return rangesOverlap(a.date, a.endDate, b.date, b.endDate)
}

/**
 * Derives a stable UTC calendar-day key for grouping.
 *
 * @param {string} isoTimestamp - ISO 8601 timestamp.
 * @returns {string} Day key as `YYYY-MM-DD` in UTC, or an empty string if unparseable.
 */
export function toUtcDayKey(isoTimestamp) {
  const epochMs = toEpochMs(isoTimestamp)
  if (Number.isNaN(epochMs)) return ''
  return new Date(epochMs).toISOString().slice(0, 10)
}

/**
 * Formats a timestamp as a short day label, e.g. `'Nov 15'`.
 *
 * @param {string} isoTimestamp - ISO 8601 timestamp.
 * @param {string} [locale] - BCP 47 locale tag.
 * @returns {string} Localised day label, or an empty string if unparseable.
 */
export function formatDayLabel(isoTimestamp, locale = 'en-US') {
  const epochMs = toEpochMs(isoTimestamp)
  if (Number.isNaN(epochMs)) return ''
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: UTC,
  }).format(epochMs)
}

/**
 * Formats a timestamp as a clock time, e.g. `'9:00 AM'`.
 *
 * @param {string} isoTimestamp - ISO 8601 timestamp.
 * @param {string} [locale] - BCP 47 locale tag.
 * @returns {string} Localised time, or an empty string if unparseable.
 */
export function formatTime(isoTimestamp, locale = 'en-US') {
  const epochMs = toEpochMs(isoTimestamp)
  if (Number.isNaN(epochMs)) return ''
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: UTC,
  }).format(epochMs)
}

/**
 * Formats a start/end pair as a time range, e.g. `'9:00 AM – 10:00 AM'`.
 *
 * @param {string} startIso - ISO start timestamp.
 * @param {string} endIso - ISO end timestamp.
 * @param {string} [locale] - BCP 47 locale tag.
 * @returns {string} Localised range, or an empty string if either bound is unparseable.
 */
export function formatTimeRange(startIso, endIso, locale = 'en-US') {
  const start = formatTime(startIso, locale)
  const end = formatTime(endIso, locale)
  if (!start || !end) return ''
  return `${start}${RANGE_SEPARATOR}${end}`
}

/**
 * Formats a timestamp as a day and time, e.g. `'Nov 15, 9:00 AM'`.
 *
 * @param {string} isoTimestamp - ISO 8601 timestamp.
 * @param {string} [locale] - BCP 47 locale tag.
 * @returns {string} Localised day and time, or an empty string if unparseable.
 */
export function formatDayAndTime(isoTimestamp, locale = 'en-US') {
  const day = formatDayLabel(isoTimestamp, locale)
  const time = formatTime(isoTimestamp, locale)
  if (!day || !time) return ''
  return `${day}, ${time}`
}

/**
 * Formats a start/end pair as a day and time range, e.g. `'Nov 16, 2:00 PM – 5:00 PM'`.
 *
 * Used by add-on cards, where no surrounding day group implies the date.
 *
 * @param {string} startIso - ISO start timestamp.
 * @param {string} endIso - ISO end timestamp.
 * @param {string} [locale] - BCP 47 locale tag.
 * @returns {string} Localised day and range, or an empty string if either bound is unparseable.
 */
export function formatDayAndTimeRange(startIso, endIso, locale = 'en-US') {
  const day = formatDayLabel(startIso, locale)
  const range = formatTimeRange(startIso, endIso, locale)
  if (!day || !range) return ''
  return `${day}, ${range}`
}

/**
 * Groups scheduled records into UTC calendar days, ordered chronologically.
 *
 * Undated records are omitted rather than grouped under an empty key, and each day is sorted
 * by start time so render order does not depend on source-array order.
 *
 * @param {Array<{date?: string}>} records - Records carrying an ISO `date` field.
 * @returns {Array<{dayKey: string, date: string, items: Array<object>}>} Day groups sorted
 *   ascending, each holding the representative ISO `date` of its earliest record.
 */
export function groupByUtcDay(records = []) {
  const groups = new Map()

  for (const record of records) {
    const dayKey = toUtcDayKey(record?.date)
    if (!dayKey) continue

    if (!groups.has(dayKey)) groups.set(dayKey, [])
    groups.get(dayKey).push(record)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, items]) => {
      const sorted = [...items].sort((a, b) => toEpochMs(a.date) - toEpochMs(b.date))
      return { dayKey, date: sorted[0].date, items: sorted }
    })
}
