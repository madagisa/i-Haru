import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Initialize theme from localStorage
const initTheme = () => {
  const savedTheme = localStorage.getItem('iharu-theme') || 'auto'
  const root = document.documentElement

  if (savedTheme === 'dark') {
    root.setAttribute('data-theme', 'dark')
  } else if (savedTheme === 'light') {
    root.setAttribute('data-theme', 'light')
  } else {
    // Auto - use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  }
}

initTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

