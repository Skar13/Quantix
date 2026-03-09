import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import MasterBOQ from '@/pages/MasterBOQ'
import BillingEntry from '@/pages/BillingEntry'
import { Reports, Materials, Advances, Variation, BBS, Users, Plans } from '@/pages/OtherPages'
import Projects from '@/pages/Projects'
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="boq" element={<MasterBOQ />} />
        <Route path="billing" element={<BillingEntry />} />
        <Route path="materials" element={<Materials />} />
        <Route path="advances" element={<Advances />} />
        <Route path="reports" element={<Reports />} />
        <Route path="variation" element={<Variation />} />
        <Route path="bbs" element={<BBS />} />
        <Route path="users" element={<Users />} />
        <Route path="plans" element={<Plans />} />
        <Route path="projects" element={<Projects />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
