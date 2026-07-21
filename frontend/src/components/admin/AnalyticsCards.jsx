import React from 'react'

export default function AnalyticsCards({ donations=[] }){
  const total = donations.length
  const pending = donations.filter(d=> d.status === 'new' || d.task_id).length
  const completed = donations.filter(d=> d.status === 'completed' || d.status === 'delivered').length
  const high = donations.filter(d=> d.priority === 'high' || d.priority === 'urgent').length

  const card = (title, value, tone='slate') => {
    const tones = {
      slate: 'bg-slate-50 text-slate-700',
      emerald: 'bg-emerald-50 text-emerald-700',
      blue: 'bg-blue-50 text-blue-700',
      amber: 'bg-amber-50 text-amber-700',
    }
    return (
      <div className="card-surface p-4">
        <div className={`inline-flex rounded-2xl px-3 py-2 text-sm font-medium ${tones[tone]}`}>{title}</div>
        <div className="mt-4 text-3xl font-semibold text-slate-900">{value}</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {card('Total donations', total, 'slate')}
      {card('Pending donations', pending, 'amber')}
      {card('Completed deliveries', completed, 'emerald')}
      {card('High priority', high, 'blue')}
    </div>
  )
}
