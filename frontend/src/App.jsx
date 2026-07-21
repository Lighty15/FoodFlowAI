import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import DonorDashboard from './pages/DonorDashboard'
import NGODashboard from './pages/NGODashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Register from './pages/Register'
import AIAgentPage from './pages/AIAgentPage'

function AppShell({ children }) {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.12),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#f8fbff_100%)] px-3 py-3 text-slate-800 sm:px-4 lg:px-6">
      {!isAuthPage ? (
        <div className="mx-auto flex max-w-7xl gap-4 lg:gap-6">
          <Sidebar />
          <div className="flex-1">
            <Navbar />
            <main className="mt-4 rounded-[32px] border border-slate-200/70 bg-white/70 p-4 shadow-[0_24px_90px_-30px_rgba(15,23,42,0.35)] backdrop-blur md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  )
}

export default function App(){
  return (
    <AppShell>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/donor" replace />} />

        <Route path="/donor" element={<ProtectedRoute role="donor"><DonorDashboard /></ProtectedRoute>} />
        <Route path="/ngo" element={<ProtectedRoute role="ngo"><NGODashboard /></ProtectedRoute>} />
        <Route path="/volunteer" element={<ProtectedRoute role="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/ai" element={<ProtectedRoute><AIAgentPage /></ProtectedRoute>} />
      </Routes>
    </AppShell>
  )
}
