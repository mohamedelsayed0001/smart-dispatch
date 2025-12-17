import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import './index.css'
import ThemeProvider from './dispatcher/ThemeContext'
import { AuthProvider } from './components/AuthProvider'
import { routes } from './routes.jsx'


function App() {
  const router = createBrowserRouter(routes)

  return (
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
