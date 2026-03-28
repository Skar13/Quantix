const BASE = (import.meta.env.VITE_API_URL || '') + '/api'

function getToken() {
  try {
    const raw = localStorage.getItem('quantix-auth')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token || null
  } catch { return null }
}

async function request(method, path, body) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(BASE + path, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`)
  return data
}

const get  = (path)       => request('GET',    path)
const post = (path, body) => request('POST',   path, body)
const put  = (path, body) => request('PUT',    path, body)
const del  = (path)       => request('DELETE', path)

export const authAPI     = { login: (u, p) => post('/auth/login', { username: u, password: p }), me: () => get('/auth/me') }
export const projectsAPI = { list: () => get('/projects'), create: (d) => post('/projects', d) }
export const boqAPI      = { get: (pid) => get(`/boq/${pid}`), addPart: (d) => post('/boq/part', d), addItem: (d) => post('/boq/item', d), deleteItem: (id) => del(`/boq/item/${id}`) }
export const billsAPI    = { list: (pid) => get(`/bills/${pid}`), getMeasurements: (bid) => get(`/bills/${bid}/measurements`), addMeasurement: (bid, m) => post(`/bills/${bid}/measurements`, m) }
export const reportsAPI  = { dashboard: (pid) => get(`/reports/dashboard/${pid}`), variation: (pid) => get(`/reports/variation/${pid}`), cement: (pid) => get(`/reports/cement/${pid}`) }
export const materialsAPI= { receipts: (pid) => get(`/materials/receipts/${pid}`), cement: (pid) => get(`/materials/cement/${pid}`) }
export const usersAPI    = { list: () => get('/users'), toggle: (id) => post(`/users/${id}/toggle`), setAccess: (id, items) => put(`/users/${id}/access`, { items }) }
