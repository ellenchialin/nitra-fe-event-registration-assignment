import { computed, ref } from 'vue'
import { sessions } from '../mocks/sessions.js'
import { groupByUtcDay, overlappingPairs, schedulesOverlap } from '../utils/time.js'
import { useRegistration } from './useRegistration.js'

/**
 * Session list state: day grouping, availability, and the active day tab.
 *
 * Conflicts are reported but never block selection — the README defers time-conflict validation
 * to the Step 4 submit.
 *
 * @returns {object} Day groups, the active day, and selection helpers.
 */
export function useSessions() {
  const { selectedSessionIds, selectedSessions, isSessionSelected, toggleSession } =
    useRegistration()

  const dayGroups = computed(() => groupByUtcDay(sessions))
  const activeDayKey = ref(dayGroups.value[0]?.dayKey ?? '')

  const activeDaySessions = computed(
    () => dayGroups.value.find((group) => group.dayKey === activeDayKey.value)?.items ?? [],
  )

  /**
   * Sessions that overlap the given one and are also selected.
   *
   * @param {{id: string}} session - Session to test.
   * @returns {Array<object>} Conflicting selected sessions, excluding the session itself.
   */
  function conflictsFor(session) {
    return selectedSessions.value.filter(
      (other) => other.id !== session.id && schedulesOverlap(session, other),
    )
  }

  /** Every pair of selected sessions that overlap, each pair listed once. */
  const conflictingPairs = computed(() => overlappingPairs(selectedSessions.value))

  return {
    dayGroups,
    activeDayKey,
    activeDaySessions,
    selectedSessionIds,
    selectedSessions,
    conflictingPairs,
    conflictsFor,
    isSessionSelected,
    toggleSession,
  }
}
