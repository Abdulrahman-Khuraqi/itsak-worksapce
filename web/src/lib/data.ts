// The shape of data/workspace.json, date helpers, and the calls to api.php.

export const DESK_COLORS = ['purple', 'lilac', 'orange', 'amber', 'red', 'zinc', 'white'] as const
// waiting = blocked on someone else (client files, a service that is down, …)
export const STATUSES = ['todo', 'doing', 'waiting', 'done'] as const
export const PRIORITIES = ['low', 'normal', 'high'] as const
const PRIORITY_RANK = { high: 0, normal: 1, low: 2 }

export type DeskColor = (typeof DESK_COLORS)[number]
export type Status = (typeof STATUSES)[number]
export type Priority = (typeof PRIORITIES)[number]

export interface Desk { id: string; name: string; color: DeskColor; description: string; created: string; updated: string }
export interface Step { text: string; done: boolean }
export interface Task {
  id: string; deskId: string; title: string; status: Status; priority: Priority; due: string; notes: string
  checklist: Step[]; waitingFor: string; order?: number | null; doneAt: string | null; created: string; updated: string
}
export interface Note { id: string; deskId: string; title: string; body: string; pinned: boolean; created: string; updated: string }
export interface Workspace { desks: Desk[]; tasks: Task[]; notes: Note[] }
export type ItemType = keyof Workspace

// Desk colours as CSS colours, for dots, bars and edges.
export const DESK_COLOR_VALUE: Record<string, string> = {
  purple: '#9a63bf', lilac: '#bb92d6', orange: '#ff9a1c', amber: '#ffc06b', red: '#ff4d4d', zinc: '#a1a1aa', white: '#f4f4f5',
}
export const deskColor = (color?: string) => DESK_COLOR_VALUE[color || ''] ?? '#71717a'

/* ---------- Dates (deadlines are local YYYY-MM-DD strings) ---------- */

const pad = (n: number) => String(n).padStart(2, '0')
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayYmd = () => ymd(new Date())
export const parseYmd = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (s: string, n: number) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d) }
export const daysFrom = (a: string, b: string) => Math.round((parseYmd(b).getTime() - parseYmd(a).getTime()) / 86400000)

/* ---------- Tasks ---------- */

export const isOpen = (t: Task) => t.status !== 'done'

// Which group a task falls into on the Today page.
export function bucket(t: Task, today = todayYmd()) {
  if (!isOpen(t)) return 'done'
  if (t.status === 'waiting') return 'waiting'
  if (!t.due) return 'nodate'
  if (t.due < today) return 'overdue'
  if (t.due === today) return 'today'
  return t.due <= addDays(today, 7) ? 'week' : 'later'
}

// "My order": the order you set by dragging. Tasks from before ordering existed come last, newest first.
export const byOrder = (a: Task, b: Task) =>
  (a.order ?? Infinity) - (b.order ?? Infinity) || (b.created || '').localeCompare(a.created || '')

export const byDeadline = (a: Task, b: Task) =>
  (a.due || '9999').localeCompare(b.due || '9999') ||
  PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
  byOrder(a, b)

// The day's work, in the order you set: overdue, due today and in progress. Waiting tasks are not yours to do yet.
export function focusQueue(data: Workspace, today = todayYmd()) {
  return data.tasks
    .filter((t) => isOpen(t) && t.status !== 'waiting' && (t.status === 'doing' || (t.due && t.due <= today)))
    .sort(byOrder)
}

export function deskStats(data: Workspace, id: string) {
  const tasks = data.tasks.filter((t) => t.deskId === id)
  const open = tasks.filter(isOpen)
  const today = todayYmd()
  return {
    total: tasks.length,
    open: open.length,
    done: tasks.length - open.length,
    overdue: open.filter((t) => t.due && t.due < today && t.status !== 'waiting').length,
    next: open.filter((t) => t.due).sort(byDeadline)[0] || null,
    notes: data.notes.filter((n) => n.deskId === id).length,
  }
}

/* ---------- Talking to api.php ---------- */

export class ApiError extends Error {}

export interface ApiAnswer { ok: true; data: Workspace; id?: string }

export async function api(body?: object, serverDown = 'Could not reach the server.'): Promise<ApiAnswer> {
  let res: Response
  try {
    res = await fetch('api.php', {
      method: body ? 'POST' : 'GET',
      headers: { 'X-Requested-With': 'itsak', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
      cache: 'no-store',
    })
  } catch {
    throw new ApiError(serverDown)
  }
  if (res.status === 401) { location.reload(); throw new ApiError('') }
  let json: { ok?: boolean; error?: string } | null = null
  try { json = await res.json() } catch { /* not JSON, handled below */ }
  if (!res.ok || !json || !json.ok) throw new ApiError(json?.error || serverDown)
  return json as ApiAnswer
}

export const storage = {
  get(key: string) { try { return localStorage.getItem('itsak-ws-' + key) } catch { return null } },
  set(key: string, value: string) { try { localStorage.setItem('itsak-ws-' + key, value) } catch { /* private window */ } },
}
