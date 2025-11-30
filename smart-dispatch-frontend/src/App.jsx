import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Testing from './testing/Testing'
import AdminPage from './pages/AdminPage'
import ResponderDashboard from './emergency-responder/ResponderDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/test" element={<Testing />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/responder/dashboard" element={<ResponderDashboard />} />
        <Route path="*" element={<h1>NOT YET</h1>} />
      </Routes>
    </Router>
  )
}

export default App
