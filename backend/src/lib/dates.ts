import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isoWeek)

export function localTodayRange(timezone: string) {
  const start = dayjs().tz(timezone).startOf('day')
  const end = start.endOf('day')
  return { start: start.toDate(), end: end.toDate(), dateStr: start.format('YYYY-MM-DD') }
}

export function localWeekRange(timezone: string, weekOffset = 0) {
  const monday = dayjs().tz(timezone).startOf('isoWeek').add(weekOffset, 'week')
  const sunday = monday.endOf('isoWeek')
  return { start: monday.toDate(), end: sunday.toDate() }
}

export function localYesterdayRange(timezone: string) {
  const start = dayjs().tz(timezone).subtract(1, 'day').startOf('day')
  return { start: start.toDate(), end: start.endOf('day').toDate() }
}
