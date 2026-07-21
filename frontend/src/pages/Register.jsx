import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/api'

const roles = [
  { value: 'donor', title: 'Donor', description: 'Share surplus food and support local communities.' },
  { value: 'ngo', title: 'NGO', description: 'Receive and distribute food efficiently with AI suggestions.' },
  { value: 'volunteer', title: 'Volunteer', description: 'Coordinate transport and ensure on-time deliveries.' },
]

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('donor')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(username, password, role)
      setSuccess('Account created successfully! Redirecting to sign in…')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.16),_transparent_35%),linear-gradient(135deg,_#f8fafc_0%,_#eff6ff_100%)] px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_30px_100px_-30px_rgba(15,23,42,0.35)] lg:flex-row">
        <div className="flex flex-1 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 p-8 text-white lg:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Join the network</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">Create your FoodFlowAI account and power community impact.</h1>
            <p className="mt-4 max-w-md text-sm text-slate-300">Choose your role and start helping reduce food waste with intelligent matching and delivery support.</p>
          </div>
          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="font-semibold">Why FoodFlowAI?</p>
            <p className="mt-2 text-sm text-slate-300">Trusted by donors, NGOs, and volunteers to orchestrate rescue operations in real time.</p>
          </div>
        </div>
        <div className="flex-1 p-8 lg:p-10">
          <div className="mx-auto max-w-lg">
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-3xl font-semibold text-slate-900">Create account</h2>
              <p className="mt-2 text-sm text-slate-500">Select your role and set up your workspace.</p>
            </div>
            {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              {roles.map((item) => (
                <button key={item.value} type="button" onClick={() => setRole(item.value)} className={`rounded-2xl border p-3 text-left transition ${role === item.value ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Username</span>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white" value={username} onChange={(e)=>setUsername(e.target.value)} required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <input type="password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white" value={password} onChange={(e)=>setPassword(e.target.value)} required />
              </label>
              <button className="btn-primary w-full py-3" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?
              <Link to="/login" className="ml-1 font-semibold text-emerald-600">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}