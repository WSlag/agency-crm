import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

// Initialize Firebase
import './config/firebase'

// Initialize service worker for PWA
import { registerSW } from 'virtual:pwa-register'

if ('serviceWorker' in navigator) {
  registerSW()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)