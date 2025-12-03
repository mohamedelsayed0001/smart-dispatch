import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
// SockJS requires an http(s) URL (not ws://). Use API_BASE (http/https) for SockJS endpoint.
const WS_URL = API_BASE.replace(/\/$/, '') + '/ws'

let client = null

export function connect({ onMessage, onVehicle, onIncident, onAssignment, onNotification, onConnect, onError } = {}) {
  if (client && client.active) return client

  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null

  client = new Client({
    // use SockJS to match the server's sockjs endpoint
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    debug: (m) => console.debug('[stomp]', m),
  })

  client.onConnect = (frame) => {
    console.info('[stomp] connected')

    client.subscribe('/topic/vehicles', (msg) => {
      try {
        const body = JSON.parse(msg.body)
        onVehicle && onVehicle(body)
      } catch (e) {
        onVehicle && onVehicle(msg.body)
      }
    })

    client.subscribe('/topic/incidents', (msg) => {
      try {
        const body = JSON.parse(msg.body)
        onIncident && onIncident(body)
      } catch (e) {
        onIncident && onIncident(msg.body)
      }
    })

    client.subscribe('/topic/assignments', (msg) => {
      try {
        const body = JSON.parse(msg.body)
        onAssignment && onAssignment(body)
      } catch (e) {
        onAssignment && onAssignment(msg.body)
      }
    })

    client.subscribe('/topic/notifications', (msg) => {
      try {
        const body = JSON.parse(msg.body)
        onNotification && onNotification(body)
      } catch (e) {
        onNotification && onNotification(msg.body)
      }
    })
    onConnect && onConnect(frame)
  }

  client.onStompError = (err) => {
    console.error('[stomp] protocol error', err)
    onError && onError(err)
  }

  client.activate()
  return client
}

export function disconnect() {
  if (client) {
    client.deactivate()
    client = null
  }
}

export default { connect, disconnect }
