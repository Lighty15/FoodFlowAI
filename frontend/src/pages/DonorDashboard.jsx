import React, { useEffect, useState } from 'react'
import { createDonation, getTask, listAssigned } from '../api/api'

function TaskStatus({ taskId }){
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function check(){
    setLoading(true)
    const res = await getTask(taskId)
    setStatus(res)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Processing task</p>
          <p className="text-sm text-slate-500">{taskId}</p>
        </div>
        <button className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700" onClick={check}>{loading ? 'Checking…' : 'Refresh'}</button>
      </div>
      {status && <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-900 p-3 text-xs text-slate-100">{JSON.stringify(status, null, 2)}</pre>}
    </div>
  )
}

export default function DonorDashboard(){
  const [payload, setPayload] = useState({ donor_name: '', food_name: '', quantity: 1, location: '', expiry_hours: 24 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [donations, setDonations] = useState([])

  async function loadDonations(){
    const data = await listAssigned()
    setDonations(data || [])
  }

  useEffect(() => { loadDonations() }, [])

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    const res = await createDonation(payload)
    setResult(res)
    await loadDonations()
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total donations', value: '24' },
          { label: 'Accepted', value: '16' },
          { label: 'Pending', value: '5' },
          { label: 'Completed', value: '12' },
        ].map((item) => (
          <div key={item.label} className="card-surface p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Create donation</p>
              <h2 className="text-2xl font-semibold text-slate-900">Share surplus food</h2>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">AI ready</div>
          </div>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400" placeholder="Donor name" value={payload.donor_name} onChange={e=>setPayload({...payload, donor_name: e.target.value})} />
            <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400" placeholder="Food name" value={payload.food_name} onChange={e=>setPayload({...payload, food_name: e.target.value})} />
            <input type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400" placeholder="Quantity" value={payload.quantity} onChange={e=>setPayload({...payload, quantity: Number(e.target.value)})} />
            <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400" placeholder="Location" value={payload.location} onChange={e=>setPayload({...payload, location: e.target.value})} />
            <input type="number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-emerald-400" placeholder="Expiry hours" value={payload.expiry_hours} onChange={e=>setPayload({...payload, expiry_hours: Number(e.target.value)})} />
            <button className="btn-primary md:col-span-2" disabled={loading}>{loading ? 'Submitting…' : 'Submit donation'}</button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="card-surface p-5">
            <h3 className="text-lg font-semibold text-slate-900">AI processing result</h3>
            {result ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">Donation ID: {result.donation_id}</div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">Task ID: {result.task_id}</div>
                <TaskStatus taskId={result.task_id} />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No AI task yet. Submit a donation to begin the workflow.</div>
            )}
          </div>
          <div className="card-surface p-5">
            <h3 className="text-lg font-semibold text-slate-900">Recent activities</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {donations.slice(0, 3).map((donation) => (
                <div key={donation.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">{donation.food_name}</div>
                  <div className="mt-1">Status: {donation.status}</div>
                  <div className="mt-1">Validation: {donation.validation_status || 'pending'}</div>
                  <div className="mt-1">Priority: {donation.priority || 'pending'}</div>
                  <div className="mt-1">NGO: {donation.ngo_name || 'pending'}</div>
                  <div className="mt-1">Volunteer: {donation.volunteer_name || 'pending'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
