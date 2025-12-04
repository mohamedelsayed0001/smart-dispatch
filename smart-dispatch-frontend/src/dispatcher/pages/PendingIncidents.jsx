
import React, { useEffect, useState } from 'react'
import { fetchPendingIncidents } from '../../utils/dispatcherApi'
import AssignModal from '../components/AssignModal'

export default function PendingIncidents() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [levelFilter, setLevelFilter] = useState('ALL')

  useEffect(() => {
    let mounted = true
    fetchPendingIncidents().then((data) => {
      if (mounted) setIncidents(data)
    }).finally(() => mounted && setLoading(false))
    return () => (mounted = false)
  }, [])

  // Helpers to extract possible level field from incidents (support multiple naming conventions)
  const getIncidentLevel = (inc) => {
    return inc.level ?? inc.severity ?? inc.priority ?? null
  }

  const types = Array.from(new Set(incidents.map(i => i.type).filter(Boolean)))
  const levels = Array.from(new Set(incidents.map(i => getIncidentLevel(i)).filter(Boolean)))

  const filteredIncidents = incidents.filter((inc) => {
    if (typeFilter && typeFilter !== 'ALL') {
      if ((inc.type || '').toString().toUpperCase() !== typeFilter.toString().toUpperCase()) return false
    }
    if (levelFilter && levelFilter !== 'ALL') {
      const lvl = getIncidentLevel(inc)
      if (!lvl || lvl.toString().toUpperCase() !== levelFilter.toString().toUpperCase()) return false
    }
    return true
  })

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
        <div>
          <h2 className="text-xl font-semibold">Incidents</h2>
          <div className="text-sm text-gray-500">{loading ? 'Loading…' : `${filteredIncidents.length} unassigned (showing ${filteredIncidents.length}/${incidents.length})`}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 rounded border">
              <option value="ALL">All</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Level</label>
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-3 py-2 rounded border">
              <option value="ALL">All</option>
              {levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <button className="px-3 py-2 dispatcher-btn dispatcher-btn--outline" onClick={() => { setTypeFilter('ALL'); setLevelFilter('ALL') }}>Clear</button>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredIncidents.map((inc) => (
          <div key={inc.id} className="p-3 rounded bg-white shadow flex items-start justify-between" data-incident-id={inc.id}>
            <div>
              <div className="font-medium">{inc.type || inc.status || 'Unknown'} Incident</div>
              <div className="text-sm text-gray-500">{inc.address || inc.description || 'No address'} • {inc.time || ''}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="px-3 py-1 dispatcher-btn dispatcher-btn--assign" onClick={() => openAssign(inc)}>Assign</button>
            </div>
          </div>
        ))}
      </div>

      {selected && <AssignModal incident={selected} onClose={() => setSelected(null)} onAssigned={onAssigned} />}
    </div>
  )
}
