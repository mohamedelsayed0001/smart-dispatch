import React, { useEffect, useState } from 'react'
import { connect, disconnect } from '../../utils/dispatcherSocket'
import { fetchAssignments, reassignAssignment, fetchAvailableVehicles } from '../../utils/dispatcherApi'

export default function Assignment() {
  const [assignments, setAssignments] = useState([])
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [reassigningAssignment, setReassigningAssignment] = useState(null)
  const [availableVehicles, setAvailableVehicles] = useState([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)

  useEffect(() => {
    // fetch existing assignments once on mount
    let cancelled = false
    fetchAssignments()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setAssignments(data)
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



  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Assignment</h2>
      </div>

      <div className="grid gap-3">
        {assignments.length === 0 && <div className="p-4 bg-white rounded shadow">No assignments yet.</div>}
        {assignments.map((a) => (
          <div key={a.id} className="p-3 rounded bg-white shadow flex items-center justify-between">
            <div>
              <div className="font-medium">#{a.id} — {a.incident?.type || a.type}</div>
              <div className="text-sm text-gray-500">Vehicle: {a.vehicle?.name || a.vehicleId} • ETA: {a.eta || '–'}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border border-[#E11D2F] text-[#E11D2F] rounded">View on Map</button>
              <button
                className="px-3 py-1 bg-white border border-[#E11D2F] text-[#E11D2F] rounded"
                onClick={async () => {
                  setReassigningAssignment(a)
                  setShowReassignModal(true)
                  setLoadingVehicles(true)
                  try {
                    const list = await fetchAvailableVehicles()
                    setAvailableVehicles(Array.isArray(list) ? list : [])
                  } catch (e) {
                    console.error('Failed to load available vehicles', e)
                    setAvailableVehicles([])
                  } finally {
                    setLoadingVehicles(false)
                  }
                }}
              >Reassign</button>
            </div>
          </div>
        ))}
      </div>
      
      {showReassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReassignModal(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white rounded shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Reassign Assignment #{reassigningAssignment?.id}</h3>
              <button className="text-sm text-gray-500" onClick={() => setShowReassignModal(false)}>Close</button>
            </div>
            {loadingVehicles ? (
              <div>Loading vehicles...</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-auto">
                {availableVehicles.length === 0 && <div className="text-sm text-gray-500">No available vehicles.</div>}
                {availableVehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{v.name || `Vehicle ${v.id}`}</div>
                      <div className="text-xs text-gray-500">{v.type || '—'} • {v.status}</div>
                    </div>
                    <div>
                      <button className="px-3 py-1 rounded bg-gray-900 text-white text-sm" onClick={async () => {
                        try {
                          const updated = await reassignAssignment(reassigningAssignment.id, v.id)
                          setAssignments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                          setShowReassignModal(false)
                        } catch (e) {
                          console.error('Reassign failed', e)
                          alert('Reassign failed: ' + (e.message || e))
                        }
                      }}>Assign</button>
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
