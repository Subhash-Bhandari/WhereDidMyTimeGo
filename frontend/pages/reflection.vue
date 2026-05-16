<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { api } = useApi()
const { timezone } = useTimezone()

const moods = ['great', 'good', 'okay', 'low', 'bad'] as const
const mood = ref<(typeof moods)[number]>('good')
const productivityScore = ref(5)
const sleepHours = ref<number | null>(null)
const notes = ref('')
const loading = ref(false)
const saved = ref(false)

onMounted(async () => {
  const row = await api<{
    mood: string
    productivityScore: number
    sleepHours: number | null
    notes: string | null
  } | null>('/api/reflections/today', { query: { timezone: timezone.value } })
  if (row) {
    mood.value = row.mood as (typeof moods)[number]
    productivityScore.value = row.productivityScore
    sleepHours.value = row.sleepHours
    notes.value = row.notes ?? ''
  }
})

async function save() {
  loading.value = true
  saved.value = false
  try {
    await api('/api/reflections/today', {
      method: 'PUT',
      query: { timezone: timezone.value },
      body: {
        mood: mood.value,
        productivityScore: productivityScore.value,
        sleepHours: sleepHours.value,
        notes: notes.value || null
      }
    })
    saved.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-lg space-y-6">
    <h1 class="text-2xl font-semibold">Daily reflection</h1>
    <UiCard class="space-y-4 p-4">
      <div>
        <UiLabel>Mood</UiLabel>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="m in moods"
            :key="m"
            type="button"
            class="min-h-[44px] rounded-full border px-4 text-sm capitalize"
            :class="mood === m ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'"
            @click="mood = m"
          >
            {{ m }}
          </button>
        </div>
      </div>
      <div>
        <UiLabel>Productivity ({{ productivityScore }})</UiLabel>
        <input v-model.number="productivityScore" type="range" min="1" max="10" class="w-full" />
      </div>
      <div>
        <UiLabel>Sleep hours (optional)</UiLabel>
        <UiInput v-model.number="sleepHours" type="number" min="0" max="24" />
      </div>
      <div>
        <UiLabel>Notes</UiLabel>
        <textarea
          v-model="notes"
          rows="3"
          class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <UiButton size="lg" class="w-full" :disabled="loading" @click="save">
        Save reflection
      </UiButton>
      <p v-if="saved" class="text-sm text-green-600">Saved!</p>
    </UiCard>
  </section>
</template>
