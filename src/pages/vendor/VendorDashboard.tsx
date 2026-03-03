import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store'
import { useJobs, useShops } from '@/hooks'
import { Error as ErrorComponent, Success } from '@/components/common/Feedback'
import { JobStatus } from '@/types'

export function VendorDashboard() {
  const { user } = useAuthStore()
  const { jobs, fetchJobs, updateJobStatus } = useJobs()
  const { shops, fetchShops } = useShops()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchJobs()
    fetchShops()
  }, [])

  const vendorShops = shops.filter((shop) => shop.vendorId === user?.id)
  const vendorJobs = jobs.filter((job) => vendorShops.some((shop) => shop.id === job.shopId))

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

  const handleStatusUpdate = async (jobId: number, newStatus: JobStatus) => {
    try {
      await updateJobStatus(jobId, newStatus)
      setSuccessMsg('Job status updated successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setErrorMsg('Failed to update job status')
      setTimeout(() => setErrorMsg(null), 3000)
    }
  }

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🏪 Vendor Dashboard</h1>
        <p className="text-gray-600">Manage your shops and print jobs</p>
      </div>

      {errorMsg && (
        <ErrorComponent message={errorMsg} onDismiss={() => setErrorMsg(null)} />
      )}

      {successMsg && (
        <Success message={successMsg} onDismiss={() => setSuccessMsg(null)} />
      )}

      {/* Shops Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Shops</h2>
        {vendorShops.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">No shops found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorShops.map((shop) => (
              <div key={shop.id} className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{shop.shopName}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>📍 {shop.location}</p>
                  <p>💵 ₹{shop.perPageCost.toFixed(2)} per page</p>
                  <p className={shop.isOpen ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {shop.isOpen ? '✅ Open' : '❌ Closed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Jobs Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Jobs</h2>
        {vendorJobs.filter((j) => j.status === 'PENDING').length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">No pending jobs</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vendorJobs
              .filter((j) => j.status === 'PENDING')
              .map((job) => (
                <div key={job.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.documentName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">PIN: {job.pin}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                    <p>📄 Pages: {job.totalPages}</p>
                    <p>💰 Cost: ₹{job.totalCost.toFixed(2)}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(job.id, 'PROCESSING')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Start Processing
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(job.id, 'CANCELLED')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

