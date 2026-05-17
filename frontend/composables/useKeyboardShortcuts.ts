export type ShortcutBinding = {
  key: string
  ctrlOrMeta?: boolean
  shift?: boolean
  handler: (e: KeyboardEvent) => void
}

function isTypingTarget(target: EventTarget | null) {
  if (!target || !(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function useKeyboardShortcuts(
  bindings: ShortcutBinding[],
  options?: { ignoreInputs?: boolean }
) {
  const ignoreInputs = options?.ignoreInputs ?? true

  function onKeydown(e: KeyboardEvent) {
    if (ignoreInputs && isTypingTarget(e.target)) return

    for (const b of bindings) {
      const keyMatch = e.key.toLowerCase() === b.key.toLowerCase()
      const mod = b.ctrlOrMeta ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey
      const shift = b.shift ? e.shiftKey : !e.shiftKey
      if (keyMatch && mod && shift) {
        e.preventDefault()
        b.handler(e)
        return
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
