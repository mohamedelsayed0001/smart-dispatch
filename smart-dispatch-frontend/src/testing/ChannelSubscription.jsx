import { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import './ChannelSubscription.css';

const ChannelSubscription = () => {
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState('');
  const [jwtToken, setJwtToken] = useState(null);
  const [connected, setConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Available preset channels for testing
  const presetChannels = [
    '/topic/public/messages',
    '/topic/admin/messages',
    '/topic/dispatcher/messages'
  ];

  // Connect to WebSocket
  const connectToWebSocket = async () => {
    if (!jwtToken) {
      setError('Please get a JWT token first from User Management');
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
          setChannels([]);
          setMessages({});
          setStompClient(null);
          setChannels([]);
            setMessages({});
            setStompClient(null);
            setSuccess('Disconnected from WebSocket');
            setTimeout(() => setSuccess(null), 3000);
        },
        onWebSocketClose: () => {
          console.error('WebSocket connection closed unexpectedly');
          setError('WebSocket connection closed');
          setConnected(false);
          setLoading(false);
          setChannels([]);
            setMessages({});
            setStompClient(null);
            setSuccess('Disconnected from WebSocket');
            setTimeout(() => setSuccess(null), 3000);
        },
        onWebSocketError: (error) => {
          console.error('WebSocket error:', error);
          setError('WebSocket connection error: ' + (error.message || 'Connection failed'));
          setLoading(false);
          setConnected(false);
            setChannels([]);
            setMessages({});
            setStompClient(null);
            setSuccess('Disconnected from WebSocket');
            setTimeout(() => setSuccess(null), 3000);
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
      setChannels([]);
      setMessages({});
      setStompClient(null);
      setSuccess('Disconnected from WebSocket');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Test ping
  const testPing = () => {
    if (!stompClient || !connected) {
      setError('Not connected to WebSocket');
      return;
    }

    try {
      console.log('Sending ping test...');
      stompClient.publish({
        destination: '/app/ping',
        body: JSON.stringify({ test: 'ping message' }),
      });
      setSuccess('Ping sent! Check /topic/pong subscription');
    } catch (err) {
      setError('Failed to send ping: ' + err.message);
    }
  };

  // Subscribe to a channel
  const subscribeToChannel = (channel) => {
    if (!stompClient || !connected) {
      setError('Not connected to WebSocket');
      return;
    }

    if (channels.includes(channel)) {
      setError(`Already subscribed to ${channel}`);
      return;
    }

    try {
      stompClient.subscribe(
        `${channel}`,
        (message) => {
          try {
            const body = JSON.parse(message.body);
            setMessages(prev => ({
              ...prev,
              [channel]: [...(prev[channel] || []), {
                ...body,
                timestamp: new Date().toLocaleTimeString()
              }]
            }));
          } catch (e) {
            // If not JSON, just display as string
            setMessages(prev => ({
              ...prev,
              [channel]: [...(prev[channel] || []), {
                message: message.body,
                timestamp: new Date().toLocaleTimeString()
              }]
            }));
          }
        }
      );

      setChannels([...channels, channel]);
      setSuccess(`Subscribed to ${channel}`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to subscribe to channel: ' + err.message);
    }
  };

  // Unsubscribe from a channel
  const unsubscribeFromChannel = (channel) => {
    // Note: In a real app, you would need to track subscriptions
    setChannels(channels.filter(c => c !== channel));
    setMessages(prev => {
      const updated = { ...prev };
      delete updated[channel];
      return updated;
    });
    setSuccess(`Unsubscribed from ${channel}`);
    setTimeout(() => setSuccess(null), 2000);
  };

  // Add custom channel
  const handleAddChannel = (e) => {
    e.preventDefault();
    if (!newChannel.trim()) {
      setError('Channel name cannot be empty');
      return;
    }

    const channelName = newChannel.toLowerCase().replace(/\s+/g, '_');
    if (channels.includes(channelName)) {
      setError('Already subscribed to this channel');
      return;
    }

    subscribeToChannel(channelName);
    setNewChannel('');
  };

  // Clear messages for a channel
  const clearChannelMessages = (channel) => {
    setMessages(prev => ({
      ...prev,
      [channel]: []
    }));
  };

  return (
    <div className="channel-subscription">
      <h2>WebSocket Channel Subscription</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Connection Status */}
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
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={testPing}
            >
              Test Ping
            </button>
            <button
              className="btn btn-danger"
              onClick={disconnectFromWebSocket}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {connected && (
        <>
          {/* Subscribe Section */}
          <div className="subscribe-section">
            <h3>Subscribe to Channels</h3>

            <div className="preset-channels">
              <p className="section-label">Preset Channels:</p>
              <div className="channel-buttons">
                {presetChannels.map(channel => (
                  <button
                    key={channel}
                    className={`btn btn-channel ${channels.includes(channel) ? 'subscribed' : ''}`}
                    onClick={() => subscribeToChannel(channel)}
                    disabled={channels.includes(channel)}
                  >
                    {channel}
                    {channels.includes(channel) && ' ✓'}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-channel">
              <p className="section-label">Custom Channel:</p>
              <form onSubmit={handleAddChannel} className="custom-form">
                <input
                  type="text"
                  placeholder="Enter channel name (e.g., my_test_channel)"
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value)}
                  className="channel-input"
                />
                <button type="submit" className="btn btn-success">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Messages Section */}
          <div className="messages-section">
            <h3>Messages</h3>

            {channels.length === 0 ? (
              <p className="no-channels">No subscribed channels. Subscribe to a channel to see messages.</p>
            ) : (
              <div className="channels-messages">
                {channels.map(channel => (
                  <div key={channel} className="channel-messages-box">
                    <div className="channel-header">
                      <h4>{channel}</h4>
                      <div className="channel-actions">
                        <span className="message-count">
                          {(messages[channel] || []).length} messages
                        </span>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => unsubscribeFromChannel(channel)}
                        >
                          Unsubscribe
                        </button>
                        <button
                          className="btn btn-small btn-info"
                          onClick={() => clearChannelMessages(channel)}
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="messages-container">
                      {!messages[channel] || messages[channel].length === 0 ? (
                        <p className="no-messages">Waiting for messages...</p>
                      ) : (
                        <div className="messages-list">
                          {messages[channel].map((msg, idx) => (
                            <div key={idx} className="message-item">
                              <div className="message-meta">
                                <span className="message-time">{msg.timestamp}</span>
                              </div>
                              <div className="message-content">
                                <pre>{JSON.stringify(msg, null, 2)}</pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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

export default ChannelSubscription;
