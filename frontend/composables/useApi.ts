type ApiOptions = {
  method?: string
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
}

export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const query = options.query
      ? '?' +
        new URLSearchParams(
          Object.entries(options.query)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : ''

    try {
      return await $fetch<T>(`${baseURL}${path}${query}`, {
        method: (options.method ?? 'GET') as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        body: options.body,
        credentials: 'include'
      })
    } catch (err: unknown) {
      const status =
        err && typeof err === 'object' && 'statusCode' in err
          ? (err as { statusCode: number }).statusCode
          : undefined

      if (status === 401 && import.meta.client) {
        await navigateTo({
          path: '/login',
          query: { expired: '1' }
        })
        throw new Error('Session expired. Please sign in again.')
      }
      throw err
    }
  }

  return { api }
}
