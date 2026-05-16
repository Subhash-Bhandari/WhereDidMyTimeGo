<script setup lang="ts">
import type { Category } from '@/stores/categories'

definePageMeta({ middleware: 'auth' })

const categoriesStore = useCategoriesStore()
const toast = useToast()
const editing = ref<Category | null>(null)
const showForm = ref(false)
const saving = ref(false)

onMounted(() => categoriesStore.fetchCategories())

function startCreate() {
  editing.value = null
  showForm.value = true
}

function startEdit(c: Category) {
  editing.value = c
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editing.value = null
}

async function onSubmit(payload: { name: string; color: string; icon: string }) {
  saving.value = true
  try {
    if (editing.value) {
      await categoriesStore.updateCategory(editing.value.id, payload)
      toast.success('Category updated')
    } else {
      await categoriesStore.createCategory(payload)
      toast.success('Category created')
    }
    cancelForm()
  } catch {
    toast.error('Could not save category')
  } finally {
    saving.value = false
  }
}

async function onDelete(id: number) {
  try {
    await categoriesStore.deleteCategory(id)
    toast.success('Category deleted')
    if (editing.value?.id === id) cancelForm()
  } catch {
    toast.error('Could not delete category')
  }
}
</script>

<template>
  <section class="mx-auto max-w-lg space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Categories</h1>
      <UiButton v-if="!showForm" size="sm" @click="startCreate">New category</UiButton>
    </div>

    <CategoriesCategoryList
      :categories="categoriesStore.categories"
      @edit="startEdit"
      @delete="onDelete"
    />

    <UiCard v-if="showForm" class="p-4">
      <h2 class="mb-4 font-medium">{{ editing ? 'Edit category' : 'New category' }}</h2>
      <CategoriesCategoryForm
        :category="editing"
        @submit="onSubmit"
        @cancel="cancelForm"
      />
    </UiCard>
  </section>
</template>
