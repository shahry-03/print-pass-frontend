import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { Navbar } from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Pages
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { StudentDashboard } from '@/pages/student/StudentDashboard'
import { ShopsPage } from '@/pages/student/ShopsPage'
import { CreateJobPage } from '@/pages/student/CreateJobPage'
import { VendorDashboard } from '@/pages/vendor/VendorDashboard'
import { VerifyJobPage } from '@/pages/vendor/VerifyJobPage'

function App() {
  const { user } = useAuthStore()

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

        {/* Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shops"
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <ShopsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-job"
          element={
            <ProtectedRoute requiredRole="STUDENT">
              <CreateJobPage />
            </ProtectedRoute>
          }
        />

        {/* Vendor Routes */}
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute requiredRole="VENDOR">
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verify-job"
          element={
            <ProtectedRoute requiredRole="VENDOR">
              <VerifyJobPage />
            </ProtectedRoute>
          }
        />

        {/* Override dashboard for vendors */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {user?.role === 'VENDOR' ? <VendorDashboard /> : <StudentDashboard />}
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App

