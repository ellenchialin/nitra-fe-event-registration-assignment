import { computed, inject, provide, reactive, ref } from 'vue'
import { addons } from '../mocks/addons.js'
import { sessions } from '../mocks/sessions.js'
import { isSoldOut } from '../utils/capacity.js'
import { schedulesOverlap } from '../utils/time.js'

/** Injection key for the wizard's shared registration state. */
export const REGISTRATION_KEY = Symbol('registration')

/** Add-on categories, matching the `category` field in `addons.js`. */
export const ADDON_CATEGORY = Object.freeze({
  WORKSHOP: 'workshop',
  MEAL: 'meal',
  MERCHANDISE: 'merchandise',
})

/** Lifecycle of the final submit, driving the button's loading and disabled states. */
export const SUBMISSION_STATUS = Object.freeze({
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  SUCCEEDED: 'succeeded',
})

const TOTAL_STEPS = 4

/** The one ticket type whose perks include the workshop discount. */
export const VIP_TICKET_TYPE_ID = 'vip'

// The design's "TC2025-47291" carries the same stale branding as its "WebDev Summit 2025" header,
// so the prefix follows the data rather than the mockup.
const CONFIRMATION_PREFIX = 'WDS2028'

const SUBMIT_LATENCY_MS = 900

/**
 * Builds a mock confirmation code, e.g. `WDS2028-47291`.
 *
 * @returns {string} A confirmation code with a five-digit suffix.
 */
function createConfirmationCode() {
  return `${CONFIRMATION_PREFIX}-${Math.floor(10000 + Math.random() * 90000)}`
}

// The design shows VIP selected across Step 1, the Step 3 summary and the Step 4 review.
const DEFAULT_TICKET_TYPE_ID = VIP_TICKET_TYPE_ID

/**
 * Builds a blank attendee record.
 *
 * @returns {{fullName: string, email: string, phone: string, company: string,
 *   jobTitle: string, shippingAddress: string}} Attendee fields, all empty strings so
 *   `v-model` bindings never see `undefined`.
 */
function createEmptyAttendee() {
  return {
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    shippingAddress: '',
  }
}

/**
 * Creates the wizard's shared reactive state.
 *
 * Selections are stored as identifiers only; grouped sessions, conflicts, pricing and
 * validation all derive downstream. Add-ons share one `{ quantity, size }` shape across all
 * three categories so pricing and validation iterate a single collection.
 *
 * @returns {object} The registration state, its mutations, and core derived selections.
 */
export function createRegistrationState() {
  const attendee = reactive(createEmptyAttendee())
  const ticketTypeId = ref(DEFAULT_TICKET_TYPE_ID)
  const selectedSessionIds = ref([])

  /** @type {import('vue').Ref<Record<string, {quantity: number, size: string|null}>>} */
  const addonSelections = ref({})

  const currentStep = ref(1)
  const submitAttempted = ref(false)
  const submissionStatus = ref(SUBMISSION_STATUS.IDLE)
  const confirmationCode = ref('')

  const sessionById = new Map(sessions.map((session) => [session.id, session]))
  const addonById = new Map(addons.map((addon) => [addon.id, addon]))

  /**
   * Reports whether a session is currently selected.
   *
   * @param {string} sessionId - Session identifier.
   * @returns {boolean} `true` when the session is in the selection.
   */
  function isSessionSelected(sessionId) {
    return selectedSessionIds.value.includes(sessionId)
  }

  /**
   * Adds or removes a session from the selection.
   *
   * @param {string} sessionId - Session identifier.
   * @returns {void}
   */
  function toggleSession(sessionId) {
    if (isSessionSelected(sessionId)) {
      selectedSessionIds.value = selectedSessionIds.value.filter((id) => id !== sessionId)
      return
    }

    selectedSessionIds.value = [...selectedSessionIds.value, sessionId]
    dropAddonsClashingWith(sessionById.get(sessionId))
  }

  /**
   * Drops any selected add-on that overlaps the given session.
   *
   * Availability stays derived, but the selection cannot: a filtered-out add-on still reads as
   * selected in state while the card and the order summary both show it gone, and it would
   * silently return to the total when the clash cleared. Pruning here rather than in a watcher
   * keeps the removal attributable to the click that caused it.
   *
   * @param {{date?: string, endDate?: string}} [session] - Session that was just added.
   * @returns {void}
   */
  function dropAddonsClashingWith(session) {
    if (!session) return

    const next = { ...addonSelections.value }
    const clashing = Object.keys(next).filter((id) => schedulesOverlap(addonById.get(id), session))
    if (clashing.length === 0) return

    for (const id of clashing) delete next[id]
    addonSelections.value = next
  }

  /**
   * Reads the selection record for an add-on.
   *
   * @param {string} addonId - Add-on identifier.
   * @returns {{quantity: number, size: string|null}} The selection, or a zero-quantity
   *   placeholder when the add-on has never been touched.
   */
  function getAddonSelection(addonId) {
    return addonSelections.value[addonId] ?? { quantity: 0, size: null }
  }

  /**
   * Sets an add-on's quantity, clamped to `[0, maxQuantity]` (1 when unspecified).
   *
   * Zero deletes the record, so presence means selection.
   *
   * @param {string} addonId - Add-on identifier.
   * @param {number} quantity - Requested quantity before clamping.
   * @returns {void}
   */
  function setAddonQuantity(addonId, quantity) {
    const addon = addonById.get(addonId)
    if (!addon) return

    const maximum = addon.maxQuantity ?? 1
    const clamped = Math.min(Math.max(Math.trunc(quantity) || 0, 0), maximum)

    // Unavailability blocks adding, never removing — otherwise a selection could get stuck.
    if (clamped > 0 && unavailableAddonIds.value.has(addonId)) return
    const next = { ...addonSelections.value }

    if (clamped === 0) {
      delete next[addonId]
    } else {
      next[addonId] = { ...getAddonSelection(addonId), quantity: clamped }
    }

    addonSelections.value = next
  }

  /**
   * Toggles a single-quantity add-on such as a workshop or meal package.
   *
   * @param {string} addonId - Add-on identifier.
   * @returns {void}
   */
  function toggleAddon(addonId) {
    setAddonQuantity(addonId, getAddonSelection(addonId).quantity > 0 ? 0 : 1)
  }

  /**
   * Records the chosen size for a sized merchandise item.
   *
   * Held on the selection record, so a size chosen before the quantity is raised survives. Taking
   * the quantity back to zero removes the item from the order and discards it with the record.
   *
   * @param {string} addonId - Add-on identifier.
   * @param {string|null} size - Chosen size, or `null` to clear it.
   * @returns {void}
   */
  function setAddonSize(addonId, size) {
    if (!addonById.has(addonId)) return

    addonSelections.value = {
      ...addonSelections.value,
      [addonId]: { ...getAddonSelection(addonId), size },
    }
  }

  /**
   * Moves to a step, clamped to the valid range.
   *
   * @param {number} step - Target step number, 1-indexed.
   * @returns {void}
   */
  function goToStep(step) {
    currentStep.value = Math.min(Math.max(Math.trunc(step) || 1, 1), TOTAL_STEPS)
  }

  /**
   * Runs the mock submission and issues a confirmation code.
   *
   * Validity is the caller's business — this only performs the submission it is asked for, so the
   * rule set stays the single authority on whether the form may be sent.
   *
   * @returns {Promise<void>} Resolves once the submission has succeeded.
   */
  async function submitRegistration() {
    submissionStatus.value = SUBMISSION_STATUS.SUBMITTING
    await new Promise((resolve) => setTimeout(resolve, SUBMIT_LATENCY_MS))
    confirmationCode.value = createConfirmationCode()
    submissionStatus.value = SUBMISSION_STATUS.SUCCEEDED
  }

  /**
   * Restores the wizard to a blank state, used by the success screen's "Back to Home".
   *
   * @returns {void}
   */
  function reset() {
    Object.assign(attendee, createEmptyAttendee())
    ticketTypeId.value = DEFAULT_TICKET_TYPE_ID
    selectedSessionIds.value = []
    addonSelections.value = {}
    currentStep.value = 1
    submitAttempted.value = false
    submissionStatus.value = SUBMISSION_STATUS.IDLE
    confirmationCode.value = ''
  }

  /** Selected sessions as full records, in schedule order rather than click order. */
  const selectedSessions = computed(() =>
    selectedSessionIds.value
      .map((id) => sessionById.get(id))
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
  )

  /**
   * Add-ons that cannot be ordered: sold out, or scheduled against a selected session.
   *
   * Derived rather than enforced by a watcher, so a workshop that a later session choice puts
   * out of reach simply stops counting — and comes back intact if that session is dropped.
   */
  const unavailableAddonIds = computed(() => {
    const chosen = selectedSessions.value

    return new Set(
      addons
        .filter(
          (addon) => isSoldOut(addon) || chosen.some((session) => schedulesOverlap(addon, session)),
        )
        .map((addon) => addon.id),
    )
  })

  /** Selected add-ons joined to their source records, in the order they appear in the data. */
  const selectedAddonLines = computed(() =>
    addons
      .filter(
        (addon) =>
          (addonSelections.value[addon.id]?.quantity ?? 0) > 0 &&
          !unavailableAddonIds.value.has(addon.id),
      )
      .map((addon) => ({ addon, ...addonSelections.value[addon.id] })),
  )

  /**
   * Ordered merchandise that offers sizes but has none chosen.
   *
   * A size is only meaningful once the item is actually in the order, so this reads the priced
   * lines rather than every sized product. Consumed by the Step 4 validation rules.
   */
  const merchandiseMissingSize = computed(() =>
    selectedAddonLines.value.filter((line) => line.addon.sizes?.length && !line.size),
  )

  /** Whether any merchandise is in the order — drives the shipping-address requirement. */
  const hasMerchandise = computed(() =>
    selectedAddonLines.value.some((line) => line.addon.category === ADDON_CATEGORY.MERCHANDISE),
  )

  return {
    // Raw state
    attendee,
    ticketTypeId,
    selectedSessionIds,
    addonSelections,
    currentStep,
    submitAttempted,
    submissionStatus,
    confirmationCode,

    // Derived selections
    selectedSessions,
    unavailableAddonIds,
    selectedAddonLines,
    merchandiseMissingSize,
    hasMerchandise,

    // Mutations
    isSessionSelected,
    toggleSession,
    getAddonSelection,
    setAddonQuantity,
    toggleAddon,
    setAddonSize,
    goToStep,
    submitRegistration,
    reset,
  }
}

/**
 * Creates the registration state and provides it to descendants. Called once, by the wizard root.
 *
 * @returns {ReturnType<typeof createRegistrationState>} The state, for the provider's own use.
 */
export function provideRegistration() {
  const state = createRegistrationState()
  provide(REGISTRATION_KEY, state)
  return state
}

/**
 * Injects the shared registration state.
 *
 * Throws rather than returning `undefined`, so a missing provider fails where it is diagnosable.
 *
 * @returns {ReturnType<typeof createRegistrationState>} The shared state.
 * @throws {Error} When no provider is present in the component's ancestry.
 */
export function useRegistration() {
  const state = inject(REGISTRATION_KEY, null)

  if (!state) {
    throw new Error(
      '[useRegistration] No registration state provided. ' +
        'Call provideRegistration() in the wizard root before using this composable.',
    )
  }

  return state
}
