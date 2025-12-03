import React, { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Map, AlertCircle, CheckCircle, Truck, Moon, Sun } from 'lucide-react'
import { logout } from '../utils/api'
import VehicleMap from './pages/VehicleMap'
import DashboardOverview from './pages/DashboardOverview'
import './styles/Dispatcher.css'
import PendingIncidents from './pages/PendingIncidents'
import ActiveAssignments from './pages/ActiveAssignments'
import AvailableVehicles from './pages/AvailableVehicles'
import './styles/DispatcherDashboard.css'

function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    try {
      logout()
    } catch (e) {
      console.warn('logout helper failed', e)
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('user')
    }
    navigate('/login')
  }

  const MenuItem = ({ icon: Icon, label, to }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive
          ? 'dispatcher-menu-item dispatcher-menu-item-active'
          : 'dispatcher-menu-item'
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  )

  return (
    <div className="dispatcher-sidebar">
      <div className="dispatcher-brand">
        <div className="dispatcher-avatar">DS</div>
        <div>
          <h2>Dispatcher</h2>
          <p>Control Center</p>
        </div>
      </div>

      <div className="dispatcher-menu">
        <MenuItem icon={Map} label="Vehicle Map" to="/dispatcher/map" />
        <MenuItem icon={AlertCircle} label="Pending Incidents" to="/dispatcher/pending" />
        <MenuItem icon={CheckCircle} label="Assignments" to="/dispatcher/active" />
        <MenuItem icon={Truck} label="Vehicles" to="/dispatcher/vehicles" />
      </div>

      <div className="dispatcher-logout">
        <button onClick={handleLogout} className="dispatcher-logout-btn">
          Logout
        </button>
        <div className="dispatcher-user-info">Dispatcher</div>
      </div>
    </div>
  )
}

export default function DispatcherDashboard() {
  return (
    <div className="dispatcher-container">
      <Sidebar />

      <div className="dispatcher-main">
        <div className="dispatcher-content">
          <Routes>
            <Route path="/" element={
              <div className="view-container">
                <h1 className="page-title">Welcome to Dispatcher Control Center</h1>
                <p style={{ color: '#6b7280' }}>Select a menu item to get started.</p>
              </div>
            } />
            <Route path="map" element={<VehicleMap />} />
            <Route path="pending" element={<PendingIncidents />} />
            <Route path="active" element={<ActiveAssignments />} />
            <Route path="vehicles" element={<AvailableVehicles />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
