import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { jobApi } from '@/services/api'
import { Error as ErrorComponent, Success } from '@/components/common/Feedback'

export function CreateJobPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [isCreating, setIsCreating] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setErrorMsg('Please select a document to print')
      return
    }

    setIsCreating(true)
    setErrorMsg(null)

    try {
      // 🌟 JADOO: Backend ko form data bhej rahe hain bina kisi jhanjhat ke
      const formData = new FormData()
      formData.append('studentId', user?.id?.toString() || '')
      formData.append('shopId', '0') // Universal Mode (Koi dukan nahi)
      formData.append('documentName', selectedFile.name) // File ka asli naam bhej diya
      formData.append('totalPages', '1') // Default
      formData.append('isColor', 'false') // Default
      formData.append('file', selectedFile)

      const result = await jobApi.create(formData)

      // Success aur PIN display karna
      setSuccessMsg(`File Uploaded! Your PIN is: ${(result as any).pin}`)

      // 4 seconds ka wait taake user apna PIN parh sake
      setTimeout(() => {
        navigate('/dashboard')
      }, 4000)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload document')
    } finally {
      setIsCreating(false)
    }
  }

  return (
      <div className="container max-w-2xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">☁️ Upload Document</h1>
          <p className="text-gray-600">Select a file to get your Universal Print PIN</p>
        </div>

        {errorMsg && (
            <ErrorComponent message={errorMsg} onDismiss={() => setErrorMsg(null)} />
        )}

        {successMsg && (
            <Success message={successMsg} onDismiss={() => setSuccessMsg(null)} />
        )}

        <div className="card shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Sirf File Upload Box Bacha Hai! */}
            <div className="form-group">
              <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${selectedFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                <input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSelectedFile(file)
                        setErrorMsg(null) // Nayi file select karne par error hata do
                      }
                    }}
                    disabled={isCreating}
                />
                <label htmlFor="file" className="cursor-pointer block w-full h-full">
                  <div className="text-5xl mb-4">{selectedFile ? '📄' : '📁'}</div>
                  <p className="text-xl font-semibold text-gray-700 mb-2">
                    {selectedFile ? selectedFile.name : 'Click to select a file'}
                  </p>
                  <p className="text-sm text-gray-500">Supported: PDF, DOC, DOCX, TXT</p>
                </label>
              </div>
            </div>

            {/* Magic Submit Button */}
            <button
                type="submit"
                disabled={isCreating || !selectedFile}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-4 rounded-xl text-lg transition-all shadow-md"
            >
              {isCreating ? 'Uploading to Cloud... ☁️' : 'Get Print PIN 🚀'}
            </button>
          </form>
        </div>
      </div>
  )
}