import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ZoomProvider } from './components/ZoomContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ZoomProvider>
    <App />
    </ZoomProvider>
  </React.StrictMode>,
)
