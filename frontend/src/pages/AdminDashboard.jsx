import React, { useEffect, useState } from 'react'
import UsersTable from '../components/admin/UsersTable'
import NGOsList from '../components/admin/NGOsList'
import VolunteersList from '../components/admin/VolunteersList'
import DonationsTable from '../components/admin/DonationsTable'
import AnalyticsCards from '../components/admin/AnalyticsCards'
import { listDonations } from '../api/admin'

export default function AdminDashboard(){
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(false)

  async function load(){
    setLoading(true)
    try{ const resp = await listDonations(); setDonations(resp.items || []) }catch(e){}
    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="space-y-6">
      <div className="card-surface p-5 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Admin operations</p>
            <h2 className="text-2xl font-semibold text-slate-900">FoodFlowAI control center</h2>
          </div>
          <div className="flex gap-2">
            <button className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">Export</button>
            <button className="btn-primary">+ New report</button>
          </div>
        </div>
      </div>
      <AnalyticsCards donations={donations} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-1"><UsersTable /></div>
        <div className="col-span-1"><NGOsList /></div>
        <div className="col-span-1"><VolunteersList /></div>
      </div>
      <div>
        <DonationsTable />
      </div>
    </div>
  )
}
