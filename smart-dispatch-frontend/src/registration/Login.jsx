import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as apiLogin } from './api.js'
import { useAuth } from '../components/AuthProvider.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const data = await apiLogin(email, password)

      // Update auth context
      login(
        { id: data.id, name: data.name, email: data.email, role: data.role },
        data.token
      )

      if (data.role == 'OPERATOR') {
        navigate('/responder')
      } else if (data.role == 'DISPATCHER') {
        navigate('/dispatcher')
      } else if (data.role == 'CITIZEN') {
        navigate('/reportform')
      } else if (data.role == 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('*')
      }

      setLoading(false)
    } catch (err) {
      console.error('Login error', err)
      setError(err.message || 'Network error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6f8]">
      <div className="w-full max-w-md p-8 rounded-2xl shadow bg-white">
        <h2 className="text-3xl font-semibold mb-4 flex justify-center">Sign in</h2>
        <p className="text-sm text-gray-500 ml-7">Enter your credentials to continue</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="px-4 py-3 rounded-lg border focus:outline-none"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="px-4 py-3 rounded-lg border focus:outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button className="px-4 py-3 rounded-lg bg-[#E11D2F] text-white font-semibold" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-[#E11D2F] font-medium">Create one</Link>
        </div>
      </div>
    </div>
  )
}
