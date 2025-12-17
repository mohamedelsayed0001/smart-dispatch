import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAvailableVehicles } from '../dispatcherApi.js'
import { connect, disconnect } from '../dispatcherSocket'

export default function AvailableVehicles({ vehicles, setVehicles }) {
  // const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // normalize backend vehicle DTO to frontend shape { id, name, type, status, lat, lng }
  const normalize = (v) => {
    const lat = v.lat ?? v.latitude ?? v.currentLatitude ?? (v.location && v.location.lat) ?? undefined
    const lng = v.lng ?? v.longitude ?? v.currentLongitude ?? (v.location && v.location.lng) ?? undefined
    return {
      ...v,
      lat: Number.isFinite(Number(lat)) ? Number(lat) : undefined,
      lng: Number.isFinite(Number(lng)) ? Number(lng) : undefined,
      status: (v.status || v.state || '').toString().toUpperCase(),
    }
  }

  useEffect(() => {
    let mounted = true
    let client = null

    // initial load (fetch all types)
    fetchAvailableVehicles('ALL')
      .then((v) => {
        if (!mounted) return
        const list = Array.isArray(v) ? v.map(normalize) : []
        console.debug('[AvailableVehicles] loaded vehicles', list)
        setVehicles(list)
      })
      .catch((e) => { console.error('fetchAvailableVehicles failed', e); if (mounted) setVehicles([]) })
      .finally(() => mounted && setLoading(false))

    // subscribe to realtime vehicle updates
    try {
      client = connect({
        onVehicle: (raw) => {
          const veh = normalize(raw)
          setVehicles((prev) => {
            // if vehicle is AVAILABLE, add/update; otherwise remove from available list
            if ((veh.status || '').toUpperCase() === 'AVAILABLE') {
              const idx = prev.findIndex((p) => p.id === veh.id)
              if (idx === -1) return [veh, ...prev]
              const copy = [...prev]
              copy[idx] = { ...copy[idx], ...veh }
              return copy
            } else {
              return prev.filter((p) => p.id !== veh.id)
            }
          })
        }
      })
    } catch (e) {
      console.error('subscribe failed', e)
    }

    return () => {
      mounted = false
      if (client) disconnect(client)
    }
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Vehicles</h2>
        <div className="text-sm text-gray-500">{loading ? 'Loading…' : `${vehicles.length} available`}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {vehicles.map((v) => (
          <div key={v.id} className="p-3 rounded bg-white shadow" data-vehicle-id={v.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{v.name || `Vehicle ${v.id}`}</div>
                <div className="text-xs text-gray-500">Type: {v.type || '—'}</div>
              </div>
              <div className="text-sm text-gray-400">{v.status}</div>
            </div>
            <div className="mt-3 text-sm text-gray-500">Last known: {Number.isFinite(v.lat) && Number.isFinite(v.lng) ? `${v.lat.toFixed(3)}, ${v.lng.toFixed(3)}` : 'N/A'}</div>
            <div className="mt-3">
              <button
                className="px-3 py-1 dispatcher-btn dispatcher-btn--outline text-sm"
                onClick={() => {
                  if (Number.isFinite(v.lat) && Number.isFinite(v.lng)) navigate(`/dispatcher/map?lat=${v.lat}&lng=${v.lng}&zoom=18`)
                  else navigate('/dispatcher/map')
                }}
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
