// Everything the views share: the workspace data, the language, the current page,
// the filters, and which edit window is open. Every change goes to api.php, which
// answers with the saved file, and the page re-renders from that.
import * as React from 'react'
import { toast } from 'sonner'

import { api, ApiError, storage, todayYmd, parseYmd, type ItemType, type Workspace, type Task, type Desk, type Note } from '@/lib/data'
import { translate, type Lang, type TKey } from '@/lib/i18n'

export type View = 'today' | 'desks' | 'desk' | 'tasks' | 'calendar' | 'notes'
const VIEWS: View[] = ['today', 'desks', 'desk', 'tasks', 'calendar', 'notes']

export interface Filters { q: string; desk: string; status: string; sort: string; noteQ: string; noteDesk: string }

export type Editor =
  | { kind: 'task'; item: Partial<Task> }
  | { kind: 'desk'; item: Partial<Desk> }
  | { kind: 'note'; item: Partial<Note> }
  | null

interface Ctx {
  data: Workspace
  lang: Lang
  tr: (key: TKey | string, vars?: Record<string, string | number>) => string
  fmt: (date: string | Date, opts: Intl.DateTimeFormatOptions) => string
  fmtShort: (s: string) => string
  fmtLong: (s: string) => string
  toggleLang: () => void
  route: { view: View; id: string | null }
  filters: Filters
  setFilter: (key: keyof Filters, value: string) => void
  month: [number, number]
  setMonth: (m: [number, number]) => void
  change: (body: object, message?: string) => Promise<{ data: Workspace; id?: string }>
  saveItem: (type: ItemType, item: object, message?: string) => Promise<{ data: Workspace; id?: string }>
  editor: Editor
  openEditor: (editor: Editor) => void
  newTask: (item?: Partial<Task>) => void
  confirm: (message: string) => Promise<boolean>
  confirmState: { message: string; resolve: (ok: boolean) => void } | null
  authEnabled: boolean
}

const WorkspaceContext = React.createContext<Ctx | null>(null)

export function useWorkspace() {
  const ctx = React.useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace outside WorkspaceProvider')
  return ctx
}

function readHash() {
  const [view, id] = location.hash.replace(/^#/, '').split('/')
  return { view: (VIEWS.includes(view as View) ? view : 'today') as View, id: id ? decodeURIComponent(id) : null }
}

export function WorkspaceProvider({ initial, children }: { initial: Workspace; children: React.ReactNode }) {
  const [data, setData] = React.useState(initial)
  const [lang, setLang] = React.useState<Lang>(() =>
    (storage.get('lang') || (navigator.language || '').slice(0, 2)) === 'ar' ? 'ar' : 'en')
  const [route, setRoute] = React.useState(readHash)
  const [filters, setFilters] = React.useState<Filters>({ q: '', desk: '', status: 'open', sort: 'mine', noteQ: '', noteDesk: '' })
  const [month, setMonth] = React.useState<[number, number]>(() => [new Date().getFullYear(), new Date().getMonth()])
  const [editor, setEditor] = React.useState<Editor>(null)
  const [confirmState, setConfirmState] = React.useState<Ctx['confirmState']>(null)
  const [, setTick] = React.useState(0)

  const tr = React.useCallback((key: TKey | string, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang])
  const fmt = React.useCallback((date: string | Date, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(lang === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-GB', opts).format(typeof date === 'string' ? parseYmd(date) : date), [lang])

  React.useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  React.useEffect(() => {
    const onHash = () => {
      setRoute(readHash())
      window.scrollTo(0, 0)
    }
    // Come back to a tab after midnight and "Today" should mean today.
    const onVisible = () => { if (!document.hidden) setTick((n) => n + 1) }
    window.addEventListener('hashchange', onHash)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('hashchange', onHash)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const change = React.useCallback(async (body: object, message?: string) => {
    try {
      const json = await api(body, translate(lang, 'serverDown'))
      setData(json.data)
      if (message) toast.success(message)
      return json
    } catch (err) {
      if (err instanceof ApiError && err.message) toast.error(err.message, { duration: 6000 })
      throw err
    }
  }, [lang])

  const saveItem = React.useCallback((type: ItemType, item: object, message = translate(lang, 'saved')) =>
    change({ action: 'save', type, item }, message), [change, lang])

  const confirm = React.useCallback((message: string) =>
    new Promise<boolean>((resolve) => setConfirmState({ message, resolve })), [])

  const value: Ctx = {
    data,
    lang,
    tr,
    fmt,
    fmtShort: (s) => fmt(s, { day: 'numeric', month: 'short' }),
    fmtLong: (s) => fmt(s, { weekday: 'long', day: 'numeric', month: 'long' }),
    toggleLang: () => setLang((l) => { const next = l === 'ar' ? 'en' : 'ar'; storage.set('lang', next); return next }),
    route,
    filters,
    setFilter: (key, v) => setFilters((f) => ({ ...f, [key]: v })),
    month,
    setMonth,
    change,
    saveItem,
    editor,
    openEditor: setEditor,
    newTask: (item = {}) => setEditor({
      kind: 'task',
      item: { deskId: route.view === 'desk' ? route.id ?? '' : '', due: '', status: 'todo', ...item },
    }),
    confirm,
    confirmState: confirmState && {
      message: confirmState.message,
      resolve: (ok) => { confirmState.resolve(ok); setConfirmState(null) },
    },
    authEnabled: document.body.dataset.auth === '1',
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

/* ---------- Backup ---------- */

export function exportData(data: Workspace) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `itsak-workspace-${todayYmd()}.json`
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function useImport() {
  const { tr, confirm, change } = useWorkspace()
  return React.useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      let parsed: unknown
      try { parsed = JSON.parse(await file.text()) } catch { toast.error(tr('badFile')); return }
      const data = parsed as Record<string, unknown> | null
      if (!data || typeof data !== 'object' || !['desks', 'tasks', 'notes'].some((k) => Array.isArray(data[k]))) {
        toast.error(tr('badFile'))
        return
      }
      if (!(await confirm(tr('importAsk', { file: file.name })))) return
      await change({ action: 'import', data }, tr('imported')).catch(() => {})
    }
    input.click()
  }, [tr, confirm, change])
}

export function signOut() {
  const form = document.createElement('form')
  form.method = 'post'
  form.innerHTML = '<input type="hidden" name="logout" value="1">'
  document.body.append(form)
  form.submit()
}
