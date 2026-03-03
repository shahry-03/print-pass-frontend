import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useFormValidation } from '@/hooks'
import { Error as ErrorComponent, Success } from '@/components/common/Feedback'
import { UserRole } from '@/types'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT')

  const form = useFormValidation(
    { name: '', email: '', password: '', confirmPassword: '' },
    async (values) => {
      if (values.password !== values.confirmPassword) {
        setLocalError('Passwords do not match')
        return
      }

      try {
        await register(values.name, values.email, values.password, selectedRole)
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } catch (err: any) {
        setLocalError(err.response?.data?.message || 'Registration failed')
      }
    }
  )

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <Success
            message="Registration successful! Redirecting to login..."
            onDismiss={() => navigate('/login')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">📝 Sign Up</h1>

        {(error || localError) && (
          <ErrorComponent
            message={error || localError || ''}
            onDismiss={() => {
              clearError()
              setLocalError(null)
            }}
          />
        )}

        <form onSubmit={form.handleSubmit} className="space-y-4">
          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Account Type
            </label>
            <div className="flex gap-4">
              {['STUDENT', 'VENDOR'].map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium">{role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="John Doe"
              className="input-field"
              value={form.values.name}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              disabled={isLoading}
            />
            {form.errors.name && <p className="error-message">{form.errors.name}</p>}
          </div>

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

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              className="input-field"
              value={form.values.confirmPassword}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

