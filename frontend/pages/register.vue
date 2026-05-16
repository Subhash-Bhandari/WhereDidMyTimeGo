<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: false })

const auth = useAuth()
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

async function onSubmit() {
  error.value = ''
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  try {
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value
    })
    await navigateTo('/')
  } catch {
    error.value = 'Could not create account. Email may already be in use.'
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <UiCard class="w-full max-w-md p-6">
      <h1 class="mb-4 text-2xl font-semibold">Create account</h1>
      <p v-if="error" class="mb-3 text-sm text-red-600">{{ error }}</p>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-1">
          <UiLabel>Name</UiLabel>
          <UiInput v-model="name" placeholder="Your name" />
        </div>
        <div class="space-y-1">
          <UiLabel>Email</UiLabel>
          <UiInput v-model="email" type="email" />
        </div>
        <div class="space-y-1">
          <UiLabel>Password</UiLabel>
          <UiInput v-model="password" type="password" />
          <p class="text-xs text-slate-500">At least 8 characters</p>
        </div>
        <UiButton type="submit" class="w-full" size="lg">Register</UiButton>
      </form>
      <p class="mt-4 text-center text-sm text-slate-600">
        Already have an account?
        <NuxtLink to="/login" class="font-medium text-slate-900 underline">Sign in</NuxtLink>
      </p>
    </UiCard>
  </div>
</template>
