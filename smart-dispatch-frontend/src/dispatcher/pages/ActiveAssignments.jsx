import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { connect, disconnect } from '../dispatcherSocket.js'
import { fetchAssignments, reassignAssignment, fetchAvailableVehicles, getCurrentDispatcherId } from '../dispatcherApi.js'

export default function Assignment({ assignments, setAssignments }) {
  const navigate = useNavigate()
  // const [assignments, setAssignments] = useState([])
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [reassigningAssignment, setReassigningAssignment] = useState(null)
  const [availableVehicles, setAvailableVehicles] = useState([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    // fetch existing assignments once on mount
    let cancelled = false
    fetchAssignments()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setAssignments(data)
          console.log(data)
        }
      })
      .catch((e) => console.error('Failed to load assignments', e))

    const client = connect({
      onAssignment: (a) => {
        setAssignments((prev) => {
          const idx = prev.findIndex((p) => p.id === a.id)
          if (idx === -1) return [a, ...prev]
          const copy = [...prev]
          copy[idx] = a
          return copy
        })
      },
    })

    return () => {
      cancelled = true
      disconnect(client)
    }
  }, [])

  // Filter assignments based on selected status
  const filteredAssignments = statusFilter === 'ALL'
    ? assignments
    : assignments.filter(a => a.status?.toUpperCase() === statusFilter)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Assignments</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELED">Canceled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredAssignments.length === 0 && (
          <div className="p-4 bg-white rounded shadow">
            No assignments found{statusFilter !== 'ALL' ? ` with status "${statusFilter}"` : ''}.
          </div>
        )}

        {filteredAssignments.map((a) => {
          const canReassign = a.status?.toUpperCase() === 'PENDING' || a.status?.toUpperCase() === 'REJECTED'

          return (
            <div key={a.id} className="p-3 rounded bg-white shadow flex items-center justify-between" data-assignment-id={a.id}>
              <div>
                <div className="font-medium">{a.description}</div>
                <div className="text-sm text-gray-500">
                  Vehicle: {a.vehicle?.name || a.vehicleId} • Status:
                  <span className={`ml-1 font-medium ${a.status?.toUpperCase() === 'PENDING' ? 'text-amber-600' :
                    a.status?.toUpperCase() === 'ACTIVE' ? 'text-blue-600' :
                      a.status?.toUpperCase() === 'COMPLETED' ? 'text-green-600' :
                        a.status?.toUpperCase() === 'REJECTED' ? 'text-red-600' :
                          a.status?.toUpperCase() === 'CANCELED' ? 'text-gray-600' :
                            'text-gray-500'
                    }`}>
                    {a.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 dispatcher-btn dispatcher-btn--outline"
                  onClick={() => {
                    // Prefer coordinates attached directly to the assignment, then incident, then vehicle
                    let lat, lng

                    // 1) Assignment-level coordinates (new fields you added)
                    if (a?.lat && a?.lng) {
                      lat = a.lat
                      lng = a.lng
                    } else if (a?.latitude && a?.longitude) {
                      lat = a.latitude
                      lng = a.longitude
                    } else if (a?.location?.lat && a?.location?.lng) {
                      lat = a.location.lat
                      lng = a.location.lng
                    } else if (a?.location?.coordinates && Array.isArray(a.location.coordinates)) {
                      lng = a.location.coordinates[0]
                      lat = a.location.coordinates[1]
                    }

                    // 2) Incident coordinates
                    const incident = a.incident
                    if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && incident) {
                      if (incident?.lat && incident?.lng) {
                        lat = incident.lat
                        lng = incident.lng
                      } else if (incident?.latitude && incident?.longitude) {
                        lat = incident.latitude
                        lng = incident.longitude
                      } else if (incident?.location?.lat && incident?.location?.lng) {
                        lat = incident.location.lat
                        lng = incident.location.lng
                      } else if (incident?.location?.coordinates && Array.isArray(incident.location.coordinates)) {
                        lng = incident.location.coordinates[0]
                        lat = incident.location.coordinates[1]
                      }
                    }

                    // 3) Vehicle coordinates (fallback)
                    if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && a.vehicle) {
                      const vehicle = a.vehicle
                      if (vehicle?.lat && vehicle?.lng) {
                        lat = vehicle.lat
                        lng = vehicle.lng
                      } else if (vehicle?.latitude && vehicle?.longitude) {
                        lat = vehicle.latitude
                        lng = vehicle.longitude
                      } else if (vehicle?.currentLatitude && vehicle?.currentLongitude) {
                        lat = vehicle.currentLatitude
                        lng = vehicle.currentLongitude
                      } else if (vehicle?.location?.lat && vehicle?.location?.lng) {
                        lat = vehicle.location.lat
                        lng = vehicle.location.lng
                      } else if (vehicle?.location?.coordinates && Array.isArray(vehicle.location.coordinates)) {
                        lng = vehicle.location.coordinates[0]
                        lat = vehicle.location.coordinates[1]
                      }
                    }

                    // Navigate to map with coordinates and maximum zoom
                    if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
                      navigate(`/dispatcher/map?lat=${lat}&lng=${lng}&zoom=18`)
                    } else {
                      // If no coordinates, just navigate to map
                      navigate('/dispatcher/map')
                    }
                  }}
                >
                  View on Map
                </button>
                {canReassign && (
                  <button
                    className="px-3 py-1 dispatcher-btn dispatcher-btn--outline"
                    onClick={async () => {
                      setReassigningAssignment(a)
                      console.log("")
                      setShowReassignModal(true)
                      setLoadingVehicles(true)
                      try {

                        const type = a.incidentType ? a.incidentType : 'ALL'
                        const list = await fetchAvailableVehicles(type)
                        setAvailableVehicles(Array.isArray(list) ? list : [])
                      } catch (e) {
                        console.error('Failed to load available vehicles', e)
                        setAvailableVehicles([])
                      } finally {
                        setLoadingVehicles(false)
                      }
                    }}
                  >
                    Reassign
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showReassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReassignModal(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Reassign Assignment #{reassigningAssignment?.id}</h3>
              <button className="text-sm text-gray-500 hover:text-gray-700" onClick={() => setShowReassignModal(false)}>Close</button>
            </div>
            {loadingVehicles ? (
              <div className="p-4 text-center">Loading vehicles...</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-auto">
                {availableVehicles.length === 0 && <div className="text-sm text-gray-500 p-4 text-center">No available vehicles.</div>}
                {availableVehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{v.name || `Vehicle ${v.id}`}</div>
                      <div className="text-xs text-gray-500">{v.type || '—'} • {v.status}</div>
                    </div>
                    <div>
                      <button
                        className="px-3 py-1 dispatcher-btn dispatcher-btn--confirm text-sm"
                        onClick={async () => {
                          try {
                            const dispatcherId = getCurrentDispatcherId()
                            const updated = await reassignAssignment(reassigningAssignment.id, v.id, dispatcherId)
                            setAssignments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                            setShowReassignModal(false)
                          } catch (e) {
                            console.error('Reassign failed', e)
                            alert('Reassign failed: ' + (e.message || e))
                          }
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
