import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 注册PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    import('./lib/serviceWorkerRegistration').then(({ registerServiceWorker }) => {
      registerServiceWorker()
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
