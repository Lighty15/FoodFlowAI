import React from 'react'
import { Navigate } from 'react-router-dom'
import { getUser } from '../auth/auth'

export default function ProtectedRoute({ role, children }){
  const user = getUser()
  if(!user){
    return <Navigate to="/login" replace />
  }
  if(role && user.role !== role && user.role !== 'admin'){
    return <div className="p-4 bg-red-100 text-red-700">Access denied</div>
  }
  return children
}
