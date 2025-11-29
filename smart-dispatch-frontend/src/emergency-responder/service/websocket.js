import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.isConnecting = false;
    this.userId = null;
  }

  connect(userId, onConnected, onError) {
    // Prevent duplicate connections
    if (this.isConnecting || this.connected) {
      console.log('WebSocket already connecting or connected');
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.userId = userId;

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        debug: (str) => {
          // Only log errors in production
          if (import.meta.env.DEV) {
            console.log('STOMP Debug:', str);
          }
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket Connected');
          this.connected = true;
          this.isConnecting = false;
          
          // Subscribe to user-specific notifications
          this.subscribeToNotifications(userId);
          
          // Send connection message with userId in the destination
          this.send(`/app/responder/connect/${userId}`, {});
          
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
      // Send disconnect message with userId
      if (this.connected && this.userId) {
        this.send(`/app/responder/disconnect/${this.userId}`, {});
      }
      
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((subscription) => {
        try {
          subscription.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      });
      this.subscriptions.clear();
      
      this.client.deactivate();
      this.connected = false;
      this.isConnecting = false;
      this.client = null;
      this.userId = null;
    } catch (err) {
      console.error('Error disconnecting WebSocket:', err);
    }
  }

  subscribeToNotifications(userId) {
    if (!this.client || !this.connected) return;

    // Subscribe to user-specific queue
    const destination = `/user/queue/notifications`;
    
    try {
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('Received notification:', data);
          
          // Call registered handlers for this message type
          const handlers = this.messageHandlers.get(data.type) || [];
          handlers.forEach((handler) => {
            try {
              handler(data);
            } catch (err) {
              console.error('Error in message handler:', err);
            }
          });
          
          // Call generic notification handler
          const genericHandlers = this.messageHandlers.get('*') || [];
          genericHandlers.forEach((handler) => {
            try {
              handler(data);
            } catch (err) {
              console.error('Error in generic handler:', err);
            }
          });
        } catch (err) {
          console.error('Error processing message:', err);
        }
      });

      this.subscriptions.set('notifications', subscription);
    } catch (err) {
      console.error('Error subscribing to notifications:', err);
    }
  }

  // Register a handler for specific message type
  onMessage(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    const handlers = this.messageHandlers.get(messageType);
    
    // Prevent duplicate handlers
    if (!handlers.includes(handler)) {
      handlers.push(handler);
    }
  }

  // Remove a message handler
  offMessage(messageType, handler) {
    if (this.messageHandlers.has(messageType)) {
      const handlers = this.messageHandlers.get(messageType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Send message to server
  send(destination, body) {
    if (this.client && this.connected) {
      try {
        this.client.publish({
          destination,
          body: JSON.stringify(body),
        });
      } catch (err) {
        console.error('Error sending message:', err);
      }
    } else {
      console.warn('WebSocket not connected. Cannot send message.');
    }
  }

  // Send location update with userId in destination
  sendLocationUpdate(locationData) {
    if (this.userId) {
      this.send(`/app/location/update/${this.userId}`, locationData);
    } else {
      console.warn('Cannot send location update: userId not set');
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;