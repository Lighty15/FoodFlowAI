import React, { useEffect, useState } from 'react'
import { listNgos, createNgo, updateNgo, deleteNgo } from '../../api/admin'
import NGOFormModal from './NGOFormModal'

export default function NGOsList(){
  const [ngos, setNgos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)

  async function load(){
    setLoading(true); setError(null)
    try{ const resp = await listNgos(); setNgos(resp.items || []) }catch(e){ setError(e.message) }
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  async function remove(id){
    if(!confirm('Delete NGO?')) return
    try{ await deleteNgo(id); load() }catch(e){ setError(e.message) }
  }

  return (
    <div className="card-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">NGOs</h3>
          <p className="text-sm text-slate-500">Partner organizations</p>
        </div>
        <button className="rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white" onClick={()=>setEditing({})}>Create</button>
      </div>
      {loading && <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Loading...</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <ul className="space-y-2">
        {ngos.map(n=> (
          <li key={n.id} className="flex flex-col gap-2 rounded-[16px] border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium text-slate-900">{n.ngo_name}</div>
              <div className="text-sm text-slate-600">{n.location} • {n.status}</div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="rounded-2xl bg-blue-600 px-2.5 py-1.5 text-sm text-white" onClick={()=>setEditing(n)}>Edit</button>
              <button className="rounded-2xl bg-red-50 px-2.5 py-1.5 text-sm text-red-600" onClick={()=>remove(n.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {editing && <NGOFormModal ngo={editing} onClose={()=>{setEditing(null); load()}} />}
    </div>
  )
}
