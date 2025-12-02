
import React, { useEffect, useState } from 'react'
import { fetchPendingIncidents } from '../../utils/dispatcherApi'
import AssignModal from '../components/AssignModal'

export default function PendingIncidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let mounted = true
    fetchPendingIncidents().then((data) => {
      if (mounted) setIncidents(data)
    }).finally(() => mounted && setLoading(false))
    return () => (mounted = false)
  }, [])

  const openAssign = (incident) => setSelected(incident)

  const onAssigned = ({ incidentId, vehicleId }) => {
    setIncidents((prev) => prev.filter((i) => i.id !== incidentId))
    // show basic toast (red)
    const el = document.createElement('div')
    el.className = 'fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow'
    el.textContent = `Assigned ${vehicleId} → incident ${incidentId}`
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Pending Incidents</h2>
        <div className="text-sm text-gray-500">{loading ? 'Loading…' : `${incidents.length} unassigned`}</div>
      </div>

      <div className="grid gap-3">
        {incidents.map((inc) => (
          <div key={inc.id} className="p-3 rounded bg-white shadow flex items-start justify-between">
            <div>
              <div className="font-medium">Incident #{inc.id} — {inc.type || inc.status || 'Unknown'}</div>
              <div className="text-sm text-gray-500">{inc.address || inc.description || 'No address'} • {inc.time || ''}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="px-3 py-1 bg-gray-900 text-white rounded" onClick={() => openAssign(inc)}>Assign</button>
            </div>
          </div>
        ))}
      </div>

      {selected && <AssignModal incident={selected} onClose={() => setSelected(null)} onAssigned={onAssigned} />}
    </div>
  )
}
