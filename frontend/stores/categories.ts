import { defineStore } from 'pinia'

export type Category = {
  id: number
  userId: number
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

  return { categories, fetchCategories }
})
