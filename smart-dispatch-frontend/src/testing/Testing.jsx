import { useState } from 'react'
import UserManagement from './UserManagement'
import ChannelSubscription from './ChannelSubscription'
import MessageTester from './MessageTester'
import './Testing.css'

function Testing() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="testing-page">
      <header className="testing-header">
        <h1>🔐 Smart Dispatch - Backend Testing Dashboard</h1>
        <p>Secret testing interface for backend APIs and WebSocket connections</p>
      </header>

      <nav className="testing-nav">
        <button
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Management
        </button>
        <button
          className={`nav-btn ${activeTab === 'channels' ? 'active' : ''}`}
          onClick={() => setActiveTab('channels')}
        >
          📡 Channel Subscription
        </button>
        <button
          className={`nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          💬 Message Tester
        </button>
      </nav>

      <main className="testing-main">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'channels' && <ChannelSubscription />}
        {activeTab === 'messages' && <MessageTester />}
      </main>

      <footer className="testing-footer">
        <p>🔐 Secret Testing Interface | Smart Dispatch © 2025</p>
      </footer>
    </div>
  )
}

export default Testing
