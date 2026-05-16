<script setup lang="ts">
const auth = useAuth()
const route = useRoute()

const tabs = [
  { to: '/', label: 'Home' },
  { to: '/add', label: 'Add' },
  { to: '/analytics', label: 'Stats' },
  { to: '/reflection', label: 'Reflect' }
]

async function logout() {
  await auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-0">
    <header class="border-b bg-white">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NuxtLink to="/" class="font-semibold">WhereDidMyTimeGo</NuxtLink>
        <ul class="hidden items-center gap-4 text-sm md:flex">
          <li v-for="tab in tabs" :key="tab.to">
            <NuxtLink :to="tab.to" class="hover:underline" :class="{ 'font-semibold': route.path === tab.to }">
              {{ tab.label }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/settings"
              class="hover:underline"
              :class="{ 'font-semibold': route.path === '/settings' }"
            >
              Categories
            </NuxtLink>
          </li>
          <li>
            <button type="button" class="text-slate-600 hover:underline" @click="logout">Sign out</button>
          </li>
        </ul>
        <div class="flex items-center gap-3 md:hidden">
          <NuxtLink
            to="/settings"
            class="text-sm text-slate-600 hover:underline"
            :class="{ 'font-semibold text-slate-900': route.path === '/settings' }"
          >
            Categories
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <slot />
    </main>

    <UiToaster />

    <nav
      class="fixed bottom-0 left-0 right-0 z-40 flex border-t bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex min-h-[48px] flex-1 flex-col items-center justify-center text-xs"
        :class="route.path === tab.to ? 'font-semibold text-slate-900' : 'text-slate-500'"
      >
        {{ tab.label }}
      </NuxtLink>
    </nav>
  </div>
</template>
