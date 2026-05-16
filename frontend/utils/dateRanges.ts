import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezonePlugin from 'dayjs/plugin/timezone'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(utc)
dayjs.extend(timezonePlugin)
dayjs.extend(isoWeek)

export function categoryRangeForPeriod(
  timezone: string,
  period: 'today' | 'week'
): { from: string; to: string } {
  const now = dayjs().tz(timezone)
  if (period === 'today') {
    const d = now.format('YYYY-MM-DD')
    return { from: d, to: d }
  }
  const monday = now.startOf('isoWeek')
  return {
    from: monday.format('YYYY-MM-DD'),
    to: monday.endOf('isoWeek').format('YYYY-MM-DD')
  }
}
