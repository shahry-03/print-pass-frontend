// API error handler
export class ApiErrorHandler {
  static handle(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message
    }

    if (error.response?.status === 400) {
      return 'Bad request. Please check your input.'
    }

    if (error.response?.status === 401) {
      return 'Unauthorized. Please login again.'
    }

    if (error.response?.status === 403) {
      return 'Forbidden. You do not have permission.'
    }

    if (error.response?.status === 404) {
      return 'Resource not found.'
    }

    if (error.response?.status === 409) {
      return 'Conflict. This resource already exists.'
    }

    if (error.response?.status === 500) {
      return 'Server error. Please try again later.'
    }

    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection.'
    }

    return error.message || 'An error occurred. Please try again.'
  }

  static isNetworkError(error: any): boolean {
    return error.message === 'Network Error' || !error.response
  }

  static isClientError(error: any): boolean {
    return error.response?.status >= 400 && error.response?.status < 500
  }

  static isServerError(error: any): boolean {
    return error.response?.status >= 500
  }

  static isUnauthorized(error: any): boolean {
    return error.response?.status === 401
  }

  static isForbidden(error: any): boolean {
    return error.response?.status === 403
  }
}

