import { create } from 'zustand'
import { User, UserRole, JobResponse, ShopResponse } from '@/types'
import { apiClient, userApi } from '@/services/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: userApi.getCurrentUser(),
  token: apiClient.getToken(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userApi.login(email, password)
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as UserRole,
        walletBalance: response.user.walletBalance,
      }
      apiClient.setToken(response.token)
      userApi.setCurrentUser(user)
      set({ user, token: response.token, error: null })
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed'
      set({ error: errorMsg })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (name: string, email: string, password: string, role: UserRole) => {
    set({ isLoading: true, error: null })
    try {
      await userApi.register({ name, email, password, role })
      set({ error: null })
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Registration failed'
      set({ error: errorMsg })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    apiClient.logout()
    set({ user: null, token: null, error: null })
  },

  setUser: (user: User) => {
    set({ user })
  },

  clearError: () => {
    set({ error: null })
  },
}))

// Job Store
interface JobState {
  jobs: JobResponse[]
  selectedJob: JobResponse | null
  isLoading: boolean
  error: string | null

  setJobs: (jobs: JobResponse[]) => void
  setSelectedJob: (job: JobResponse | null) => void
  addJob: (job: JobResponse) => void
  updateJob: (job: JobResponse) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  selectedJob: null,
  isLoading: false,
  error: null,

  setJobs: (jobs) => set({ jobs }),
  setSelectedJob: (selectedJob) => set({ selectedJob }),
  addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
  updateJob: (job) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
      selectedJob: state.selectedJob?.id === job.id ? job : state.selectedJob,
    })),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}))

// Shop Store
interface ShopState {
  shops: ShopResponse[]
  selectedShop: ShopResponse | null
  isLoading: boolean
  error: string | null

  setShops: (shops: ShopResponse[]) => void
  setSelectedShop: (shop: ShopResponse | null) => void
  addShop: (shop: ShopResponse) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useShopStore = create<ShopState>((set) => ({
  shops: [],
  selectedShop: null,
  isLoading: false,
  error: null,

  setShops: (shops) => set({ shops }),
  setSelectedShop: (selectedShop) => set({ selectedShop }),
  addShop: (shop) => set((state) => ({ shops: [...state.shops, shop] })),
  setError: (error) => set({ error }),
  setLoading: (isLoading) => set({ isLoading }),
}))

