import React, { useState } from 'react'
import { updateUser } from '../../api/admin'

export default function UserEditorModal({ user, onClose }){
  const [role, setRole] = useState(user.role)
  const [isActive, setIsActive] = useState(!!user.is_active)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function save(){
    setLoading(true); setError(null)
    try{
      await updateUser(user.id, { role, is_active: isActive, ngo_id: user.ngo_id, volunteer_id: user.volunteer_id })
      onClose()
    }catch(e){ setError(e.message || 'Failed') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-96">
        <h4 className="font-semibold mb-2">Edit User {user.username}</h4>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="mb-2">
          <label className="block text-sm">Role</label>
          <select className="w-full border p-1" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="admin">admin</option>
            <option value="ngo">ngo</option>
            <option value="donor">donor</option>
            <option value="volunteer">volunteer</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="flex items-center"><input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} className="mr-2"/> Active</label>
        </div>
        <div className="flex justify-end space-x-2">
          <button className="px-3 py-1" onClick={onClose}>Cancel</button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
