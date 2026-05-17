<script setup lang="ts">
import type { ReflectionStreak } from '@wheredidmytimego/shared'
import type { TodayEntry } from '~/stores/dashboard'

definePageMeta({ middleware: 'auth' })

const dashboard = useDashboardStore()
const categories = useCategoriesStore()
const offlineQueue = useOfflineQueue()
const { api } = useApi()
const { timezone } = useTimezone()
const { canLoadFromServer, isOnlineForSync, browserOnline } = useOnlineStatus()
const editOpen = ref(false)
const editingEntry = ref<TodayEntry | null>(null)
const streak = ref<ReflectionStreak | null>(null)
const streakLoading = ref(true)

const showOfflineEmpty = computed(
  () =>
    !isOnlineForSync.value &&
    !dashboard.loadedWhileOnline &&
    dashboard.todayEntries.length === 0
)

const showStaleOffline = computed(
  () => !isOnlineForSync.value && dashboard.loadedWhileOnline && dashboard.summary
)

onMounted(async () => {
  await Promise.all([categories.fetchCategories(), dashboard.refresh(), loadStreak()])
})

watch(canLoadFromServer, (canLoad, prev) => {
  if (canLoad && !prev) {
    void dashboard.refresh()
    void loadStreak()
  }
})

async function loadStreak() {
  if (!canLoadFromServer.value) {
    streakLoading.value = false
    return
  }
  streakLoading.value = true
  try {
    streak.value = await api<ReflectionStreak>('/api/reflections/streak', {
      query: { timezone: timezone.value }
    })
  } catch {
    streak.value = null
  } finally {
    streakLoading.value = false
  }
}

function formatMinutes(m: number) {
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h === 0) return `${min}m`
  return min ? `${h}h ${min}m` : `${h}h`
}

function openEdit(entry: TodayEntry) {
  if (entry.pending) return
  editingEntry.value = entry
  editOpen.value = true
}

async function onSave(payload: {
  title: string
  categoryId: number | null
  startedAt: string
  endedAt: string
  durationMinutes: number
}) {
  if (!editingEntry.value || editingEntry.value.pending) return
  await api(`/api/time-entries/${editingEntry.value.id}`, {
    method: 'PATCH',
    body: payload
  })
  await dashboard.refresh()
}

async function onDelete(entry: TodayEntry) {
  if (entry.pending && entry.localId) {
    if (!confirm('Remove this offline entry?')) return
    await offlineQueue.removeEntry(entry.localId)
    return
  }
  if (!confirm('Delete this entry?')) return
  await api(`/api/time-entries/${entry.id}`, { method: 'DELETE' })
  await dashboard.refresh()
}
</script>

<template>
  <section class="space-y-6">
    <motion
      v-if="showOfflineEmpty"
      class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
    >
      <p class="font-medium">You are offline</p>
      <p class="mt-1">
        Open
        <NuxtLink to="/add" class="font-medium underline">Quick Add</NuxtLink>
        to log time — entries will sync when you are back online.
      </p>
    </motion>

    <p v-if="showStaleOffline" class="text-xs text-amber-800">
      Showing cached dashboard
      {{ browserOnline ? '(server unreachable)' : '(offline)' }}.
    </p>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">Dashboard</h1>
      <div class="flex items-center gap-3">
        <ReflectionStreakBadge :streak="streak" :loading="streakLoading" />
        <NuxtLink to="/add">
          <UiButton size="sm">Log time</UiButton>
        </NuxtLink>
      </div>
    </div>

    <DashboardSkeleton v-if="dashboard.loading && !dashboard.summary && !showOfflineEmpty" />

    <template v-else-if="!showOfflineEmpty">
      <DashboardTodaySummaryCard
        v-if="dashboard.summary"
        :summary="dashboard.summary"
        :entry-count="dashboard.todayEntries.length"
        :productivity-score="dashboard.productivityScore"
      />

      <DashboardWeeklyChart v-if="dashboard.weekly.length" :days="dashboard.weekly" />

      <DashboardCategoryDonut
        v-if="dashboard.categoryBreakdown.length"
        :items="dashboard.categoryBreakdown"
        :loading="dashboard.loading"
        :period="dashboard.categoryPeriod"
        @update:period="dashboard.setCategoryPeriod"
      />

      <UiCard class="p-4">
        <h2 class="mb-3 font-medium">Today</h2>
        <ul v-if="dashboard.todayEntries.length" class="space-y-2">
          <template v-for="entry in dashboard.todayEntries" :key="entry.pending ? entry.localId : entry.id">
            <DashboardPendingEntryCard
              v-if="entry.pending"
              :entry="entry"
              @delete="onDelete(entry)"
            />
            <li
              v-else
              class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <div>
                <p class="font-medium">{{ entry.title }}</p>
                <p class="text-slate-500">{{ formatMinutes(entry.durationMinutes) }}</p>
              </div>
              <div class="flex gap-2">
                <UiButton size="sm" variant="ghost" @click="openEdit(entry)">Edit</UiButton>
                <UiButton size="sm" variant="ghost" @click="onDelete(entry)">Delete</UiButton>
              </div>
            </li>
          </template>
        </ul>
        <p v-else class="text-sm text-slate-600">
          No time logged today.
          <NuxtLink to="/add" class="font-medium underline">Add your first entry</NuxtLink>
        </p>
      </UiCard>
    </template>

    <EntriesEntryEditDialog
      v-model:open="editOpen"
      :entry="editingEntry"
      :categories="categories.categories"
      @save="onSave"
    />
  </section>
</template>
