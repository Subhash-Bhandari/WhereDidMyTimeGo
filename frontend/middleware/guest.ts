export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  if (!auth.user) {
    await auth.fetchMe()
  }
  if (auth.user) {
    return navigateTo('/')
  }
})
