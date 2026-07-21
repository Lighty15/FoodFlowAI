import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const client = axios.create({ baseURL: API_BASE + '/api' })

client.interceptors.request.use((config)=>{
  const token = localStorage.getItem('ff_token')
  if(token){ config.headers.Authorization = `Bearer ${token}` }
  return config
})

export async function login(username, password){
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  const resp = await client.post('/auth/token', form)
  return resp.data
}

export async function register(username, password, role){
  const resp = await client.post('/auth/register', { username, password, role })
  return resp.data
}

export async function createDonation(payload){
  const resp = await client.post('/donations', payload)
  return resp.data
}

export async function getTask(taskId){
  const resp = await client.get(`/tasks/${taskId}`)
  return resp.data
}

export async function listAssigned(){
  const resp = await client.get('/donations')
  return resp.data
}

export async function ngoAccept(id, accept){
  const resp = await client.put(`/donations/${id}/accept`, { accept })
  return resp.data
}

export async function volunteerUpdate(id, status){
  const resp = await client.put(`/donations/${id}/delivery`, { status })
  return resp.data
}

export default client
