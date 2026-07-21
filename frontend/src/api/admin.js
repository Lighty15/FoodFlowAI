import client from './api'

export async function listUsers({ page=1, limit=100, role=null, active=null } = {}){
  const params = { page, limit }
  if(role) params.role = role
  if(active !== null) params.active = active
  const resp = await client.get('/admin/users', { params })
  return resp.data
}

export async function getUser(id){
  const resp = await client.get(`/admin/users/${id}`)
  return resp.data
}

export async function updateUser(id, body){
  const resp = await client.put(`/admin/users/${id}`, body)
  return resp.data
}

export async function enableUser(id, is_active){
  const resp = await client.patch(`/admin/users/${id}/enable`, { is_active })
  return resp.data
}

// NGOs
export async function listNgos({ page=1, limit=100 } = {}){
  const resp = await client.get('/admin/ngos', { params: { page, limit } })
  return resp.data
}

export async function createNgo(body){
  const resp = await client.post('/admin/ngos', body)
  return resp.data
}

export async function updateNgo(id, body){
  const resp = await client.put(`/admin/ngos/${id}`, body)
  return resp.data
}

export async function deleteNgo(id){
  const resp = await client.delete(`/admin/ngos/${id}`)
  return resp.data
}

// Volunteers
export async function listVolunteers({ page=1, limit=100 } = {}){
  const resp = await client.get('/admin/volunteers', { params: { page, limit } })
  return resp.data
}

export async function createVolunteer(body){
  const resp = await client.post('/admin/volunteers', body)
  return resp.data
}

export async function updateVolunteer(id, body){
  const resp = await client.put(`/admin/volunteers/${id}`, body)
  return resp.data
}

// Donations
export async function listDonations({ page=1, limit=100, status=null, priority=null, location=null } = {}){
  const params = { page, limit }
  if(status) params.status = status
  if(priority) params.priority = priority
  if(location) params.location = location
  const resp = await client.get('/admin/donations', { params })
  return resp.data
}

export async function getDonation(id){
  const resp = await client.get(`/admin/donations/${id}`)
  return resp.data
}

export default {
  listUsers, getUser, updateUser, enableUser,
  listNgos, createNgo, updateNgo, deleteNgo,
  listVolunteers, createVolunteer, updateVolunteer,
  listDonations, getDonation
}
