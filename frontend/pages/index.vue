<script setup lang="ts">
import type { ReflectionStreak } from '@wheredidmytimego/shared'

definePageMeta({ middleware: 'auth' })

const dashboard = useDashboardStore()
const categories = useCategoriesStore()
const { api } = useApi()
const { timezone } = useTimezone()
const editOpen = ref(false)
const editingEntry = ref<(typeof dashboard.todayEntries)[0] | null>(null)
const streak = ref<ReflectionStreak | null>(null)
const streakLoading = ref(true)

onMounted(async () => {
  await Promise.all([categories.fetchCategories(), dashboard.refresh(), loadStreak()])
})

async function loadStreak() {
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

function openEdit(entry: (typeof dashboard.todayEntries)[0]) {
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
  if (!editingEntry.value) return
  await api(`/api/time-entries/${editingEntry.value.id}`, {
    method: 'PATCH',
    body: payload
  })
  await dashboard.refresh()
}

async function onDelete(id: number) {
  if (!confirm('Delete this entry?')) return
  await api(`/api/time-entries/${id}`, { method: 'DELETE' })
  await dashboard.refresh()
}

async function onCategoryPeriod(period: 'today' | 'week') {
  await dashboard.setCategoryPeriod(period)
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold">Dashboard</h1>
      <div class="flex items-center gap-3">
        <ReflectionStreakBadge :streak="streak" :loading="streakLoading" />
        <NuxtLink to="/add">
          <UiButton size="sm">Log time</UiButton>
        </NuxtLink>
      </div>
    </div>

    <DashboardSkeleton v-if="dashboard.loading && !dashboard.summary" />

    <template v-else>
      <DashboardTodaySummaryCard
        :summary="dashboard.summary"
        :entry-count="dashboard.todayEntries.length"
        :productivity-score="dashboard.productivityScore"
      />

      <DashboardWeeklyChart v-if="dashboard.weekly.length" :days="dashboard.weekly" />

      <DashboardCategoryDonut
        :items="dashboard.categoryBreakdown"
        :loading="dashboard.loading"
        :period="dashboard.categoryPeriod"
        @update:period="onCategoryPeriod"
      />

      <UiCard class="p-4">
        <h2 class="mb-3 font-medium">Today</h2>
        <ul v-if="dashboard.todayEntries.length" class="space-y-2">
          <li
            v-for="entry in dashboard.todayEntries"
            :key="entry.id"
            class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
          >
            <div>
              <p class="font-medium">{{ entry.title }}</p>
              <p class="text-slate-500">{{ formatMinutes(entry.durationMinutes) }}</p>
            </div>
            <div class="flex gap-2">
              <UiButton size="sm" variant="ghost" @click="openEdit(entry)">Edit</UiButton>
              <UiButton size="sm" variant="ghost" @click="onDelete(entry.id)">Delete</UiButton>
            </div>
          </li>
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
