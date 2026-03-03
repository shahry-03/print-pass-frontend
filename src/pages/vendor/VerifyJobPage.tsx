import { useState } from 'react'
import { jobApi } from '@/services/api'
import { Error as ErrorComponent, Success } from '@/components/common/Feedback'

export function VerifyJobPage() {
  const [pin, setPin] = useState('')
  const [jobData, setJobData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim()) {
      setError('Please enter a PIN')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await jobApi.verifyPin(pin)
      setJobData(result)
      setSuccessMsg('PIN verified successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid PIN')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true)
    setError(null)

    try {
      await jobApi.updateStatus(jobData.id, newStatus)
      setSuccessMsg(`Job status updated to ${newStatus}`)
      setJobData(null)
      setPin('')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const fileName = jobData.documentName
      await jobApi.downloadFile(fileName)
    } catch (err: any) {
      setError('Failed to download file')
    }
  }

  return (
    <div className="container max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🔍 Verify Job PIN</h1>
        <p className="text-gray-600">Enter the customer's PIN to verify and manage their job</p>
      </div>

      {error && <ErrorComponent message={error} onDismiss={() => setError(null)} />}

      {successMsg && <Success message={successMsg} onDismiss={() => setSuccessMsg(null)} />}

      {!jobData ? (
        <div className="card">
          <form onSubmit={handleVerifyPin} className="space-y-6">
            <div className="form-group">
              <label htmlFor="pin" className="form-label">
                Enter PIN
              </label>
              <input
                id="pin"
                type="text"
                placeholder="Enter the 6-digit PIN"
                className="input-field text-2xl tracking-widest text-center font-mono"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                disabled={isLoading}
                maxLength={10}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
            >
              {isLoading ? 'Verifying...' : 'Verify PIN'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card space-y-6">
          <div className="border-b pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Document Name</p>
                <p className="font-semibold text-gray-900">{jobData.documentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pages</p>
                <p className="font-semibold text-gray-900">{jobData.totalPages}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="font-semibold text-gray-900">₹{jobData.totalCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="font-semibold text-gray-900">{jobData.status}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {jobData.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('PROCESSING')}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Start Processing
                </button>
              </>
            )}

            {jobData.status === 'PROCESSING' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('READY')}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Mark as Ready
                </button>
              </>
            )}

            {jobData.status === 'READY' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('COMPLETED')}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Mark as Completed
                </button>
              </>
            )}

            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg"
            >
              📥 Download File
            </button>

            <button
              onClick={() => {
                setJobData(null)
                setPin('')
              }}
              disabled={isLoading}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

