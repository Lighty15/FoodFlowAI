import React, { useEffect, useState } from 'react'
import { listAssigned, ngoAccept } from '../api/api'

export default function NGODashboard(){
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  async function load(){
    setLoading(true)
    const data = await listAssigned()
    setList(data)
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  async function accept(id, val){
    await ngoAccept(id, val)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Assigned donations', value: list.length },
          { label: 'Accepted', value: '8' },
          { label: 'Pending review', value: '3' },
        ].map((item) => (
          <div key={item.label} className="card-surface p-4">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">NGO queue</p>
              <h2 className="text-2xl font-semibold text-slate-900">Donation requests</h2>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{loading ? 'Refreshing…' : 'Live'}</div>
          </div>
          {list.length===0 && <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No assigned donations right now.</div>}
          <div className="space-y-3">
            {list.map(d=> (
              <div key={d.id} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{d.food_name}</p>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{d.status}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">From: {d.donor_name} • Qty: {d.quantity}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">Validation: {d.validation_status || 'pending'}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">Priority: {d.priority || 'pending'}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">Volunteer: {d.volunteer_name || 'pending'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white" onClick={()=>accept(d.id, true)}>Accept</button>
                    <button className="rounded-2xl bg-red-500 px-3 py-2 text-sm font-semibold text-white" onClick={()=>accept(d.id, false)}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="text-lg font-semibold text-slate-900">Pickup insights</h3>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Next matching window</p>
            <p className="mt-2 text-sm text-slate-600">The AI engine is preparing the best volunteer and route suggestions for your current requests.</p>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 p-3">Priority donations are highlighted for rapid response.</div>
            <div className="rounded-2xl border border-slate-200 p-3">Delivery confidence is updated as volunteers confirm pickup.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
