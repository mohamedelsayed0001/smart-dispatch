import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
const WS_URL = 'http://localhost:8080/ws';
// const CONNECT_URL = '/topic';
// const DISCONNECT_URL = '/topic';
// const NOTIFICATIONS_DESTINATION = '/user/queue/notifications';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.isConnecting = false;
  }

  connect(userId, onConnected, onError) {
    if (this.isConnecting || this.connected) {
      console.log('WebSocket already connecting or connected');
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),

        connectHeaders: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },

        debug: (str) => {
          if (import.meta.env.DEV) console.log('STOMP Debug:', str);
        },

        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: () => {
          console.log('WebSocket Connected');
          this.connected = true;
          this.isConnecting = false;

          // ⭐ SUBSCRIBE TO USER QUEUE
          this.subscribeToNotifications(userId);

          if (onConnected) onConnected();
          resolve();
        },

        onStompError: (frame) => {
          console.error('STOMP Error:', frame);
          this.connected = false;
          this.isConnecting = false;
          if (onError) onError(frame);
          reject(frame);
        },

        onWebSocketClose: () => {
          console.log('WebSocket Closed');
          this.connected = false;
          this.isConnecting = false;
        },
      });

      this.client.activate();
    });
  }

  disconnect() {
    if (!this.client) return;

    try {
      // Unsubscribe
      this.subscriptions.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      });

      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.isConnecting = false;
    } catch (err) {
      console.error('Error disconnecting WebSocket:', err);
    }
  }

  subscribeToNotifications(userId) {
    if (!this.client || !this.connected) return;
    
    const destination = `/topic/assignment/new/${userId}`;

    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('Received notification:', data);

          // Specific handlers
          const handlers = this.messageHandlers.get(data.type) || [];
          handlers.forEach((handler) => handler(data));

          // Generic handlers
          const genericHandlers = this.messageHandlers.get('*') || [];
          genericHandlers.forEach((handler) => handler(data));
        } catch (err) {
          console.error('Error processing message:', err);
        }
      });

      this.subscriptions.set('notifications', subscription);
    } catch (err) {
      console.error('Error subscribing to notifications:', err);
    }
  }

  onMessage(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }

    const handlers = this.messageHandlers.get(messageType);

    if (!handlers.includes(handler)) {
      handlers.push(handler);
    }
  }

  offMessage(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) return;

    const handlers = this.messageHandlers.get(messageType);
    const index = handlers.indexOf(handler);

    if (index !== -1) handlers.splice(index, 1);
  }

  isConnected() {
    return this.connected;
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
