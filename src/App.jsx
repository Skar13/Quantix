import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import MasterBOQ from '@/pages/MasterBOQ'
import { BillingEntry } from '@/pages/BillingEntry'
import { Materials, Advances, Reports, Users, Plans, Variation, BBS } from '@/pages/OtherPages'

function PrivateRoute({ children }) {
  const isAuth = useAuthStore(state => state.isAuthenticated)
  return isAuth ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="boq" element={<MasterBOQ />} />
        <Route path="billing" element={<BillingEntry />} />
        <Route path="materials" element={<Materials />} />
        <Route path="advances" element={<Advances />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<Users />} />
        <Route path="plans" element={<Plans />} />
        <Route path="variation" element={<Variation />} />
        <Route path="bbs" element={<BBS />} />
      </Route>
    </Routes>
  )
}
