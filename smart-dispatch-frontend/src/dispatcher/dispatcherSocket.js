import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { getCurrentDispatcherId } from './dispatcherApi'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
// SockJS requires an http(s) URL (not ws://). Use API_BASE (http/https) for SockJS endpoint.
const WS_URL = API_BASE.replace(/\/$/, '') + '/ws'

let client = null
let connectionCount = 0

// Callback registries - allows multiple components to listen to the same events
const callbackRegistries = {
  onConnect: [],
  onError: [],
  onVehicle: [],
  onIncident: [],
  onAssignment: [],
  onNotification: [],
  onMessage: []
}

// Helper to call all registered callbacks for an event
function triggerCallbacks(eventType, data) {
  callbackRegistries[eventType]?.forEach(callback => {
    try {
      callback(data)
    } catch (e) {
      console.error(`[dispatcherSocket] Error in ${eventType} callback:`, e)
    }
  })
}

export function connect({ onMessage, onVehicle, onIncident, onAssignment, onNotification, onConnect, onError } = {}) {
  connectionCount++
  const connectionId = connectionCount
  console.log(`[dispatcherSocket] connect() called (connection #${connectionId})`)

  // Register callbacks from this component
  const registeredCallbacks = {}

  if (onConnect) {
    callbackRegistries.onConnect.push(onConnect)
    registeredCallbacks.onConnect = onConnect
  }
  if (onError) {
    callbackRegistries.onError.push(onError)
    registeredCallbacks.onError = onError
  }
  if (onVehicle) {
    callbackRegistries.onVehicle.push(onVehicle)
    registeredCallbacks.onVehicle = onVehicle
  }
  if (onIncident) {
    callbackRegistries.onIncident.push(onIncident)
    registeredCallbacks.onIncident = onIncident
  }
  if (onAssignment) {
    callbackRegistries.onAssignment.push(onAssignment)
    registeredCallbacks.onAssignment = onAssignment
  }
  if (onNotification) {
    callbackRegistries.onNotification.push(onNotification)
    registeredCallbacks.onNotification = onNotification
  }
  if (onMessage) {
    callbackRegistries.onMessage.push(onMessage)
    registeredCallbacks.onMessage = onMessage
  }

  // If client already exists and is active, return it
  if (client && client.active) {
    console.log(`[dispatcherSocket] Reusing existing connection for #${connectionId}`)
    // Trigger onConnect for this new subscriber
    if (onConnect) onConnect()
    return { client, connectionId, registeredCallbacks }
  }

  // Create new client
  console.log(`[dispatcherSocket] Creating new WebSocket connection for #${connectionId}`)
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  client = new Client({
    // use SockJS to match the server's sockjs endpoint
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    debug: (m) => console.debug('[stomp]', m),
  })

  client.onConnect = (frame) => {
    console.info('[stomp] connected')

    // Subscribe to vehicle status updates
    client.subscribe('/topic/vehicle/update', (msg) => {
      try {
        const body = JSON.parse(msg.body)
        triggerCallbacks('onVehicle', body)
      } catch (e) {
        console.error('[stomp] Error parsing vehicle message:', e)
      }
    })

    // Subscribe to vehicle assignment updates
    client.subscribe('/topic/assignment/update', (msg) => {
      try {
        console.log('[stomp] Raw assignment message:', msg.body)
        const body = JSON.parse(msg.body)
        triggerCallbacks('onAssignment', body)
      } catch (e) {
        console.error('[stomp] Error parsing assignment message:', e)
      }
    })

    // Subscribe to incidents (keeping existing)
    client.subscribe('/topic/incident/update', (msg) => {
      try {
        const body = JSON.parse(msg.body)
        triggerCallbacks('onIncident', body)
      } catch (e) {
        console.error('[stomp] Error parsing incident message:', e)
      }
    })

    // Subscribe to notifications (keeping existing)
    // client.subscribe('/topic/notifications', (msg) => {
    //   try {
    //     const body = JSON.parse(msg.body)
    //     triggerCallbacks('onNotification', body)
    //   } catch (e) {
    //     console.error('[stomp] Error parsing notification message:', e)
    //   }
    // })

    // Subscribe to user-specific assignment notifications
    // Get dispatcher ID from localStorage or context
    const dispatcherId = getCurrentDispatcherId()
    if (dispatcherId) {
      client.subscribe(`/user/${dispatcherId}/assignment`, (msg) => {
        try {
          const body = JSON.parse(msg.body)
          console.log('[stomp] received user-specific assignment:', body)
          triggerCallbacks('onAssignment', body)
        } catch (e) {
          console.error('[stomp] Error parsing user assignment message:', e)
        }
      })
    }

    // Trigger all onConnect callbacks
    triggerCallbacks('onConnect', frame)
  }

  client.onStompError = (err) => {
    console.error('[stomp] protocol error', err)
    triggerCallbacks('onError', err)
  }

  client.activate()
  return { client, connectionId, registeredCallbacks }
}

export function disconnect(connectionInfo) {
  if (!connectionInfo) {
    console.warn('[dispatcherSocket] disconnect() called with no connectionInfo')
    return
  }

  const { connectionId, registeredCallbacks } = connectionInfo

  console.log(`[dispatcherSocket] disconnect() called for connection #${connectionId}`)

  // Unregister this component's callbacks
  Object.entries(registeredCallbacks || {}).forEach(([eventType, callback]) => {
    const index = callbackRegistries[eventType]?.indexOf(callback)
    if (index !== undefined && index > -1) {
      callbackRegistries[eventType].splice(index, 1)
      console.log(`[dispatcherSocket] Unregistered ${eventType} callback for #${connectionId}`)
    }
  })

  // Check if any callbacks are still registered
  const hasActiveCallbacks = Object.values(callbackRegistries).some(arr => arr.length > 0)

  if (!hasActiveCallbacks && client) {
    console.log('[dispatcherSocket] No more active callbacks, closing WebSocket connection')
    client.deactivate()
    client = null
  } else {
    console.log('[dispatcherSocket] Keeping connection alive, other components still listening')
  }
}

export default { connect, disconnect }
