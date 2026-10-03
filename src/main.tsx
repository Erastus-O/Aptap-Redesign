import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@aptap/design-system/src/styles/fonts.css'
import '@aptap/design-system/dist/tokens.css'
import '@aptap/design-system/dist/typography.css'
// Tailwind's own reset/utility layers must be declared before the design
// system's `@layer ap-base, ap-components, ap-utilities`, so its component
// styles (imported after) win cascade-layer priority over Tailwind preflight.
import './index.css'
import '@aptap/design-system/src/styles/components.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
