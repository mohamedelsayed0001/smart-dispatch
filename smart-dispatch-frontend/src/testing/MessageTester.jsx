import { useState } from 'react';
import { Client } from '@stomp/stompjs';
import './MessageTester.css';

const MessageTester = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const [channel, setChannel] = useState('topic');
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('message');
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Available channels matching backend endpoints
  const availableChannels = [
    { name: 'public', endpoint: '/app/public/send', broadcastTo: '/topic/public/messages' },
    { name: 'admin', endpoint: '/app/admin/send', broadcastTo: '/topic/admin/messages' },
    { name: 'dispatcher', endpoint: '/app/dispatcher/send', broadcastTo: '/topic/dispatcher/messages' },
    { name: 'user', endpoint: '/app/user/send', broadcastTo: '/topic/user/messages' },
    { name: 'app', endpoint: '/app/app/send', broadcastTo: '/topic/app/messages' }
  ];

  // Message types
  const messageTypes = ['message', 'alert', 'notification', 'event', 'command'];

  // Connect to WebSocket
  const connectToWebSocket = async () => {
    if (!jwtToken) {
      setError('Please provide a JWT token first');
      return;
    }

    console.log('Connecting with JWT:', jwtToken);
    setError(null);

    try {
      setLoading(true);
      const client = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        connectHeaders: {
          Authorization: `Bearer ${jwtToken}`
        },
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: (frame) => {
          console.log('WebSocket connected successfully!', frame);
          setConnected(true);
          setSuccess('Connected to WebSocket!');
          setTimeout(() => setSuccess(null), 3000);
          setStompClient(client);
          setLoading(false);
        },
        onStompError: (frame) => {
          console.error('WebSocket STOMP error - check backend logs:', frame);
          const errorMsg = frame.body || 'WebSocket connection failed';
          setError('WebSocket error: ' + errorMsg);
          setLoading(false);
        },
        onDisconnect: (frame) => {
          console.log('WebSocket disconnected:', frame);
          setConnected(false);
          setStompClient(null);
          setSentMessages([]);
        },
        onWebSocketClose: () => {
          console.error('WebSocket connection closed unexpectedly');
          setError('WebSocket connection closed');
          setConnected(false);
          setLoading(false);
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          setError('WebSocket connection error: ' + (error.message || 'Connection failed'));
          setLoading(false);
        },
        debug: (msg) => {
          console.log('[STOMP]', msg);
        }
      });

      console.log('Activating STOMP client...');
      client.activate();
    } catch (err) {
      console.error('Error creating WebSocket client:', err);
      setError('Error connecting to WebSocket: ' + err.message);
      setLoading(false);
    }
  };

  // Disconnect from WebSocket
  const disconnectFromWebSocket = () => {
    if (stompClient) {
      stompClient.deactivate();
      setConnected(false);
      setStompClient(null);
      setSentMessages([]);
      setSuccess('Disconnected from WebSocket');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Send test message
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!stompClient || !connected) {
      setError('Not connected to WebSocket');
      return;
    }

    if (!messageContent.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      // Get the endpoint for the selected channel
      const selectedChannel = availableChannels.find(c => c.name === channel);
      if (!selectedChannel) {
        setError('Invalid channel selected');
        return;
      }

      const message = {
        message: messageContent,
        type: messageType,
        channel: channel,
        timestamp: new Date().toISOString(),
        sender: 'test-user'
      };

      stompClient.publish({
        destination: selectedChannel.endpoint,
        body: JSON.stringify(message),
      });

      const sentMessage = {
        ...message,
        sentAt: new Date().toLocaleTimeString(),
        id: Date.now()
      };

      setSentMessages([sentMessage, ...sentMessages]);
      setSuccess('Message sent successfully!');
      setMessageContent('');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to send message: ' + err.message);
    }
  };

  // Send predefined test messages
  const sendPredefinedMessage = (predefinedType) => {
    const templates = {
      public_message: {
        content: JSON.stringify({
          type: 'public_message',
          message: 'Test message to public channel',
          timestamp: new Date().toISOString()
        }, null, 2)
      },
      admin_message: {
        content: JSON.stringify({
          type: 'admin_message',
          message: 'Test message to admin channel',
          timestamp: new Date().toISOString()
        }, null, 2)
      },
      dispatcher_message: {
        content: JSON.stringify({
          type: 'dispatcher_message',
          message: 'Test message to dispatcher channel',
          timestamp: new Date().toISOString()
        }, null, 2)
      },
      user_message: {
        content: JSON.stringify({
          type: 'user_message',
          message: 'Test message to user channel',
          timestamp: new Date().toISOString()
        }, null, 2)
      },
      app_message: {
        content: JSON.stringify({
          type: 'app_message',
          message: 'Test message to app channel',
          timestamp: new Date().toISOString()
        }, null, 2)
      }
    };

    if (templates[predefinedType]) {
      setMessageContent(templates[predefinedType].content);
    }
  };

  // Clear sent messages
  const clearMessages = () => {
    setSentMessages([]);
  };

  // Copy message content
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 1500);
  };

  return (
    <div className="message-tester">
      <h2>WebSocket Message Tester</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Connection Section */}
      <div className="connection-section">
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          <span className="status-text">
            {connected ? 'Connected to WebSocket' : 'Not Connected'}
          </span>
        </div>

        {!connected ? (
          <div className="jwt-input-section">
            <input
              type="text"
              placeholder="Paste JWT token here"
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              className="jwt-input"
            />
            <button
              className="btn btn-primary"
              onClick={connectToWebSocket}
              disabled={loading || !jwtToken}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        ) : (
          <button
            className="btn btn-danger"
            onClick={disconnectFromWebSocket}
          >
            Disconnect
          </button>
        )}
      </div>

      {connected && (
        <>
          {/* Message Form */}
          <div className="message-form-section">
            <h3>Send Test Message</h3>

            <form onSubmit={handleSendMessage} className="message-form">
              <div className="form-group">
                <label htmlFor="channel">Channel:</label>
                <select
                  id="channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="form-input"
                >
                  {availableChannels.map(ch => (
                    <option key={ch.name} value={ch.name}>
                      {ch.name} ({ch.endpoint})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="messageType">Message Type:</label>
                <select
                  id="messageType"
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  className="form-input"
                >
                  {messageTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message Content:</label>
                <textarea
                  id="message"
                  placeholder="Enter JSON or plain text message"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className="form-textarea"
                  rows="5"
                />
              </div>

              <button type="submit" className="btn btn-success btn-large">
                Send Message
              </button>
            </form>

            {/* Predefined Messages */}
            <div className="predefined-section">
              <h4>Quick Test Messages:</h4>
              <div className="predefined-buttons">
                <button
                  className="btn btn-info btn-small"
                  onClick={() => sendPredefinedMessage('public_message')}
                >
                  Public Message
                </button>
                <button
                  className="btn btn-info btn-small"
                  onClick={() => sendPredefinedMessage('admin_message')}
                >
                  Admin Message
                </button>
                <button
                  className="btn btn-info btn-small"
                  onClick={() => sendPredefinedMessage('dispatcher_message')}
                >
                  Dispatcher Message
                </button>
                <button
                  className="btn btn-info btn-small"
                  onClick={() => sendPredefinedMessage('user_message')}
                >
                  User Message
                </button>
                <button
                  className="btn btn-info btn-small"
                  onClick={() => sendPredefinedMessage('app_message')}
                >
                  App Message
                </button>
              </div>
            </div>
          </div>

          {/* Sent Messages History */}
          <div className="sent-messages-section">
            <div className="sent-header">
              <h3>Sent Messages ({sentMessages.length})</h3>
              {sentMessages.length > 0 && (
                <button
                  className="btn btn-danger btn-small"
                  onClick={clearMessages}
                >
                  Clear All
                </button>
              )}
            </div>

            {sentMessages.length === 0 ? (
              <p className="no-messages">No messages sent yet</p>
            ) : (
              <div className="messages-list">
                {sentMessages.map((msg) => (
                  <div key={msg.id} className="sent-message">
                    <div className="message-header">
                      <div className="message-info">
                        <span className="message-channel">
                          Channel: <strong>{msg.channel}</strong>
                        </span>
                        <span className="message-type">
                          Type: <strong>{msg.type}</strong>
                        </span>
                        <span className="message-time">{msg.sentAt}</span>
                      </div>
                      <button
                        className="btn btn-small"
                        onClick={() => copyToClipboard(JSON.stringify(msg, null, 2))}
                      >
                        Copy
                      </button>
                    </div>
                    <div className="message-body">
                      <pre>{JSON.stringify(msg, null, 2)}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MessageTester;
