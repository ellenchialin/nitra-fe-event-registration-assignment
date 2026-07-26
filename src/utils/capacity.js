/**
 * Capacity helpers shared by sessions and add-ons — the README mentions capacity only for
 * sessions, but workshops carry it too and `ws2` is sold out.
 */

/**
 * Fill bands driving the capacity bar's colour. Thresholds are read off the design: 41% renders
 * brand, 58% warning, and 78%/81%/97% all render accent, which places the cuts at 50 and 75.
 */
export const CAPACITY_BAND = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  FULL: 'full',
})

const MEDIUM_THRESHOLD = 50
const HIGH_THRESHOLD = 75

/**
 * Spots still available.
 *
 * @param {{capacity?: number, registered?: number}} record - Session or add-on.
 * @returns {number} Remaining spots, never negative; `0` for records without a capacity.
 */
export function remainingSpots(record) {
  const capacity = Number(record?.capacity)
  const registered = Number(record?.registered)
  if (!Number.isFinite(capacity) || !Number.isFinite(registered)) return 0
  return Math.max(0, capacity - registered)
}

/**
 * Whether a record has no spots left.
 *
 * Records without a capacity (meals, merchandise) are never sold out.
 *
 * @param {{capacity?: number, registered?: number}} record - Session or add-on.
 * @returns {boolean} `true` when registrations meet or exceed capacity.
 */
export function isSoldOut(record) {
  const capacity = Number(record?.capacity)
  const registered = Number(record?.registered)
  if (!Number.isFinite(capacity) || !Number.isFinite(registered)) return false
  return registered >= capacity
}

/**
 * Percentage of capacity taken, clamped to `[0, 100]`.
 *
 * @param {{capacity?: number, registered?: number}} record - Session or add-on.
 * @returns {number} Fill percentage; `0` when capacity is absent or zero.
 */
export function fillPercent(record) {
  const capacity = Number(record?.capacity)
  const registered = Number(record?.registered)
  if (!Number.isFinite(capacity) || !Number.isFinite(registered) || capacity <= 0) return 0
  return Math.min(100, Math.max(0, (registered / capacity) * 100))
}

/**
 * Band a record's fill falls into.
 *
 * @param {{capacity?: number, registered?: number}} record - Session or add-on.
 * @returns {string} One of the `CAPACITY_BAND` values.
 */
export function capacityBand(record) {
  if (isSoldOut(record)) return CAPACITY_BAND.FULL

  const percent = fillPercent(record)
  if (percent >= HIGH_THRESHOLD) return CAPACITY_BAND.HIGH
  if (percent >= MEDIUM_THRESHOLD) return CAPACITY_BAND.MEDIUM
  return CAPACITY_BAND.LOW
}
