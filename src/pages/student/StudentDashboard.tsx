import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useJobs } from '@/hooks'
import { Loading, Error as ErrorComponent } from '@/components/common/Feedback'
import { JobStatus } from '@/types'

export function StudentDashboard() {
  const { user } = useAuthStore()
  const { jobs, isLoading, error, fetchJobs } = useJobs()
  const navigate = useNavigate()

  useEffect(() => {
    fetchJobs()
  }, [])

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'READY':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const userJobs = jobs.filter((job) => job.studentId === user?.id)

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">👤 Welcome, {user?.name}!</h1>
        <p className="text-gray-600">Wallet Balance: ₹{user?.walletBalance?.toFixed(2) || '0.00'}</p>
      </div>

      {error && <ErrorComponent message={error} />}

      <div className="mb-8 flex gap-4">
        <button
          onClick={() => navigate('/create-job')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          📄 Create New Job
        </button>
        <button
          onClick={() => navigate('/shops')}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          🏪 Browse Shops
        </button>
      </div>

      {isLoading ? (
        <Loading />
      ) : userJobs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No print jobs yet</p>
          <button
            onClick={() => navigate('/create-job')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Upload File to Print
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userJobs.map((job) => (
            <div key={job.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{job.documentName}</h3>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>📄 Pages: {job.totalPages}</p>
                <p>💰 Cost: ₹{job.totalCost.toFixed(2)}</p>
                <p>🔑 PIN: <span className="font-mono font-bold text-gray-900">{job.pin}</span></p>
              </div>
              <button
                onClick={() => navigate(`/job/${job.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

