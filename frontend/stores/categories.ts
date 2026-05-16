import { defineStore } from 'pinia'

export type Category = {
  id: number
  userId: number
  name: string
  color: string
  icon: string
}

export type CategoryInput = {
  name: string
  color: string
  icon: string
}

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([])
  const { api } = useApi()

  async function fetchCategories() {
    categories.value = await api<Category[]>('/api/categories')
  }

  async function createCategory(input: CategoryInput) {
    const row = await api<Category>('/api/categories', {
      method: 'POST',
      body: input
    })
    await fetchCategories()
    return row
  }

  async function updateCategory(id: number, input: Partial<CategoryInput>) {
    const row = await api<Category>(`/api/categories/${id}`, {
      method: 'PATCH',
      body: input
    })
    await fetchCategories()
    return row
  }

  async function deleteCategory(id: number) {
    await api(`/api/categories/${id}`, { method: 'DELETE' })
    await fetchCategories()
  }

  return { categories, fetchCategories, createCategory, updateCategory, deleteCategory }
})
