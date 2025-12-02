import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import './index.css'
import Testing from './testing/Testing'
import AdminPage from './pages/AdminPage'
import DispatcherDashboard from './dispatcher/DispatcherDashboard'
import ThemeProvider from './dispatcher/ThemeContext'
import Login from './pages/Login'
import Signup from './pages/Signup'

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
          <Route path="*" element={<h1>NOT YET</h1>} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
