import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path ? 'border-b-2 border-blue-600 text-blue-600' : ''
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="font-bold text-2xl text-blue-600 hover:text-blue-700">
          📠 PrintPass
        </Link>

        {/* Navigation Links */}
        {user && (
          <div className="hidden md:flex items-center space-x-6">
            {user.role === 'STUDENT' && (
              <>
                <Link
                  to="/dashboard"
                  className={`py-2 px-1 border-b-2 border-transparent hover:border-blue-600 transition ${isActive(
                    '/dashboard'
                  )}`}
                >
                  My Jobs
                </Link>
                <Link
                  to="/shops"
                  className={`py-2 px-1 border-b-2 border-transparent hover:border-blue-600 transition ${isActive(
                    '/shops'
                  )}`}
                >
                  Shops
                </Link>
                <Link
                  to="/create-job"
                  className={`py-2 px-1 border-b-2 border-transparent hover:border-blue-600 transition ${isActive(
                    '/create-job'
                  )}`}
                >
                  New Job
                </Link>
              </>
            )}

            {user.role === 'VENDOR' && (
              <>
                <Link
                  to="/dashboard"
                  className={`py-2 px-1 border-b-2 border-transparent hover:border-blue-600 transition ${isActive(
                    '/dashboard'
                  )}`}
                >
                  My Shop
                </Link>
                <Link
                  to="/verify-job"
                  className={`py-2 px-1 border-b-2 border-transparent hover:border-blue-600 transition ${isActive(
                    '/verify-job'
                  )}`}
                >
                  Verify Job
                </Link>
              </>
            )}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-700">{user.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {user.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn-secondary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

