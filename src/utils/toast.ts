// Toast notification service
export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

class ToastService {
  private listeners: ((toast: ToastMessage) => void)[] = []

  subscribe(listener: (toast: ToastMessage) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify(message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 3000) {
    const id = Date.now().toString()
    const toast: ToastMessage = { id, message, type, duration }

    this.listeners.forEach((listener) => listener(toast))

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id)
      }, duration)
    }
  }

  success(message: string, duration?: number) {
    this.notify(message, 'success', duration)
  }

  error(message: string, duration?: number) {
    this.notify(message, 'error', duration)
  }

  warning(message: string, duration?: number) {
    this.notify(message, 'warning', duration)
  }

  info(message: string, duration?: number) {
    this.notify(message, 'info', duration)
  }

  dismiss(_id: string) {
    // Implementation for dismissing toasts
  }
}

export const toastService = new ToastService()

