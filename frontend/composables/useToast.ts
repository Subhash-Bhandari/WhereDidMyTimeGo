export type ToastItem = {
  id: number
  message: string
  variant: 'success' | 'error'
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

function push(message: string, variant: ToastItem['variant']) {
  const id = ++nextId
  toasts.value = [...toasts.value, { id, message, variant }]
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 4000)
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    success(message: string) {
      push(message, 'success')
    },
    error(message: string) {
      push(message, 'error')
    }
  }
}
