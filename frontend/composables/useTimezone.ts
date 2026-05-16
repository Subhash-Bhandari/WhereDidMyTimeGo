export function useTimezone() {
  const timezone = ref(
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'UTC'
  )

  return { timezone }
}
