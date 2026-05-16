export const useDashboard = () => {
  const todayMinutes = ref(0)
  const weeklyMinutes = ref<number[]>([])

  return {
    todayMinutes,
    weeklyMinutes
  }
}
