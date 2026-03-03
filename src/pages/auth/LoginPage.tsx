import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useFormValidation } from '@/hooks'
import { Error as ErrorComponent } from '@/components/common/Feedback'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [localError, setLocalError] = useState<string | null>(null)

  const form = useFormValidation(
    { email: '', password: '' },
    async (values) => {
      try {
        await login(values.email, values.password)
        navigate('/dashboard')
      } catch (err: any) {
        setLocalError(err.response?.data?.message || 'Login failed')
      }
    }
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">🔐 Login</h1>

        {(error || localError) && (
          <ErrorComponent
            message={error || localError || ''}
            onDismiss={() => {
              clearError()
              setLocalError(null)
            }}
          />
        )}

        <form onSubmit={form.handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              className="input-field"
              value={form.values.email}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              disabled={isLoading}
            />
            {form.errors.email && <p className="error-message">{form.errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              className="input-field"
              value={form.values.password}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              disabled={isLoading}
            />
            {form.errors.password && <p className="error-message">{form.errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

