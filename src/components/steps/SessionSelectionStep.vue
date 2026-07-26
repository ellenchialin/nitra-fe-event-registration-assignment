<script setup>
import { computed } from 'vue'
import { useFormatters } from '../../composables/useFormatters.js'
import { useSessions } from '../../composables/useSessions.js'
import { useValidation } from '../../composables/useValidation.js'
import SegmentedTabs from '../ui/SegmentedTabs.vue'
import SessionCard from '../ui/SessionCard.vue'

const {
  dayGroups,
  activeDayKey,
  activeDaySessions,
  selectedSessionIds,
  isSessionSelected,
  toggleSession,
} = useSessions()

const { conflictingSessionIds } = useValidation()

const { dayLabel } = useFormatters()

const dayTabs = computed(() =>
  dayGroups.value.map((group) => ({ value: group.dayKey, label: dayLabel(group.date) })),
)
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="text-h3 text-neutral">{{ $t('step2.title') }}</h2>

    <SegmentedTabs v-model="activeDayKey" :tabs="dayTabs" :aria-label="$t('step2.selectDay')" />

    <p class="text-[12px] leading-4 font-medium text-brand">
      {{ $t('step2.selectedCount', selectedSessionIds.length) }}
    </p>

    <div class="grid grid-cols-1 gap-4 tablet:grid-cols-2">
      <SessionCard
        v-for="session in activeDaySessions"
        :key="session.id"
        :session="session"
        :selected="isSessionSelected(session.id)"
        :conflicted="conflictingSessionIds.has(session.id)"
        @toggle="toggleSession"
      />
    </div>
  </div>
</template>
