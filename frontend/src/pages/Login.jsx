import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/api'
import { saveToken, saveUser } from '../auth/auth'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      const data = await login(username, password)
      saveToken(data.access_token)
      const resp = await fetch(`${import.meta.env.VITE_API_BASE||'http://localhost:8000'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` }
      })
      const user = await resp.json()
      saveUser(user)
      if(user.role === 'donor') nav('/donor')
      else if(user.role === 'ngo') nav('/ngo')
      else if(user.role === 'volunteer') nav('/volunteer')
      else nav('/admin')
    }catch(err){
      setError('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.16),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eff6ff_100%)] px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_30px_100px_-30px_rgba(15,23,42,0.35)] lg:flex-row">
        <div className="flex flex-1 flex-col justify-between bg-gradient-to-br from-emerald-600 via-emerald-500 to-blue-600 p-8 text-white lg:p-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 8h16" />
                  <path d="M6 8V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
                  <path d="M5 8h14l-1 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8Z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-semibold">FoodFlowAI</p>
                <p className="text-sm text-emerald-50">AI-powered food redistribution</p>
              </div>
            </div>
            <h1 className="mt-10 text-3xl font-semibold leading-tight sm:text-4xl">Welcome back to your intelligent food rescue hub.</h1>
            <p className="mt-4 max-w-md text-sm text-emerald-50/90 sm:text-base">Coordinate donations, accelerate approvals, and keep communities fed with the power of AI guidance.</p>
          </div>
          <div className="mt-8 rounded-[24px] border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/20" />
              <div>
                <p className="font-semibold">Live AI workflow</p>
                <p className="text-sm text-emerald-50/90">Validation, prioritization, matching, and delivery tracking in one place.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 lg:p-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Secure access</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">Use your FoodFlowAI account to continue.</p>
            </div>
            {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Username</span>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white" value={username} onChange={e=>setUsername(e.target.value)} required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-emerald-400 focus-within:bg-white">
                  <input type={showPassword ? 'text' : 'password'} className="w-full bg-transparent outline-none" value={password} onChange={e=>setPassword(e.target.value)} required />
                  <button type="button" className="ml-2 text-sm font-medium text-slate-500" onClick={()=>setShowPassword(v=>!v)}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
              </label>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-500">
                  <input type="checkbox" className="rounded border-slate-300 text-emerald-600" />
                  Remember me
                </label>
                <a href="#" className="font-medium text-emerald-600">Forgot password?</a>
              </div>
              <button className="btn-primary w-full py-3" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              New to FoodFlowAI?
              <Link to="/register" className="ml-1 font-semibold text-emerald-600">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
