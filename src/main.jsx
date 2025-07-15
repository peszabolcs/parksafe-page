import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if (window.location.hash.includes('access_token=') && window.location.hash.includes('type=signup')) {
    window.location.href = 'https://parksafe.hu/success';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
