import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap, Marker } from 'react-leaflet'
import { useLocation } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { fetchAvailableVehicles, fetchPendingIncidents } from '../dispatcherApi'

function FitBounds({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (!coords || coords.length === 0) return
    try {
      if (coords.length === 1) {
        map.setView(coords[0], 14)
      } else {
        map.fitBounds(coords, { padding: [60, 60], maxZoom: 14 })
      }
    } catch (e) {
      console.error('FitBounds error', e)
    }
  }, [coords, map])
  return null
}

// Pulsing highlight marker for targeted locations
function HighlightMarker({ position }) {
  const [pulse, setPulse] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!pulse) return null

  return (
    <CircleMarker
      center={position}
      radius={20}
      pathOptions={{
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.2,
        weight: 3,
        className: 'pulse-marker'
      }}
    />
  )
}

// Create custom car icons for different vehicle types
const createCarIcon = (type, status) => {
  let icon = '\ud83d\ude97' // default car
  if (type === 'AMBULANCE') icon = '\ud83d\ude91'
  else if (type === 'FIRETRUCK') icon = '\ud83d\ude92'
  else if (type === 'POLICE') icon = '\ud83d\ude93'

  let bgColor = '#6b7280' // default gray
  if (status === 'AVAILABLE') bgColor = '#10b981' // green
  else if (status === 'ONROUTE' || status === 'ON_ROUTE') bgColor = '#f59e0b' // amber
  else if (status === 'RESOLVING') bgColor = '#ef4444' // red

  return L.divIcon({
    html: `<div style=\"font-size: 24px; text-align: center; text-shadow: 0 0 3px ${bgColor}, 0 0 6px ${bgColor};\">${icon}</div>`,
    className: 'custom-car-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

export default function VehicleMap({ height = '100vh' }) {
  const [vehicles, setVehicles] = useState([])
  const [incidents, setIncidents] = useState([])
  const mapRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const suggestTimer = useRef(null)
  const location = useLocation()

  const handleSearch = async () => {
    const q = (searchQuery || '').trim()
    if (!q) return
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1`
      const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'smart-dispatch/1.0' } })
      if (!res.ok) throw new Error('Search failed')
      const json = await res.json()
      if (!json || json.length === 0) {
        alert('Location not found')
        return
      }
      const { lat, lon } = json[0]
      const latNum = parseFloat(lat)
      const lonNum = parseFloat(lon)
      if (mapRef.current && !Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
        setHighlightPosition([latNum, lonNum])
        mapRef.current.flyTo([latNum, lonNum], 18)
      }
    } catch (e) {
      console.error('Search error', e)
      alert('Search failed')
    }
  }

  const fetchSuggestions = (q) => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current)
    if (!q || q.trim().length === 0) {
      setSuggestions([])
      return
    }
    suggestTimer.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`
        const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'smart-dispatch/1.0' } })
        if (!res.ok) return
        const json = await res.json()
        setSuggestions(json || [])
      } catch (e) {
        console.error('suggest error', e)
      }
    }, 250)
  }

  const handleSelectSuggestion = (item) => {
    setSearchQuery(item.display_name || '')
    setSuggestions([])
    const latNum = parseFloat(item.lat)
    const lonNum = parseFloat(item.lon)
    if (mapRef.current && !Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
      setHighlightPosition([latNum, lonNum])
      mapRef.current.flyTo([latNum, lonNum], 18)
    }
  }

  const normalizeVehicle = (v) => {
    const out = { ...v }
    let lat = null
    let lng = null
    if (typeof v.lat === 'number' && typeof v.lng === 'number') {
      lat = v.lat; lng = v.lng
    } else if (v.latitude !== undefined && v.longitude !== undefined) {
      lat = Number(v.latitude); lng = Number(v.longitude)
    } else if (v.location) {
      const loc = v.location
      if (typeof loc.lat === 'number' && typeof loc.lng === 'number') { lat = loc.lat; lng = loc.lng }
      else if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) { lng = Number(loc.coordinates[0]); lat = Number(loc.coordinates[1]) }
    } else if (v.currentLatitude !== undefined && v.currentLongitude !== undefined) {
      lat = Number(v.currentLatitude)
      lng = Number(v.currentLongitude)
    } else if (Array.isArray(v.coordinates) && v.coordinates.length >= 2) {
      lng = Number(v.coordinates[0]); lat = Number(v.coordinates[1])
    } else if (v.coord || v.coords) {
      const c = v.coord || v.coords
      if (Array.isArray(c) && c.length >= 2) { lng = Number(c[0]); lat = Number(c[1]) }
      else if (c && (c.lat !== undefined || c.lng !== undefined)) { lat = Number(c.lat); lng = Number(c.lng) }
    }
    out.lat = Number.isFinite(lat) ? lat : undefined
    out.lng = Number.isFinite(lng) ? lng : undefined
    out.status = (v.status || v.state || '').toString().toUpperCase()
    return out
  }

  useEffect(() => {
    let mounted = true
    fetchAvailableVehicles('ALL').then((v) => {
      if (!mounted) return
      try {
        const list = Array.isArray(v) ? v.map(normalizeVehicle) : []
        setVehicles(list)
      } catch (e) {
        console.error('normalize vehicles failed', e)
        setVehicles([])
      }
    }).catch((e) => { console.error('fetchAvailableVehicles failed', e); setVehicles([]) })

    fetchPendingIncidents().then((data) => { if (mounted) setIncidents(data) }).catch(() => { })
    return () => {
      mounted = false
      // Clear suggestion timeout on unmount
      if (suggestTimer.current) {
        clearTimeout(suggestTimer.current)
      }
    }
  }, [])

  const [highlightPosition, setHighlightPosition] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const lat = parseFloat(params.get('lat'))
    const lng = parseFloat(params.get('lng'))
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      setHighlightPosition([lat, lng])
      const tryFly = () => { if (mapRef.current) mapRef.current.flyTo([lat, lng], 18) }
      if (mapRef.current) tryFly()
      else {
        const id = setInterval(() => { if (mapRef.current) { tryFly(); clearInterval(id) } }, 200)
        // Cleanup interval if component unmounts before map is ready
        return () => clearInterval(id)
      }
    } else {
      setHighlightPosition(null)
    }
  }, [location.search])

  const routeCoords = vehicles
    .filter(v => (v.status || '').toString().toUpperCase() === 'ON_ROUTE' && Number.isFinite(v.lat) && Number.isFinite(v.lng))
    .map(v => [v.lat, v.lng])

  return (
    <div className="view-container">
      <h2 className="text-xl font-semibold mb-4">Vehicle Map</h2>

      <div className="bg-white rounded-t-2xl shadow p-4 z-10 relative">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); fetchSuggestions(e.target.value) }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              placeholder="Search place, address or vehicle"
              className="px-3 py-2 border border-gray-200 rounded w-80 text-sm focus:outline-none focus:border-blue-500"
            />
            <button onClick={() => handleSearch()} className="px-3 py-2 dispatcher-btn dispatcher-btn--primary text-sm">Search</button>

            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white rounded shadow-lg z-50 overflow-hidden border border-gray-100">
                <ul className="max-h-64 overflow-auto">
                  {suggestions.map((s) => (
                    <li key={s.place_id} className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0" onMouseDown={() => handleSelectSuggestion(s)}>
                      <div className="font-medium truncate">{s.display_name}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </span>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </span>
              <span>On route</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              </span>
              <span>Resolving</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-b-2xl shadow overflow-hidden relative z-0" style={{ minHeight: '500px' }}>
        <MapContainer
          whenCreated={(m) => (mapRef.current = m)}
          center={[26.8206, 30.8025]}
          zoom={6}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {vehicles.map((v) => {
            if (!Number.isFinite(v.lat) || !Number.isFinite(v.lng)) return null
            const st = (v.status || '').toUpperCase()
            const icon = createCarIcon(v.type, st)
            return (
              <Marker
                key={v.id}
                position={[v.lat, v.lng]}
                icon={icon}
              >
                <Popup>
                  <div className="font-medium">{v.name || `Vehicle ${v.id}`}</div>
                  <div className="text-xs text-gray-500">{v.status} • {v.type || '—'}</div>
                </Popup>
              </Marker>
            )
          })}

          {incidents.map((inc) => (
            inc.lat && inc.lng ? (
              <CircleMarker
                key={`inc-${inc.id}`}
                center={[inc.lat, inc.lng]}
                radius={8}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.8, weight: 2 }}
              >
                <Popup>
                  <div className="font-medium">Incident #{inc.id}</div>
                  <div className="text-xs text-gray-500">{inc.address || inc.description}</div>
                </Popup>
              </CircleMarker>
            ) : null
          ))}

          {routeCoords.length > 1 && (
            <Polyline positions={routeCoords} pathOptions={{ color: '#ff7a18', weight: 5, opacity: 0.95 }} />
          )}

          {highlightPosition && <HighlightMarker position={highlightPosition} />}

          <FitBounds coords={routeCoords} />
        </MapContainer>
      </div>
    </div>
  )
}
