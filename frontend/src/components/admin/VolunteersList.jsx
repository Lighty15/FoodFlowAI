import React, { useEffect, useState } from 'react'
import { listVolunteers, createVolunteer, updateVolunteer } from '../../api/admin'
import VolunteerFormModal from './VolunteerFormModal'

export default function VolunteersList(){
  const [vols, setVols] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)

  async function load(){
    setLoading(true); setError(null)
    try{ const resp = await listVolunteers(); setVols(resp.items || []) }catch(e){ setError(e.message) }
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  return (
    <div className="card-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Volunteers</h3>
          <p className="text-sm text-slate-500">Dispatch and delivery support</p>
        </div>
        <button className="rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white" onClick={()=>setEditing({})}>Create</button>
      </div>
      {loading && <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Loading...</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <ul className="space-y-2">
        {vols.map(v=> (
          <li key={v.id} className="flex flex-col gap-2 rounded-[16px] border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium text-slate-900">{v.volunteer_name}</div>
              <div className="text-sm text-slate-600">{v.location} • {v.status}</div>
            </div>
            <button className="rounded-2xl bg-blue-600 px-2.5 py-1.5 text-sm text-white" onClick={()=>setEditing(v)}>Edit</button>
          </li>
        ))}
      </ul>
      {editing && <VolunteerFormModal volunteer={editing} onClose={()=>{setEditing(null); load()}} />}
    </div>
  )
}
