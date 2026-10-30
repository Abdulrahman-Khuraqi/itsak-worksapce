// Itsak Workspace interface: React with shadcn/ui components, built by Vite into assets/app.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import { api, storage } from '@/lib/data'
import { translate } from '@/lib/i18n'
import { WorkspaceProvider } from '@/app/workspace'
import { App } from '@/App'

const root = createRoot(document.getElementById('root')!)
const lang = storage.get('lang') === 'ar' ? 'ar' : 'en'

api(undefined, translate(lang, 'serverDown'))
  .then((json) => root.render(
    <StrictMode>
      <WorkspaceProvider initial={json.data}><App /></WorkspaceProvider>
    </StrictMode>,
  ))
  .catch((err: Error) => root.render(<p className="mx-auto max-w-[52ch] p-10 text-base text-muted-foreground">{err.message}</p>))
