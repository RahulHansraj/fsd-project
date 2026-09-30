import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/command-center.css'
import CommandCenter from './pages/CommandCenter'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CommandCenter />
  </StrictMode>,
)