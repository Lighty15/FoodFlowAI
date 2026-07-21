import React, { useEffect, useState } from 'react'
import { listUsers, enableUser } from '../../api/admin'
import UserEditorModal from './UserEditorModal'

export default function UsersTable(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filterRole, setFilterRole] = useState('')
  const [editing, setEditing] = useState(null)

  async function load(){
    setLoading(true); setError(null)
    try{
      const resp = await listUsers({ role: filterRole || null })
      setUsers(resp.items || [])
    }catch(e){ setError(e.message || 'Failed') }
    setLoading(false)
  }

  useEffect(()=>{ load() }, [filterRole])

  async function toggleActive(u){
    try{
      await enableUser(u.id, !u.is_active)
      load()
    }catch(e){ setError(e.message) }
  }

  return (
    <div className="card-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Users</h3>
          <p className="text-sm text-slate-500">Manage access and statuses.</p>
        </div>
        <select className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none" value={filterRole} onChange={e=>setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="ngo">NGO</option>
          <option value="donor">Donor</option>
          <option value="volunteer">Volunteer</option>
        </select>
      </div>
      {loading && <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Loading users...</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Active</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u=> (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="py-2">{u.id}</td>
                <td>{u.username}</td>
                <td><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 capitalize">{u.role}</span></td>
                <td>{u.is_active ? 'Yes' : 'No'}</td>
                <td className="text-right">
                  <button className="mr-2 rounded-2xl bg-blue-600 px-2.5 py-1.5 text-white" onClick={()=>setEditing(u)}>Edit</button>
                  <button className="rounded-2xl bg-slate-100 px-2.5 py-1.5 text-slate-700" onClick={()=>toggleActive(u)}>{u.is_active ? 'Disable' : 'Enable'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <UserEditorModal user={editing} onClose={()=>{setEditing(null); load()}} />}
    </div>
  )
}
