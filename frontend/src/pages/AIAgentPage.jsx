import React from 'react'
import { getUser } from '../auth/auth'

const agents = [
  { name: 'Validation Agent', status: 'Completed', duration: '1.2s', reason: 'Food quality, safety, and expiry checks passed.', logs: 'Verified donor details and shelf-life data.' },
  { name: 'Priority Agent', status: 'Running', duration: '0.8s', reason: 'Urgency score boosted by proximity and perishability.', logs: 'Scoring request against demand and expiry urgency.' },
  { name: 'NGO Matching Agent', status: 'Completed', duration: '2.1s', reason: 'Matched with the nearest active NGO partner.', logs: 'Selected the most suitable recipient organization.' },
  { name: 'Volunteer Assignment Agent', status: 'Completed', duration: '1.5s', reason: 'Volunteer dispatch optimized for fastest arrival.', logs: 'Assigned route and pickup window.' },
  { name: 'Delivery Tracking Agent', status: 'Failed', duration: '0.6s', reason: 'Live carrier feed was temporarily unavailable.', logs: 'Retry scheduled for next refresh cycle.' },
]

export default function AIAgentPage() {
  const user = getUser()

  return (
    <div className="space-y-6">
      <div className="card-surface p-5 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">AI workflow</p>
            <h2 className="text-2xl font-semibold text-slate-900">Autonomous food rescue orchestration</h2>
            <p className="mt-2 text-sm text-slate-500">{user?.username || 'Operator'} can review every agent and the reasoning behind each decision.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Live pipeline • 5 agents</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Execution timeline</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">Monitoring</span>
          </div>
          <div className="mt-6 space-y-4">
            {agents.map((agent, index) => (
              <div key={agent.name} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold ${agent.status === 'Failed' ? 'bg-red-100 text-red-700' : agent.status === 'Running' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{agent.name}</p>
                      <p className="text-sm text-slate-500">{agent.reason}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">{agent.duration}</div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${agent.status === 'Failed' ? 'bg-red-50 text-red-700' : agent.status === 'Running' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{agent.status}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{agent.logs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-surface p-5">
            <h3 className="text-lg font-semibold text-slate-900">Workflow overview</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">Validation Agent → Priority Agent → NGO Matching Agent → Volunteer Assignment Agent → Delivery Tracking Agent</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">The flow keeps food rescue decisions explainable and auditable.</div>
            </div>
          </div>
          <div className="card-surface p-5">
            <h3 className="text-lg font-semibold text-slate-900">Latest logs</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="rounded-2xl border border-slate-200 p-3">Correlation update completed successfully.</li>
              <li className="rounded-2xl border border-slate-200 p-3">Retry queue prepared for the delivery tracking agent.</li>
              <li className="rounded-2xl border border-slate-200 p-3">Volunteer ETA refreshed after route recalculation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
