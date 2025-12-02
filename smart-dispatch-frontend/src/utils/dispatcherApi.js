const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

async function getJson(url, opts = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { headers, ...opts })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export const fetchPendingIncidents = async () => {
  try {
    return await getJson(`${API_BASE}/api/dispatcher/incidents/pending`)
  } catch (e) {
    console.error('[dispatcherApi] fetchPendingIncidents failed', e)
    // fallback mock
    return [
      { id: 321, address: '4 Oak Blvd, Uptown', lat: 30.0444, lng: 31.2357, time: '12m ago', status: 'pending' },
      { id: 334, address: '12 Elm St, Downtown', lat: 30.0500, lng: 31.2300, time: '2m ago', status: 'assigned' },
    ]
  }
}

export const fetchAvailableVehicles = async (type) => {
  if (!type) throw new Error('fetchAvailableVehicles: type parameter is required')
  try {
    const url = `${API_BASE}/api/dispatcher/vehicles/available/${encodeURIComponent(type)}`
    return await getJson(url)
  } catch (e) {
    console.error('[dispatcherApi] fetchAvailableVehicles failed', e)
    return [
      { id: 12, name: 'Ambulance 12', lat: 30.048, lng: 31.232, status: 'available' },
      { id: 7, name: 'Firetruck 7', lat: 30.046, lng: 31.234, status: 'available' },
    ]
  }
}

export const createAssignment = async (assignmentRequest) => {
  try {
    return await getJson(`${API_BASE}/api/dispatcher/assignments/create`, {
      method: 'POST',
      body: JSON.stringify(assignmentRequest),
    })
  } catch (e) {
    console.error('[dispatcherApi] createAssignment failed', e)
    throw e
  }
}

export const fetchAssignments = async () => {
  try {
    return await getJson(`${API_BASE}/api/dispatcher/assignments`)
  } catch (e) {
    console.error('[dispatcherApi] fetchAssignments failed', e)
    // return empty list as fallback
    return []
  }
}

export const reassignAssignment = async (assignmentId, newVehicleId, dispatcherId = null) => {
  try {
    const body = { assignmentId, newVehicleId, dispatcherId }
    return await getJson(`${API_BASE}/api/dispatcher/assignments/reassign`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  } catch (e) {
    console.error('[dispatcherApi] reassignAssignment failed', e)
    throw e
  }
}

export default { fetchPendingIncidents, fetchAvailableVehicles, createAssignment, fetchAssignments, reassignAssignment }

