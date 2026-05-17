<script setup lang="ts">
import { Home, Plus, BarChart3, BookOpen, Settings } from 'lucide-vue-next'

const auth = useAuth()
const route = useRoute()
const shortcutsOpen = ref(false)
const { complete: completeOnboarding, shouldShow } = useOnboarding()
const showOnboarding = ref(false)
const { visible: nudgeVisible, evaluate: evaluateNudge, dismiss: dismissNudge } =
  useEveningReflectionNudge()

useKeyboardShortcuts([
  { key: 'a', handler: () => navigateTo('/add') },
  { key: 'd', handler: () => navigateTo('/') },
  { key: '?', handler: () => { shortcutsOpen.value = true } }
])

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/add', label: 'Add', icon: Plus },
  { to: '/analytics', label: 'Stats', icon: BarChart3 },
  { to: '/reflection', label: 'Reflect', icon: BookOpen }
]

function isActive(path: string) {
  return route.path === path
}

onMounted(async () => {
  await auth.fetchMe()
  showOnboarding.value = shouldShow(!!auth.user, route.path)
  if (auth.user) await evaluateNudge()
})

watch(
  () => route.path,
  async () => {
    if (auth.user) await evaluateNudge()
  }
)

function onOnboardingComplete() {
  completeOnboarding()
  showOnboarding.value = false
}

async function logout() {
  await auth.logout()
  await navigateTo('/login')
}

async function goReflect() {
  dismissNudge()
  await navigateTo('/reflection')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-0">
    <header class="border-b bg-white">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NuxtLink to="/" class="font-semibold">WhereDidMyTimeGo</NuxtLink>
        <ul class="hidden items-center gap-4 text-sm md:flex">
          <li v-for="tab in tabs" :key="tab.to">
            <NuxtLink
              :to="tab.to"
              class="inline-flex items-center gap-1.5 hover:underline"
              :class="{ 'font-semibold text-slate-900': isActive(tab.to) }"
            >
              <component :is="tab.icon" class="h-4 w-4" aria-hidden="true" />
              {{ tab.label }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/settings"
              class="inline-flex items-center gap-1.5 hover:underline"
              :class="{ 'font-semibold text-slate-900': isActive('/settings') }"
            >
              <Settings class="h-4 w-4" aria-hidden="true" />
              Categories
            </NuxtLink>
          </li>
          <li>
            <button type="button" class="text-slate-600 hover:underline" @click="logout">Sign out</button>
          </li>
        </ul>
        <motion class="flex items-center gap-3 md:hidden">
          <NuxtLink
            to="/settings"
            class="inline-flex items-center gap-1 text-sm text-slate-600 hover:underline"
            :class="{ 'font-semibold text-slate-900': isActive('/settings') }"
          >
            <Settings class="h-4 w-4" aria-hidden="true" />
            <span class="sr-only">Categories</span>
          </NuxtLink>
        </motion>
      </nav>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <slot />
    </main>

    <UiToaster />
    <CommonKeyboardShortcutsModal v-model="shortcutsOpen" />
    <CommonOnboardingTour v-if="showOnboarding" @complete="onOnboardingComplete" />
    <CommonEveningReflectionNudge
      :open="nudgeVisible"
      @dismiss="dismissNudge"
      @go-reflect="goReflect"
    />

    <nav
      class="fixed bottom-0 left-0 right-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 md:hidden"
      aria-label="Main navigation"
    >
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] transition-colors"
        :class="
          isActive(tab.to)
            ? 'font-semibold text-slate-900'
            : 'text-slate-500 hover:text-slate-700'
        "
        :aria-current="isActive(tab.to) ? 'page' : undefined"
      >
        <component
          :is="tab.icon"
          class="h-5 w-5"
          :class="isActive(tab.to) ? 'text-slate-900' : 'text-slate-400'"
          aria-hidden="true"
        />
        <span>{{ tab.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>
