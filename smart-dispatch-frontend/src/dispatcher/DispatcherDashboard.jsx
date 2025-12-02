import React from 'react'
import { Routes, Route, Link, NavLink } from 'react-router-dom'
import VehicleMap from './pages/VehicleMap'
import PendingIncidents from './pages/PendingIncidents'
import ActiveAssignments from './pages/ActiveAssignments'
import AvailableVehicles from './pages/AvailableVehicles'

function TopBar() {
  return (
    <div className="flex items-center justify-between px-6 h-20 bg-transparent">
      <div className="flex items-center gap-4">
        <Link to="/dispatcher" className="text-2xl font-bold">Dispatcher</Link>
        <div className="text-sm text-gray-500">Control Center</div>
      </div>
    </div>
  )
}

function Sidebar() {
  const items = [
    { to: '/dispatcher/map', label: 'Vehicle Map' },
    { to: '/dispatcher/pending', label: 'Pending Incidents' },
    { to: '/dispatcher/active', label: 'Assignments' },
    { to: '/dispatcher/vehicles', label: 'Vehicles' },
  ]
  return (
    <aside className="w-72 text-white h-[calc(100vh-64px)] p-6 flex flex-col justify-between rounded-tl-3xl rounded-bl-3xl" style={{backgroundColor: '#E11D2F'}}>
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center font-bold">D</div>
          <div>
            <div className="font-semibold">Dispatcher</div>
            <div className="text-xs opacity-80">Control</div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} className={({ isActive }) => `px-4 py-3 rounded-lg hover:bg-white/10 transition-colors ${isActive ? 'bg-white/20' : ''}`}>
              <span className="text-white">{it.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        <button className="w-full px-4 py-3 rounded-full bg-white border border-[#E11D2F] text-[#E11D2F] font-semibold shadow">Logout</button>
        <div className="mt-3 text-xs opacity-80">Employee</div>
      </div>
    </aside>
  )
}

export default function DispatcherDashboard() {
  return (
    <div className="min-h-screen bg-[#f3f6f8] text-gray-900">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="p-6 rounded-2xl shadow bg-white">
            <Routes>
              <Route path="/" element={<div className="p-6 rounded shadow bg-white">Welcome to Dispatcher</div>} />
              <Route path="map" element={<VehicleMap />} />
              <Route path="pending" element={<PendingIncidents />} />
              <Route path="active" element={<ActiveAssignments />} />
              <Route path="vehicles" element={<AvailableVehicles />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}
