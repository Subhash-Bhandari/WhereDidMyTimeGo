<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: false })

const auth = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const route = useRoute()

onMounted(() => {
  if (route.query.expired === '1') {
    error.value = 'Your session expired. Please sign in again.'
  }
})

async function onSubmit() {
  error.value = ''
  try {
    await auth.login({ email: email.value, password: password.value })
    await navigateTo('/')
  } catch {
    error.value = 'Invalid email or password'
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <UiCard class="w-full max-w-md p-6">
      <h1 class="mb-4 text-2xl font-semibold">Sign in</h1>
      <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-1">
          <UiLabel>Email</UiLabel>
          <UiInput v-model="email" type="email" placeholder="you@example.com" />
        </div>
        <div class="space-y-1">
          <UiLabel>Password</UiLabel>
          <UiInput v-model="password" type="password" />
        </div>
        <UiButton type="submit" class="w-full" size="lg">Sign in</UiButton>
      </form>
      <p class="mt-4 text-center text-sm text-slate-600">
        No account?
        <NuxtLink to="/register" class="font-medium text-slate-900 underline">Register</NuxtLink>
      </p>
    </UiCard>
  </div>
</template>
