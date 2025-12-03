import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup as apiSignup } from '../utils/api'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CITIZEN')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const resp = await apiSignup(name, email, password, role)
      if (resp && resp.conflict) {
        setError('Email already exists')
        setLoading(false)
        return
      }
      // apiSignup stores token and user already
      setLoading(false)
      navigate('/dispatcher')
    } catch (err) {
      console.error('Signup error', err)
      setError(err.message || 'Network error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6f8]">
      <div className="w-full max-w-md p-8 rounded-2xl shadow bg-white">
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>
        <p className="text-sm text-gray-500 mb-6">Register a new account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="px-4 py-3 rounded-lg border focus:outline-none"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-[#E11D2F] font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
