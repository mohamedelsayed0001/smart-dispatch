import React, { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet'
import { useLocation } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

import { fetchAvailableVehicles, fetchPendingIncidents } from '../../utils/dispatcherApi'

function FitBounds({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (!coords || coords.length === 0) return
    try {
      // coords already comes in [lat, lng] pairs. Handle single-point and multi-point cases.
      if (coords.length === 1) {
        // center on the single point with a reasonable zoom
        map.setView(coords[0], 14)
      } else {
        map.fitBounds(coords, { padding: [60, 60], maxZoom: 14 })
      }
    } catch (e) {
      // Log error to help debugging if fit/center fails
      // (do not throw — keep UI resilient)
      // eslint-disable-next-line no-console
      console.error('FitBounds error', e)
    }
  }, [coords, map])
  return null
}

export default function VehicleMap() {
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
        mapRef.current.flyTo([latNum, lonNum], 12)
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
      mapRef.current.flyTo([latNum, lonNum], 12)
    }
  }

  // Normalize vehicle objects from backend into { id, name, lat, lng, status, ... }
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
    fetchAvailableVehicles().then((v) => {
      if (!mounted) return
      try {
        const list = Array.isArray(v) ? v.map(normalizeVehicle) : []
        setVehicles(list)
      } catch (e) {
        console.error('normalize vehicles failed', e)
        setVehicles([])
      }
    }).catch((e) => { console.error('fetchAvailableVehicles failed', e); setVehicles([]) })

    fetchPendingIncidents().then((data) => { if (mounted) setIncidents(data) }).catch(() => {})
    return () => (mounted = false)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const lat = parseFloat(params.get('lat'))
    const lng = parseFloat(params.get('lng'))
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      // if map already exists, fly now, else wait a tick
      const tryFly = () => { if (mapRef.current) mapRef.current.flyTo([lat, lng], 14) }
      if (mapRef.current) tryFly()
      else {
        const id = setInterval(() => { if (mapRef.current) { tryFly(); clearInterval(id) } }, 200)
      }
    }
  }, [location.search])

  // Only build a route polyline from vehicles that are actually "on route".
  // Previously we used all vehicles which could create a line connecting every vehicle.
  const routeCoords = vehicles
    .filter(v => (v.status || '').toString().toUpperCase() === 'ON_ROUTE' && Number.isFinite(v.lat) && Number.isFinite(v.lng))
    .map(v => [v.lat, v.lng])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Vehicle Map</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col overflow-hidden" style={{ height: '100vh' }}>
          <div className="flex-1 rounded-lg overflow-hidden relative">
            {/* Search control and legend above the map */}
            <div className="mb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); fetchSuggestions(e.target.value) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                    placeholder="Search place, address or vehicle"
                    className="px-3 py-2 border border-gray-200 rounded w-80 text-sm"
                  />
                  <button onClick={() => handleSearch()} className="px-3 py-2 bg-gray-900 text-white rounded text-sm">Search</button>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: '#3cc919ff' }} /> <span>Available </span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} /> <span>On route </span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} /> <span>Resolving</span></div>
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-2 w-96 bg-white rounded shadow z-50 overflow-hidden">
                  <ul className="max-h-48 overflow-auto">
                    {suggestions.map((s) => (
                      <li key={s.place_id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onMouseDown={() => handleSelectSuggestion(s)}>
                        <div className="font-medium truncate">{s.display_name}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Centered on Egypt (approximate centroid) */}
            <MapContainer whenCreated={(m) => (mapRef.current = m)} center={[26.8206, 30.8025]} zoom={6} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {vehicles.map((v) => {
                if (!Number.isFinite(v.lat) || !Number.isFinite(v.lng)) return null
                const st = (v.status || '').toUpperCase()
                let color = '#6b7280' // default: offline/unknown
                if (st === 'AVAILABLE') color = '#10b981'
                else if (st === 'ON_ROUTE') color = '#f59e0b'
                else if (st === 'RESOLVING') color = '#ef4444'
                return (
                  <CircleMarker
                    key={v.id}
                    center={[v.lat, v.lng]}
                    radius={8}
                    pathOptions={{ color, fillColor: color, fillOpacity: 1, weight: 2 }}
                  >
                    <Popup>
                      <div className="font-medium">{v.name || `Vehicle ${v.id}`}</div>
                      <div className="text-xs text-gray-500">{v.status} • {v.type || '—'}</div>
                    </Popup>
                  </CircleMarker>
                )
              })}

              {incidents.map((inc) => (
                inc.lat && inc.lng ? (
                  <CircleMarker
                    key={`inc-${inc.id}`}
                    center={[inc.lat, inc.lng]}
                    radius={8}
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}
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

              <FitBounds coords={routeCoords} />
            </MapContainer>
          </div>


          {/* Vehicles table removed: map-only view keeps search and legend */}
        </div>

     
      </div>
    </div>
  )
}
