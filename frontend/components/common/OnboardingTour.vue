<script setup lang="ts">
const emit = defineEmits<{ complete: [] }>()

const step = ref(0)

const steps = [
  {
    title: 'Log in one phrase',
    body: 'On Quick Add, type something like “DSA 2h” and we suggest title, duration, and category before you save.',
    cta: 'Try Quick Add',
    to: '/add'
  },
  {
    title: 'See weekly insights',
    body: 'Analytics highlights time leaks, your best focus hours, and how productivity tracks with coding time.',
    cta: 'Open Analytics',
    to: '/analytics'
  },
  {
    title: 'Build a reflection streak',
    body: 'Save a daily reflection to grow your streak and review the last 30 days on the reflection screen.',
    cta: 'Go to Reflection',
    to: '/reflection'
  }
]

const current = computed(() => steps[step.value]!)

function next() {
  if (step.value < steps.length - 1) {
    step.value++
    return
  }
  emit('complete')
}

function skip() {
  emit('complete')
}

async function goToStep() {
  await navigateTo(current.value.to)
  next()
}
</script>

<template>
  <div
    class="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
    role="dialog"
    aria-modal="true"
    aria-labelledby="onboarding-title"
  >
    <UiCard class="w-full max-w-md p-6 shadow-xl">
      <p class="text-xs font-medium uppercase tracking-wide text-violet-600">
        Step {{ step + 1 }} of {{ steps.length }}
      </p>
      <h2 id="onboarding-title" class="mt-2 text-lg font-semibold">{{ current.title }}</h2>
      <p class="mt-2 text-sm text-slate-600">{{ current.body }}</p>
      <div class="mt-6 flex flex-wrap gap-2">
        <UiButton variant="outline" size="sm" @click="skip">Skip tour</UiButton>
        <UiButton size="sm" @click="goToStep">{{ current.cta }}</UiButton>
        <UiButton v-if="step === steps.length - 1" size="sm" variant="outline" @click="next">
          Done
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>
