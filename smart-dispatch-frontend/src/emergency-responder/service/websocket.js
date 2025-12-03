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

  connect(onConnected, onError) {
    if (this.isConnecting || this.connected) {
      console.log('WebSocket already connecting or connected');
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),

        // ⭐ SEND JWT TOKEN IN CONNECT HEADERS
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
          this.subscribeToNotifications();

          // // ⭐ SERVER WILL KNOW THE USER FROM JWT
          // this.send(CONNECT_URL, {});

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
      if (this.connected) {
        // this.send(DISCONNECT_URL, {});
      }

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

  subscribeToNotifications() {
    if (!this.client || !this.connected) return;

    // Spring automatically maps /user/queue/... to the authenticated user from JWT
    // const destination = `user ${localStorage.getItem('userId')}/notifications`.replace(/ /g, '');
    const destination = `user/${localStorage.getItem('userId')}/assignment`;

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

  // send(destination, body) {
  //   if (!this.client || !this.connected) {
  //     console.warn('WebSocket not connected. Cannot send message.');
  //     return;
  //   }

  //   try {
  //     this.client.publish({
  //       destination,
  //       body: JSON.stringify(body),
  //     });
  //   } catch (err) {
  //     console.error('Error sending message:', err);
  //   }
  // }

  isConnected() {
    return this.connected;
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
