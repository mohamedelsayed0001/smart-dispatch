import React, { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Map, AlertCircle, CheckCircle, Truck, Moon, Sun } from 'lucide-react'
import { connect, disconnect } from './dispatcherSocket.js'
import Toast from './components/Toast'
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
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
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
        <MenuItem icon={AlertCircle} label="Incidents" to="/dispatcher/pending" />
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
  const [wsConnected, setWsConnected] = useState(false)
  const [toast, setToast] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [vehicles, setVehicles] = useState([])

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() })
  }

  useEffect(() => {
    console.log('[DispatcherDashboard] Establishing WebSocket connection...')

    // Establish single WebSocket connection for entire dashboard
    const client = connect({
      onConnect: () => {
        console.log('[DispatcherDashboard] WebSocket connected successfully')
        setWsConnected(true)
        showToast('✓ Connected to real-time updates', 'success')
      },
      onError: (error) => {
        console.error('[DispatcherDashboard] WebSocket error:', error)
        setWsConnected(false)
        showToast('⚠ Connection error - Reconnecting...', 'error')
      },
      onVehicle: (vehicle) => {
        console.log('[DispatcherDashboard] Received vehicle update:', vehicle)

        const statusMessages = {
          'AVAILABLE': `🚗 Vehicle ${vehicle.id} is now available`,
          'ONROUTE': `🚨 Vehicle ${vehicle.id} is on route`,
          'RESOLVING': `⚙️ Vehicle ${vehicle.id} is resolving incident`,
          'MAINTENANCE': `🔧 Vehicle ${vehicle.id} is in maintenance`
        }

        const message = statusMessages[vehicle.status?.toUpperCase()] ||
          `Vehicle ${vehicle.id} status: ${vehicle.status}`
        showToast(message, 'info')

        setVehicles(prev => {
          const idx = prev.findIndex(p => p.id === vehicle.vehicleId)

          if (idx === -1) return prev

          const updated = [...prev]
          updated[idx] = {
            ...updated[idx],
            status: vehicle.newStatus,
            currentLongitude: vehicle.longitude,
            currentLatitude: vehicle.latitude,
            lng: vehicle.longitude,
            lat: vehicle.latitude
          }

          return updated
        })

      },
      onAssignment: (assignment) => {
        console.log('[DispatcherDashboard] Received assignment update:', assignment)

        const statusMessages = {
          'PENDING': `📋 New assignment #${assignment.id} created`,
          'ACTIVE': `✅ Assignment #${assignment.id} accepted by responder`,
          'COMPLETED': `✓ Assignment #${assignment.id} completed`,
          'REJECTED': `❌ Assignment #${assignment.id} rejected`,
          'CANCELED': `⊗ Assignment #${assignment.id} canceled`
        }

        const message = statusMessages[assignment.respone?.toUpperCase()] ||
          `Assignment #${assignment.id}: ${assignment.status}`

        const toastType = {
          'ACTIVE': 'success',
          'COMPLETED': 'success',
          'REJECTED': 'warning',
          'CANCELED': 'warning',
          'PENDING': 'info'
        }[assignment.respone?.toUpperCase()] || 'info'

        showToast(message, toastType)

        setAssignments(prev => {
          const idx = prev.findIndex(p => p.id === assignment.assignmentId)

          if (idx === -1) return prev

          const updated = [...prev]
          updated[idx] = {
            ...updated[idx],
            status: assignment.response
          }

          return updated
        })
      },
      onIncident: (incident) => {
        console.log('[DispatcherDashboard] Received incident update:', incident)
        if (incident.status?.toUpperCase() === 'PENDING') {
          showToast(`🚨 New ${incident.type} incident reported`, 'warning')
        }
      },
      onNotification: (notification) => {
        console.log('[DispatcherDashboard] Received notification:', notification)
        if (notification.message) {
          const type = notification.type?.toLowerCase() === 'success' ? 'success' : 'info'
          showToast(notification.message, type)
        }
      }
    })

    // Cleanup on unmount
    return () => {
      console.log('[DispatcherDashboard] Disconnecting WebSocket...')
      disconnect(client)
      setWsConnected(false)
    }
  }, [])

  return (
    <div className="dispatcher-container">
      <Sidebar />

      <div className="dispatcher-main">
        {/* Optional: Show connection status indicator */}
        {!wsConnected && (
          <div style={{
            padding: '8px 16px',
            background: '#fef3c7',
            color: '#92400e',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Connecting to real-time updates...
          </div>
        )}

        {/* Toast notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="dispatcher-content">
          <Routes>
            <Route path="/" element={
              <div className="view-container">
                <h1 className="page-title">Welcome to Dispatcher Control Center</h1>
                <p style={{ color: '#6b7280' }}>Select a menu item to get started.</p>
                {wsConnected && (
                  <p style={{ color: '#10b981', fontSize: '14px', marginTop: '8px' }}>
                    ✓ Real-time updates active
                  </p>
                )}
              </div>
            } />
            <Route path="map" element={<VehicleMap />} />
            <Route path="pending" element={<PendingIncidents />} />
            <Route path="active" element={<ActiveAssignments assignments={assignments} setAssignments={setAssignments} />} />
            <Route path="vehicles" element={<AvailableVehicles vehicles={vehicles} setVehicles={setVehicles} />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
