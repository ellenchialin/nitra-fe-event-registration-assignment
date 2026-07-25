import { computed, inject, provide, reactive, ref } from 'vue'
import { addons } from '../mocks/addons.js'
import { sessions } from '../mocks/sessions.js'

/**
 * Injection key for the wizard's shared registration state.
 *
 * A Symbol rather than a string so nothing can collide with or accidentally read this state,
 * and a provide/inject pair rather than a module-level singleton so ownership is explicit and
 * the state resets cleanly with the component that owns it.
 */
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
 * Selections are stored as identifiers only; every richer view of them (grouped sessions,
 * conflicts, pricing, validation) is derived downstream so there is exactly one source of
 * truth and no synchronisation to keep correct.
 *
 * Add-ons use a single `{ quantity, size }` shape across all three categories. Workshops and
 * meals are quantity 0 or 1; merchandise carries a real quantity and an optional size. One
 * shape means pricing and validation iterate a single collection rather than special-casing
 * per category.
 *
 * @returns {object} The registration state, its mutations, and core derived selections.
 */
export function createRegistrationState() {
  const attendee = reactive(createEmptyAttendee())
  const ticketTypeId = ref(null)
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
    } else {
      selectedSessionIds.value = [...selectedSessionIds.value, sessionId]
    }
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
   * Sets an add-on's quantity, clamped to `[0, maxQuantity]`.
   *
   * Reaching zero removes the record entirely rather than leaving a zero-quantity entry, so
   * downstream consumers can treat presence as selection. An add-on without `maxQuantity`
   * (workshops, meals) is capped at 1.
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
   * Stored even when quantity is zero so a size picked before the quantity is raised is not
   * silently discarded.
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
   * Restores the wizard to a blank state, used by the success screen's "Back to Home".
   *
   * @returns {void}
   */
  function reset() {
    Object.assign(attendee, createEmptyAttendee())
    ticketTypeId.value = null
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

  /** Selected add-ons joined to their source records, in the order they appear in the data. */
  const selectedAddonLines = computed(() =>
    addons
      .filter((addon) => (addonSelections.value[addon.id]?.quantity ?? 0) > 0)
      .map((addon) => ({ addon, ...addonSelections.value[addon.id] })),
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
    selectedAddonLines,
    hasMerchandise,

    // Mutations
    isSessionSelected,
    toggleSession,
    getAddonSelection,
    setAddonQuantity,
    toggleAddon,
    setAddonSize,
    goToStep,
    reset,
  }
}

/**
 * Creates the registration state and provides it to descendants.
 *
 * Called once, by the wizard root.
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
 * Throws rather than returning `undefined` when called outside the wizard: a missing provider
 * is a wiring mistake, and failing at the injection point names the problem far better than a
 * downstream `Cannot read properties of undefined`.
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
