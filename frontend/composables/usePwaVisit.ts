const VISIT_KEY = 'pwa_visit_count'

export function usePwaVisit() {
  function incrementVisitCount() {
    if (!import.meta.client) return
    const raw = localStorage.getItem(VISIT_KEY)
    const n = raw ? Number.parseInt(raw, 10) : 0
    localStorage.setItem(VISIT_KEY, String(Number.isFinite(n) ? n + 1 : 1))
  }

  function getVisitCount() {
    if (!import.meta.client) return 0
    const raw = localStorage.getItem(VISIT_KEY)
    const n = raw ? Number.parseInt(raw, 10) : 0
    return Number.isFinite(n) ? n : 0
  }

  return { incrementVisitCount, getVisitCount }
}
