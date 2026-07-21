import React, { useEffect, useState } from 'react'
import { listAssigned, volunteerUpdate } from '../api/api'

export default function VolunteerDashboard(){
  const [list, setList] = useState([])
  async function load(){ const data = await listAssigned(); setList(data) }
  useEffect(()=>{ load() }, [])

  async function update(id){
    const status = prompt('Enter new status (in_transit, delivered):')
    if(!status) return
    await volunteerUpdate(id, status)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Assigned pickups', value: list.length },
          { label: 'Today’s deliveries', value: '4' },
          { label: 'Completed', value: '11' },
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
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Delivery board</p>
              <h2 className="text-2xl font-semibold text-slate-900">Assigned pickups</h2>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">Live updates</div>
          </div>
          <div className="space-y-3">
            {list.map(d=> (
              <div key={d.id} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{d.food_name}</p>
                    <div className="mt-1 text-sm text-slate-600">From: {d.donor_name} • Qty: {d.quantity}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{d.status}</span>
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Validation: {d.validation_status || 'pending'}</span>
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Priority: {d.priority || 'pending'}</span>
                    </div>
                  </div>
                  <button className="rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white" onClick={()=>update(d.id)}>Mark delivered</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="text-lg font-semibold text-slate-900">Route overview</h3>
          <div className="mt-4 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Delivery map placeholder for upcoming route optimization.
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 p-3">Pickup location: Downtown distribution hub</div>
            <div className="rounded-2xl border border-slate-200 p-3">Estimated arrival window: 20–30 min</div>
          </div>
        </div>
      </div>
    </div>
  )
}
