import { computed } from 'vue'
import { sessions } from '../mocks/sessions.js'
import { groupByUtcDay } from '../utils/time.js'
import { useRegistration } from './useRegistration.js'

/**
 * Session list state: day grouping, availability, and the active day tab.
 *
 * Conflicts live in the rule set, not here — the README defers time-conflict validation to the
 * Step 4 submit.
 *
 * @returns {object} Day groups, the active day, and selection helpers.
 */
export function useSessions() {
  const { selectedSessionIds, selectedSessions, activeDayKey, isSessionSelected, toggleSession } =
    useRegistration()

  const dayGroups = computed(() => groupByUtcDay(sessions))

  const activeDaySessions = computed(
    () => dayGroups.value.find((group) => group.dayKey === activeDayKey.value)?.items ?? [],
  )

  return {
    dayGroups,
    activeDayKey,
    activeDaySessions,
    selectedSessionIds,
    selectedSessions,
    isSessionSelected,
    toggleSession,
  }
}
