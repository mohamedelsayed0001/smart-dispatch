import React, { useEffect, useState } from 'react'
import { fetchAvailableVehicles, createAssignment, getCurrentDispatcherId } from '../../utils/dispatcherApi'

export default function AssignModal({ incident, onClose, onAssigned }) {
  const [vehicles, setVehicles] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    fetchAvailableVehicles(incident?.type || 'ALL').then((v) => {
      if (mounted) setVehicles(v)
    }).catch((e) => console.error('fetchAvailableVehicles failed', e))
    return () => (mounted = false)
  }, [incident])

  const assign = async () => {
    if (!selected) return
    setLoading(true)
    try {
      // include current dispatcher id (decoded from JWT); fallback to 1 if missing
      const dispatcherId = getCurrentDispatcherId() || 1
      await createAssignment({ incidentId: incident.id, vehicleId: selected.id, dispatcherId })
      onAssigned && onAssigned({ incidentId: incident.id, vehicleId: selected.id })
    } catch (e) {
      console.error('assign failed', e)
      alert('Assignment failed')
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <div className="bg-white rounded p-4 w-full max-w-xl z-10 shadow-lg">
        <h3 className="text-lg font-semibold">Assign Vehicle to Incident #{incident.id}</h3>
        <p className="text-sm text-gray-500">{incident.address || incident.description}</p>
        <div className="mt-3 grid grid-cols-1 gap-2 max-h-64 overflow-auto">
          {vehicles.map((v) => (
            <label key={v.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <input type="radio" name="vehicle" onChange={() => setSelected(v)} />
              <div className="flex-1">
                <div className="font-medium">{v.name || `Vehicle ${v.id}`}</div>
                <div className="text-xs text-gray-500">Type: {v.type || 'N/A'} • Status: {v.status}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="px-3 py-1 rounded bg-gray-900 text-white" onClick={assign} disabled={!selected || loading}>{loading ? 'Assigning…' : 'Confirm Assign'}</button>
        </div>
      </div>
    </div>
  )
}
