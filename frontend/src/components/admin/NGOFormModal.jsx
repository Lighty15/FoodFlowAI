import React, { useState } from 'react'
import { createNgo, updateNgo } from '../../api/admin'

export default function NGOFormModal({ ngo, onClose }){
  const [name, setName] = useState(ngo.ngo_name || '')
  const [location, setLocation] = useState(ngo.location || '')
  const [status, setStatus] = useState(ngo.status || 'available')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function save(){
    setLoading(true); setError(null)
    try{
      if(ngo && ngo.id){ await updateNgo(ngo.id, { ngo_name: name, location, status }) }
      else { await createNgo({ ngo_name: name, location, status }) }
      onClose()
    }catch(e){ setError(e.message || 'Failed') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-96">
        <h4 className="font-semibold mb-2">{ngo.id ? 'Edit NGO' : 'Create NGO'}</h4>
        {error && <div className="text-red-600">{error}</div>}
        <div className="mb-2">
          <label className="block text-sm">Name</label>
          <input className="w-full border p-1" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block text-sm">Location</label>
          <input className="w-full border p-1" value={location} onChange={e=>setLocation(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Status</label>
          <input className="w-full border p-1" value={status} onChange={e=>setStatus(e.target.value)} />
        </div>
        <div className="flex justify-end space-x-2">
          <button className="px-3 py-1" onClick={onClose}>Cancel</button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
