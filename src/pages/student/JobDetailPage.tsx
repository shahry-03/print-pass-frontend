import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { jobApi } from '@/services/api'
import { JobResponse } from '@/types'
import { Loading, Error as ErrorComponent } from '@/components/common/Feedback'

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<JobResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) {
        setError('Job ID not found')
        return
      }

      try {
        // Note: This endpoint might not exist, adjust based on actual API
        const jobs = await jobApi.getAll()
        const foundJob = Array.isArray(jobs)
          ? jobs.find((j: JobResponse) => j.id === parseInt(jobId))
          : null

        if (foundJob) {
          setJob(foundJob)
        } else {
          setError('Job not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load job details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [jobId])

  if (isLoading) return <Loading />

  if (error) return <ErrorComponent message={error} />

  if (!job) return <ErrorComponent message="Job not found" />

  const getStatusColor = (status: string) => {
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

  return (
    <div className="container max-w-2xl">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-blue-600 hover:text-blue-700 font-semibold"
      >
        ← Back to Dashboard
      </button>

      <div className="card">
        <div className="flex justify-between items-start mb-6 border-b pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.documentName}</h1>
            <p className="text-gray-600 mt-2">Job ID: #{job.id}</p>
          </div>
          <span className={`text-sm font-bold px-4 py-2 rounded-full ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-600 mb-2">Total Pages</p>
            <p className="text-2xl font-bold text-gray-900">{job.totalPages}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Total Cost</p>
            <p className="text-2xl font-bold text-blue-600">₹{job.totalCost.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Job ID:</span>
              <span className="font-medium text-gray-900">#{job.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Student ID:</span>
              <span className="font-medium text-gray-900">#{job.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shop ID:</span>
              <span className="font-medium text-gray-900">#{job.shopId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PIN:</span>
              <span className="font-mono font-bold text-lg text-gray-900">{job.pin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium px-3 py-1 rounded-full text-sm ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📌 Important</h3>
          <p className="text-gray-700 mb-2">
            Your unique PIN is: <span className="font-mono font-bold text-lg">{job.pin}</span>
          </p>
          <p className="text-sm text-gray-600">
            Keep this PIN safe. You will need it to verify your job when picking up your prints.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

