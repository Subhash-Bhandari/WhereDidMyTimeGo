import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import utc from 'dayjs/plugin/utc'
import timezonePlugin from 'dayjs/plugin/timezone'

dayjs.extend(isoWeek)
dayjs.extend(utc)
dayjs.extend(timezonePlugin)

export type RangePreset = 'today' | 'this_week' | 'last_week' | 'last_30' | 'custom'

const STORAGE_KEY = 'analytics_date_range'

export function useAnalyticsRange() {
  const { timezone } = useTimezone()

  const preset = ref<RangePreset>('this_week')
  const customFrom = ref('')
  const customTo = ref('')

  function loadStored() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as {
        preset: RangePreset
        from?: string
        to?: string
      }
      preset.value = data.preset
      if (data.from) customFrom.value = data.from
      if (data.to) customTo.value = data.to
    } catch {
      /* ignore */
    }
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        preset: preset.value,
        from: customFrom.value || undefined,
        to: customTo.value || undefined
      })
    )
  }

  function bounds(): { from: string; to: string } {
    const tz = timezone.value
    const now = dayjs().tz(tz)
    switch (preset.value) {
      case 'today':
        return { from: now.format('YYYY-MM-DD'), to: now.format('YYYY-MM-DD') }
      case 'this_week':
        return {
          from: now.startOf('isoWeek').format('YYYY-MM-DD'),
          to: now.endOf('isoWeek').format('YYYY-MM-DD')
        }
      case 'last_week': {
        const w = now.subtract(1, 'week')
        return {
          from: w.startOf('isoWeek').format('YYYY-MM-DD'),
          to: w.endOf('isoWeek').format('YYYY-MM-DD')
        }
      }
      case 'last_30':
        return {
          from: now.subtract(29, 'day').format('YYYY-MM-DD'),
          to: now.format('YYYY-MM-DD')
        }
      case 'custom':
        return {
          from: customFrom.value || now.format('YYYY-MM-DD'),
          to: customTo.value || now.format('YYYY-MM-DD')
        }
    }
  }

  watch([preset, customFrom, customTo], persist)

  onMounted(loadStored)

  return { preset, customFrom, customTo, bounds, persist }
}
