import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { BatchesProvider } from './Contexts/BatchContext.tsx'


import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <BatchesProvider>
    <App />
    </BatchesProvider>
    </BrowserRouter>
  </StrictMode>,
)
