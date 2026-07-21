import React, { useEffect, useState } from 'react'
import { listDonations, listNgos, listVolunteers } from '../../api/admin'
import DonationDetailModal from './DonationDetailModal'

export default function DonationsTable(){
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [ngoMap, setNgoMap] = useState({})
  const [volMap, setVolMap] = useState({})

  async function load(){
    setLoading(true); setError(null)
    try{ const resp = await listDonations(); setDonations(resp.items || []) }catch(e){ setError(e.message) }
    setLoading(false)
  }
  async function loadMaps(){
    try{
      const ngosResp = await listNgos();
      const volsResp = await listVolunteers();
      const nmap = {};
      (ngosResp.items||[]).forEach(n=> nmap[n.id]=n.ngo_name)
      const vmap = {};
      (volsResp.items||[]).forEach(v=> vmap[v.id]=v.volunteer_name)
      setNgoMap(nmap); setVolMap(vmap)
    }catch(e){ /* ignore */ }
  }
  useEffect(()=>{ load() }, [])
  useEffect(()=>{ loadMaps() }, [])

  return (
    <div className="card-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Donation operations</h3>
          <p className="text-sm text-slate-500">Monitor intake, processing, and delivery state.</p>
        </div>
        <div className="flex gap-2">
          <input className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none" placeholder="Search" />
          <button className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Filter</button>
        </div>
      </div>
      {loading && <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Loading...</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-3 pr-3">ID</th>
              <th className="py-3 pr-3">Donor</th>
              <th className="py-3 pr-3">Food</th>
              <th className="py-3 pr-3">Qty</th>
              <th className="py-3 pr-3">Priority</th>
              <th className="py-3 pr-3">NGO</th>
              <th className="py-3 pr-3">Volunteer</th>
              <th className="py-3 pr-3">Task</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(d=> (
              <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="py-3 pr-3 font-medium text-slate-700">#{d.id}</td>
                <td className="py-3 pr-3">{d.donor_name}</td>
                <td className="py-3 pr-3">{d.food_name}</td>
                <td className="py-3 pr-3">{d.quantity}</td>
                <td className="py-3 pr-3"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">{d.priority || '-'}</span></td>
                <td className="py-3 pr-3">{d.ngo_id ? (ngoMap[d.ngo_id] || d.ngo_id) : '-'}</td>
                <td className="py-3 pr-3">{d.volunteer_id ? (volMap[d.volunteer_id] || d.volunteer_id) : '-'}</td>
                <td className="py-3 pr-3">{d.task_id ? 'Processing' : 'N/A'}</td>
                <td className="py-3 text-right"><button className="rounded-2xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white" onClick={()=>setSelected(d.id)}>Details</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <DonationDetailModal id={selected} onClose={()=>setSelected(null)} />}
    </div>
  )
}
