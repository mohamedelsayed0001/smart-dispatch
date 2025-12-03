import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './index.css'
import Testing from './testing/Testing'
import AdminPage from './pages/AdminPage'
import DispatcherDashboard from './dispatcher/DispatcherDashboard'
import ThemeProvider from './dispatcher/ThemeContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResponderDashboard from './emergency-responder/ResponderDashboard'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/test" element={<Testing />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dispatcher/*" element={<DispatcherDashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/responder/*" element={<ResponderDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
