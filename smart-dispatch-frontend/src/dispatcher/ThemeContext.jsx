import React, { createContext, useState, useEffect } from 'react'

export const ThemeContext = createContext()

export default function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const v = localStorage.getItem('theme_dark')
      return v ? JSON.parse(v) : false
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    // set both: a `dark` class (for Tailwind/class-based dark mode)
    // and a `data-theme` attribute (for custom CSS variables in index.css)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme_dark', JSON.stringify(dark))
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  )
}
