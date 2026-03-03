// Format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`
}

// Format date
export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Generate PIN
export const generatePIN = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Validate email
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Validate phone number (Indian)
export const isValidPhone = (phone: string): boolean => {
  const re = /^[6-9]\d{9}$/
  return re.test(phone)
}

// Truncate text
export const truncate = (text: string, length: number): string => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Debounce function
export const debounce = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Local storage helpers
export const storage = {
  get: (key: string) => {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null')
    } catch {
      return null
    }
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key: string) => {
    localStorage.removeItem(key)
  },
  clear: () => {
    localStorage.clear()
  },
}

// Session storage helpers
export const sessionStorage = {
  get: (key: string) => {
    try {
      return JSON.parse(window.sessionStorage.getItem(key) || 'null')
    } catch {
      return null
    }
  },
  set: (key: string, value: any) => {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  },
  remove: (key: string) => {
    window.sessionStorage.removeItem(key)
  },
  clear: () => {
    window.sessionStorage.clear()
  },
}

