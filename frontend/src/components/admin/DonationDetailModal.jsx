import React, { useEffect, useState } from 'react'
import { getDonation, listNgos, listVolunteers } from '../../api/admin'

export default function DonationDetailModal({ id, onClose }){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ngoMap, setNgoMap] = useState({})
  const [volMap, setVolMap] = useState({})

  useEffect(()=>{
    let mounted=true
    async function loadAll(){
      try{
        const [d, ngosResp, volsResp] = await Promise.all([getDonation(id), listNgos(), listVolunteers()])
        if(!mounted) return
        const nmap = {};
        (ngosResp.items||[]).forEach(n=> nmap[n.id]=n.ngo_name)
        const vmap = {};
        (volsResp.items||[]).forEach(v=> vmap[v.id]=v.volunteer_name)
        setNgoMap(nmap); setVolMap(vmap)
        setData(d)
      }catch(e){ if(mounted){ setError(e.message) }}
      if(mounted) setLoading(false)
    }
    loadAll()
    return ()=> mounted=false
  }, [id])

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-11/12 md:w-3/4 max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">Donation #{id}</h4>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {data && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
              <div><strong>Donor</strong><div>{data.donor_name}</div></div>
              <div><strong>Food</strong><div>{data.food_name}</div></div>
              <div><strong>Quantity</strong><div>{data.quantity}</div></div>
            </div>
            <div className="mb-3"><strong>Location</strong><div>{data.location}</div></div>
            <div className="mb-3"><strong>Priority</strong><div>{data.priority || 'N/A'}</div></div>
            <div className="mb-3"><strong>Validation</strong><div>{data.validation_status || 'N/A'}</div></div>
            <div className="mb-3"><strong>Assigned NGO</strong><div>{data.ngo_id ? (ngoMap[data.ngo_id] || data.ngo_id) : 'N/A'}</div></div>
            <div className="mb-3"><strong>Assigned Volunteer</strong><div>{data.volunteer_id ? (volMap[data.volunteer_id] || data.volunteer_id) : 'N/A'}</div></div>
            <div className="mb-3"><strong>Task</strong><div>{data.task_id || 'N/A'}</div></div>
            <div className="mb-3"><strong>Audit Logs</strong>
              <ul className="list-disc pl-5">
                {data.audit_logs && data.audit_logs.map((l,i)=>(<li key={i}><strong>{l.node_name}</strong>: {JSON.stringify(l.output)}</li>))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
