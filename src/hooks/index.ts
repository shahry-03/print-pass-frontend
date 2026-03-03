import { useState, useCallback, useEffect } from 'react'
import { jobApi, shopApi } from '@/services/api'
import { JobResponse, ShopResponse, JobStatus } from '@/types'

// useAsync Hook
export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<E | null>(null)

  const execute = useCallback(async () => {
    setStatus('pending')
    setValue(null)
    setError(null)
    try {
      const response = await asyncFunction()
      setValue(response)
      setStatus('success')
      return response
    } catch (error) {
      setError(error as E)
      setStatus('error')
      throw error
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, value, error }
}

// useJobs Hook
export function useJobs() {
  const [jobs, setJobs] = useState<JobResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await jobApi.getAll()
      setJobs(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createJob = useCallback(
    async (jobData: FormData) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await jobApi.create(jobData)
        setJobs((prev) => [...prev, data as JobResponse])
        return data
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to create job'
        setError(errorMsg)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const updateJobStatus = useCallback(
    async (jobId: number, newStatus: JobStatus) => {
      setError(null)
      try {
        const data = await jobApi.updateStatus(jobId, newStatus)
        setJobs((prev) => prev.map((job) => (job.id === jobId ? (data as JobResponse) : job)))
        return data
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to update job status'
        setError(errorMsg)
        throw err
      }
    },
    []
  )

  const verifyPin = useCallback(async (pin: string) => {
    setError(null)
    try {
      return await jobApi.verifyPin(pin)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid PIN'
      setError(errorMsg)
      throw err
    }
  }, [])

  return {
    jobs,
    isLoading,
    error,
    fetchJobs,
    createJob,
    updateJobStatus,
    verifyPin,
  }
}

// useShops Hook
export function useShops() {
  const [shops, setShops] = useState<ShopResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchShops = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await shopApi.getAll()
      setShops(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shops')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createShop = useCallback(
    async (shopData: any) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await shopApi.create(shopData)
        setShops((prev) => [...prev, data as ShopResponse])
        return data
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to create shop'
        setError(errorMsg)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    shops,
    isLoading,
    error,
    fetchShops,
    createShop,
  }
}

// useFormValidation Hook
export function useFormValidation<T>(initialValues: T, onSubmit: (values: T) => Promise<void>) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target
      const actualValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

      setValues((prev) => ({
        ...prev,
        [name]: actualValue,
      }))

      if (touched[name]) {
        validateField(name, actualValue)
      }
    },
    [touched]
  )

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))
    validateField(name, value)
  }, [])

  const validateField = (name: string, value: any) => {
    let error = ''

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        error = 'Invalid email address'
      }
    } else if (name === 'password') {
      if (value.length < 6) {
        error = 'Password must be at least 6 characters'
      }
    } else if (name === 'name') {
      if (value.trim().length < 2) {
        error = 'Name must be at least 2 characters'
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
  }
}

