const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

async function getJson(url, opts = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { ...opts, headers })
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
    console.log(type)
    return await getJson(url)
  } catch (e) {
    console.error('[dispatcherApi] fetchAvailableVehicles failed', e)
    return [
      { id: 12, name: 'Ambulance 12', lat: 30.048, lng: 31.232, status: 'available' },
      { id: 7, name: 'Firetruck 7', lat: 30.046, lng: 31.234, status: 'available' },
    ]
  }
}

export const getCurrentDispatcherId = () => {
  try {
    if (typeof window === 'undefined') return null
    const token = localStorage.getItem('jwt_token')
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    // atob is available in browsers
    const decoded = JSON.parse(atob(payload))
    // backend sets claim "id" as string; try several common keys
    const id = decoded.id || decoded.userId || decoded.sub
    return id != null ? Number(id) : null
  } catch (e) {
    console.warn('[dispatcherApi] getCurrentDispatcherId failed', e)
    return null
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
  console.log("assignmentId:" + assignmentId)
  console.log("newVehicleId:" + newVehicleId)
  console.log("dispatcherId:" + dispatcherId)
  try {
    const body = { assignmentId, newVehicleId, dispatcherId }
    console.log("body:" + body)
    return await getJson(`${API_BASE}/api/dispatcher/assignments/reassign`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  } catch (e) {
    console.error('[dispatcherApi] reassignAssignment failed', e)
    throw e
  }
}

export default { fetchPendingIncidents, fetchAvailableVehicles, createAssignment, fetchAssignments, reassignAssignment, getCurrentDispatcherId }

