interface LoadingProps {
  fullScreen?: boolean
  message?: string
}

export function Loading({ fullScreen = false, message = 'Loading...' }: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-700">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-700">{message}</p>
      </div>
    </div>
  )
}

interface ErrorProps {
  message: string
  onDismiss?: () => void
}

export function Error({ message, onDismiss }: ErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-400 hover:text-red-600">
            <span className="text-2xl">&times;</span>
          </button>
        )}
      </div>
    </div>
  )
}

interface SuccessProps {
  message: string
  onDismiss?: () => void
}

export function Success({ message, onDismiss }: SuccessProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-green-800">Success</h3>
          <p className="mt-1 text-sm text-green-700">{message}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-green-400 hover:text-green-600">
            <span className="text-2xl">&times;</span>
          </button>
        )}
      </div>
    </div>
  )
}

interface WarningProps {
  message: string
  onDismiss?: () => void
}

export function Warning({ message, onDismiss }: WarningProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
          <p className="mt-1 text-sm text-yellow-700">{message}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-yellow-400 hover:text-yellow-600">
            <span className="text-2xl">&times;</span>
          </button>
        )}
      </div>
    </div>
  )
}

