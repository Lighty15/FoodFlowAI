import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, clearToken } from '../auth/auth'

export default function Navbar(){
  const user = getUser()
  const nav = useNavigate()
  function logout(){ clearToken(); nav('/login') }
  return (
    <header className="rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/20">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8h16" />
              <path d="M6 8V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
              <path d="M5 8h14l-1 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8Z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">FoodFlowAI</p>
            <p className="text-xs text-slate-500">Operations center</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 sm:block">
                <span className="font-semibold text-slate-900">{user.username}</span>
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 capitalize">{user.role}</span>
              </div>
              <button className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700" title="Notifications">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V10a6 6 0 1 0-12 0v4.2a2 2 0 0 1-.6 1.4L4 17h5" />
                  <path d="M10 19a2 2 0 0 0 4 0" />
                </svg>
              </button>
              <button className="btn-primary" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </div>
      </div>
    </header>
  )
}
