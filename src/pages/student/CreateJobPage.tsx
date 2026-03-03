import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useShops } from '@/hooks'
import { jobApi } from '@/services/api'
import { Error as ErrorComponent, Success } from '@/components/common/Feedback'
import { useFormValidation } from '@/hooks'

export function CreateJobPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { shops, fetchShops } = useShops()
  const [isCreating, setIsCreating] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchShops()
  }, [])

  const form = useFormValidation(
    {
      shopId: searchParams.get('shopId') || '',
      documentName: '',
      totalPages: '',
      isColor: false,
    },
    async (values) => {
      if (!selectedFile) {
        setErrorMsg('Please select a file')
        return
      }

      if (!values.shopId) {
        setErrorMsg('Please select a shop')
        return
      }

      setIsCreating(true)
      try {
        const formData = new FormData()
        formData.append('studentId', user?.id.toString() || '')
        formData.append('shopId', values.shopId)
        formData.append('documentName', values.documentName)
        formData.append('totalPages', values.totalPages)
        formData.append('isColor', values.isColor.toString())
        formData.append('file', selectedFile)

        const result = await jobApi.create(formData)
        setSuccessMsg(`Job created successfully! PIN: ${(result as any).pin}`)

        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Failed to create job')
      } finally {
        setIsCreating(false)
      }
    }
  )

  const selectedShop = shops.find((s) => s.id === parseInt(form.values.shopId || '0'))
  const estimatedCost = selectedShop && form.values.totalPages
    ? (selectedShop.perPageCost * parseInt(form.values.totalPages)).toFixed(2)
    : '0.00'

  return (
    <div className="container max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Create Print Job</h1>
        <p className="text-gray-600">Upload your document and set printing preferences</p>
      </div>

      {errorMsg && (
        <ErrorComponent message={errorMsg} onDismiss={() => setErrorMsg(null)} />
      )}

      {successMsg && (
        <Success message={successMsg} onDismiss={() => setSuccessMsg(null)} />
      )}

      <div className="card">
        <form onSubmit={form.handleSubmit} className="space-y-6">
          {/* Shop Selection */}
          <div className="form-group">
            <label htmlFor="shopId" className="form-label">
              Select Shop *
            </label>
            <select
              id="shopId"
              name="shopId"
              className="input-field"
              value={form.values.shopId}
              onChange={form.handleChange}
              disabled={isCreating}
            >
              <option value="">Choose a shop...</option>
              {shops.filter((s) => s.isOpen).map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.shopName} - ₹{shop.perPageCost.toFixed(2)}/page ({shop.location})
                </option>
              ))}
            </select>
            {form.errors.shopId && <p className="error-message">{form.errors.shopId}</p>}
          </div>

          {/* Document Name */}
          <div className="form-group">
            <label htmlFor="documentName" className="form-label">
              Document Name *
            </label>
            <input
              id="documentName"
              type="text"
              name="documentName"
              placeholder="e.g., Assignment-001, Project Report"
              className="input-field"
              value={form.values.documentName}
              onChange={form.handleChange}
              disabled={isCreating}
            />
            {form.errors.documentName && (
              <p className="error-message">{form.errors.documentName}</p>
            )}
          </div>

          {/* Total Pages */}
          <div className="form-group">
            <label htmlFor="totalPages" className="form-label">
              Total Pages *
            </label>
            <input
              id="totalPages"
              type="number"
              name="totalPages"
              placeholder="10"
              className="input-field"
              min="1"
              value={form.values.totalPages}
              onChange={form.handleChange}
              disabled={isCreating}
            />
            {form.errors.totalPages && (
              <p className="error-message">{form.errors.totalPages}</p>
            )}
          </div>

          {/* Color Option */}
          <div className="form-group">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isColor"
                checked={form.values.isColor}
                onChange={form.handleChange}
                disabled={isCreating}
              />
              <span className="text-sm font-medium text-gray-700">Color Printing</span>
            </label>
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label htmlFor="file" className="form-label">
              Upload Document *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedFile(file)
                  }
                }}
                disabled={isCreating}
              />
              <label htmlFor="file" className="cursor-pointer">
                <p className="text-gray-600 mb-2">
                  {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
                </p>
                <p className="text-xs text-gray-500">Supported: PDF, DOC, DOCX, TXT</p>
              </label>
            </div>
          </div>

          {/* Cost Estimation */}
          {selectedShop && form.values.totalPages && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Estimated Cost:</p>
              <p className="text-2xl font-bold text-blue-600">₹{estimatedCost}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {isCreating ? 'Creating Job...' : 'Create Job'}
          </button>
        </form>
      </div>
    </div>
  )
}

