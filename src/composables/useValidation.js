import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { overlappingPairs } from '../utils/time.js'
import { isNonEmpty, isValidEmail, isValidPhone } from '../utils/validators.js'
import { useRegistration } from './useRegistration.js'

/**
 * Every rule the wizard enforces, as data.
 *
 * `validate` reads a flat snapshot rather than the reactive state, so a rule is a pure predicate
 * that can be exercised without mounting anything. Format rules pass on an empty value, leaving
 * the matching required rule to report it — otherwise one blank field raises two errors.
 *
 * A rule that can fail several times over (overlapping sessions, unsized merchandise) stays a
 * single rule and interpolates the offenders into its message, which keeps this an array of
 * independent booleans instead of a collection of error factories.
 */
export const VALIDATION_RULES = Object.freeze([
  {
    step: 1,
    field: 'fullName',
    messageKey: 'errors.fullNameRequired',
    validate: (subject) => isNonEmpty(subject.attendee.fullName),
  },
  {
    step: 1,
    field: 'email',
    messageKey: 'errors.emailRequired',
    validate: (subject) => isNonEmpty(subject.attendee.email),
  },
  {
    step: 1,
    field: 'email',
    messageKey: 'errors.emailInvalid',
    validate: (subject) =>
      !isNonEmpty(subject.attendee.email) || isValidEmail(subject.attendee.email),
  },
  {
    step: 1,
    field: 'phone',
    messageKey: 'errors.phoneRequired',
    validate: (subject) => isNonEmpty(subject.attendee.phone),
  },
  {
    step: 1,
    field: 'phone',
    messageKey: 'errors.phoneInvalid',
    validate: (subject) =>
      !isNonEmpty(subject.attendee.phone) || isValidPhone(subject.attendee.phone),
  },
  {
    step: 1,
    field: 'company',
    messageKey: 'errors.companyRequired',
    validate: (subject) => isNonEmpty(subject.attendee.company),
  },
  {
    step: 1,
    field: 'jobTitle',
    messageKey: 'errors.jobTitleRequired',
    validate: (subject) => isNonEmpty(subject.attendee.jobTitle),
  },
  {
    step: 1,
    field: 'shippingAddress',
    messageKey: 'errors.shippingRequired',
    validate: (subject) => !subject.hasMerchandise || isNonEmpty(subject.attendee.shippingAddress),
  },
  {
    step: 2,
    field: 'sessions',
    messageKey: 'errors.sessionConflict',
    validate: (subject) => overlappingPairs(subject.selectedSessions).length === 0,
    messageParams: (subject, t) => ({
      pairs: overlappingPairs(subject.selectedSessions)
        .map(([a, b]) => t('errors.conflictPair', { first: a.title, second: b.title }))
        .join('; '),
    }),
  },
  {
    step: 3,
    field: 'addonSize',
    messageKey: 'errors.merchandiseSize',
    validate: (subject) => subject.merchandiseMissingSize.length === 0,
    messageParams: (subject) => ({
      items: subject.merchandiseMissingSize.map((line) => line.addon.name).join(', '),
    }),
  },
])

/**
 * Reduces the rule set into the views the UI needs: a flat error list, a per-step grouping for the
 * stepper badges, and per-field lookups for the review rows and form controls.
 *
 * `isValid` is ungated because submit has to consult it before there has been an attempt;
 * everything the user sees is gated behind `submitAttempted`, so nothing turns red until they ask.
 *
 * @param {object} [options] - Optional dependencies.
 * @param {ReturnType<typeof import('./useRegistration.js').createRegistrationState>}
 *   [options.registration] - Registration state
 *   to validate. Defaults to injecting it; the wizard root must pass its own instance, since a
 *   component cannot inject what it provides.
 * @returns {object} Validation state, gated and ungated.
 */
export function useValidation({ registration } = {}) {
  const { attendee, selectedSessions, hasMerchandise, merchandiseMissingSize, submitAttempted } =
    registration ?? useRegistration()

  const { t } = useI18n()

  const subject = computed(() => ({
    attendee,
    selectedSessions: selectedSessions.value,
    hasMerchandise: hasMerchandise.value,
    merchandiseMissingSize: merchandiseMissingSize.value,
  }))

  /** Every failing rule, resolved to a translated message. Ungated. */
  const errors = computed(() =>
    VALIDATION_RULES.filter((rule) => !rule.validate(subject.value)).map((rule) => ({
      step: rule.step,
      field: rule.field,
      message: t(rule.messageKey, rule.messageParams?.(subject.value, t) ?? {}),
    })),
  )

  const isValid = computed(() => errors.value.length === 0)

  /** Errors the user is allowed to see — empty until they try to submit. */
  const visibleErrors = computed(() => (submitAttempted.value ? errors.value : []))

  const erroredSteps = computed(() => [...new Set(visibleErrors.value.map((e) => e.step))].sort())

  /**
   * The message a field is currently failing on.
   *
   * Returns the first match, so `email` reports "required" before "invalid" — the order the rules
   * are declared in is the order the user should read them.
   *
   * @param {string} field - Field name used by the rule set.
   * @returns {string} The message, or an empty string when the field is fine or errors are hidden.
   */
  function fieldError(field) {
    return visibleErrors.value.find((error) => error.field === field)?.message ?? ''
  }

  /** Sessions in a time conflict, for the danger borders on Step 2. Gated. */
  const conflictingSessionIds = computed(() => {
    if (!submitAttempted.value) return new Set()
    return new Set(
      overlappingPairs(selectedSessions.value)
        .flat()
        .map((s) => s.id),
    )
  })

  return {
    errors,
    isValid,
    visibleErrors,
    erroredSteps,
    fieldError,
    conflictingSessionIds,
  }
}
