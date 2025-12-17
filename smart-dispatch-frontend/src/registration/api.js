export const login = async (email, password) => {
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => null)
    throw new Error(errText || 'Login failed')
  }

  const data = await res.json()
  if (data.token) {
    localStorage.setItem("authToken", data.token)
    localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }))
  }
  return data
}

export const signup = async (name, email, password, role = 'OPERATOR') => {
  const res = await fetch('http://localhost:8080/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });

  if (res.status === 409) {
    // email exists
    const data = await res.json().catch(() => null)

    return { conflict: true, data }
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => null)
    throw new Error(errText || 'Signup failed')
  }

  const data = await res.json()
  if (data.token) {
    localStorage.setItem("authToken", data.token)
    localStorage.setItem('user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }))
  }
  return data
}

