export interface ProductFiltersState {
  search: string
  status: "all" | "active" | "inactive"
  category: string | "all"
}

