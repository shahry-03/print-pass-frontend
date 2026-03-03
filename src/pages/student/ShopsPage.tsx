import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShops } from '@/hooks'
import { Loading, Error as ErrorComponent } from '@/components/common/Feedback'

export function ShopsPage() {
  const { shops, isLoading, error, fetchShops } = useShops()
  const navigate = useNavigate()

  useEffect(() => {
    fetchShops()
  }, [])

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🏪 Available Shops</h1>
        <p className="text-gray-600">Find and select a shop to submit your print job</p>
      </div>

      {error && <ErrorComponent message={error} />}

      {isLoading ? (
        <Loading />
      ) : shops.filter((shop) => shop.isOpen).length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No shops available right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops
            .filter((shop) => shop.isOpen)
            .map((shop) => (
              <div key={shop.id} className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{shop.shopName}</h3>
                <div className="space-y-2 text-gray-600 mb-6">
                  <p>📍 Location: {shop.location}</p>
                  <p>💵 Price per page: ₹{shop.perPageCost.toFixed(2)}</p>
                  <p className="text-green-600 font-semibold">✅ Open</p>
                </div>
                <button
                  onClick={() => navigate(`/create-job?shopId=${shop.id}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Select Shop
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

