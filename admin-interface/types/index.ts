// ─── Shared TypeScript types for API responses ─────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface DashboardStats {
  totalProducts: number
  totalEnquiries: number
  featuredProducts: number
  activeProducts: number
  totalCategories: number
  latestEnquiries: {
    id: number
    customerName: string
    subject: string
    email: string
    createdAt: string
  }[]
  recentProducts: {
    id: number
    name: string
    price: string
    status: string
    createdAt: string
  }[]
}

export interface AdminUser {
  id: number
  username: string
  role: string
}
