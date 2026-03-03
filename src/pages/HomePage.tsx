import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  if (user) {
    return null // Redirect handled in App.tsx
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container flex flex-col items-center justify-center min-h-screen text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            📠 PrintPass
          </h1>
          <p className="text-2xl text-gray-600 mb-2">
            Smart Print Job Management System
          </p>
          <p className="text-gray-600 max-w-2xl">
            Connect students with print shops. Get your documents printed with just a few clicks!
          </p>
        </div>

        <div className="flex gap-4 mb-12">
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-lg text-lg border-2 border-blue-600 transition"
          >
            Sign Up
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">For Students</h3>
            <p className="text-gray-600">
              Upload your documents, select a shop, and get them printed in minutes.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">For Shop Owners</h3>
            <p className="text-gray-600">
              Manage multiple shops, process jobs efficiently, and grow your business.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quick & Easy</h3>
            <p className="text-gray-600">
              Simple PIN-based verification. No complex processes, just print!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

