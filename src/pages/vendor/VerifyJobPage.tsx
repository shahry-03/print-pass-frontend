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

      // Auto-refresh data instead of completely clearing it
      if (newStatus === 'COMPLETED') {
        setJobData(null)
        setPin('')
      } else {
        setJobData({ ...jobData, status: newStatus })
      }

      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status')
    } finally {
      setIsLoading(false)
    }
  }

  // 🌟 JADOO 1: The Cloud Download Fix
  const handleDownload = () => {
    if (jobData?.documentName && jobData.documentName.startsWith('http')) {
      // API call ke bajaye seedha Cloud Link naye tab mein khol do!
      window.open(jobData.documentName, '_blank')
    } else {
      setError('File is deleted or URL is invalid')
    }
  }

  // 🌟 JADOO 2: The Beautiful Name Fix (Lambe URL ko chupa dega)
  const getDisplayName = (url: string) => {
    if (!url || !url.startsWith('http')) return url;
    return url.split('/').pop()?.substring(0, 30) + '...' || 'Document.pdf';
  }

  return (
      <div className="container max-w-2xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔍 Verify Job PIN</h1>
          <p className="text-gray-600">Enter the customer's PIN to fetch their cloud document</p>
        </div>

        {error && <ErrorComponent message={error} onDismiss={() => setError(null)} />}
        {successMsg && <Success message={successMsg} onDismiss={() => setSuccessMsg(null)} />}

        {!jobData ? (
            <div className="card shadow-lg p-8">
              <form onSubmit={handleVerifyPin} className="space-y-6">
                <div className="form-group">
                  <input
                      id="pin"
                      type="text"
                      placeholder="Enter 6-Digit PIN"
                      className="input-field text-4xl tracking-[0.5em] text-center font-mono py-6 border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').substring(0, 6))}
                      disabled={isLoading}
                  />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || pin.length < 6}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-4 rounded-xl text-lg transition shadow-md"
                >
                  {isLoading ? 'Verifying... ⏳' : 'Verify PIN 🚀'}
                </button>
              </form>
            </div>
        ) : (
            <div className="card shadow-lg p-8 space-y-8">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-blue-200 pb-2">📋 Job Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Document</p>
                    {/* 🌟 Sirf chota naam nazar aayega, hover par poora link */}
                    <p className="font-bold text-blue-700 text-lg break-all" title={jobData.documentName}>
                      {getDisplayName(jobData.documentName)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pages</p>
                    <p className="font-bold text-gray-900 text-xl">{jobData.totalPages}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Bill</p>
                    <p className="font-bold text-green-600 text-xl">₹{jobData.totalCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
                  {jobData.status}
                </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* The Magic Download Button */}
                <button
                    onClick={handleDownload}
                    disabled={isLoading || jobData.status === 'COMPLETED'}
                    className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold py-4 px-4 rounded-xl text-lg transition shadow-md flex items-center justify-center gap-2"
                >
                  📥 Download File From Cloud
                </button>

                {jobData.status === 'PENDING' && (
                    <button
                        onClick={() => handleStatusUpdate('PROCESSING')}
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition"
                    >
                      ⚙️ Start Processing
                    </button>
                )}

                {jobData.status === 'PROCESSING' && (
                    <button
                        onClick={() => handleStatusUpdate('READY')}
                        disabled={isLoading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition"
                    >
                      ✅ Mark as Ready
                    </button>
                )}

                {jobData.status === 'READY' && (
                    <button
                        onClick={() => handleStatusUpdate('COMPLETED')}
                        disabled={isLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition"
                    >
                      🎉 Handover & Delete File (Complete)
                    </button>
                )}

                <button
                    onClick={() => {
                      setJobData(null)
                      setPin('')
                    }}
                    disabled={isLoading}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition mt-4"
                >
                  🔙 Go Back
                </button>
              </div>
            </div>
        )}
      </div>
  )
}