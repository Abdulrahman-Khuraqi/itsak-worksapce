// Small pieces shared by the views: desk chips, deadline badges, pills, the done checkbox.
import * as React from 'react'
import { CheckIcon, HourglassIcon, ListChecksIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { daysFrom, deskColor, isOpen, todayYmd, type Desk, type Task } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'

export function useIsPhone() {
  const query = '(max-width: 54rem)'
  const [phone, setPhone] = React.useState(() => window.matchMedia(query).matches)
  React.useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setPhone(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return phone
}

export function DeskDot({ color, className }: { color?: string; className?: string }) {
  return <i className={cn('inline-block size-2.5 shrink-0 rounded-full', className)} style={{ background: deskColor(color) }} />
}

export function DeskChip({ desk, className }: { desk: Desk | null | undefined; className?: string }) {
  if (!desk) return null
  return (
    <span className={cn('inline-flex max-w-full items-center gap-1.5 text-[12.5px] font-medium text-zinc-300', className)}>
      <DeskDot color={desk.color} />
      <bdi className="truncate">{desk.name}</bdi>
    </span>
  )
}

// "3 days late", "Today", "Tomorrow", "In 4 days" or the date, coloured by how close it is.
export function DueBadge({ task, plain = false, className }: { task: Task; plain?: boolean; className?: string }) {
  const { tr, fmtShort, fmtLong } = useWorkspace()
  if (!task.due) return null
  const n = daysFrom(todayYmd(), task.due)
  let text = fmtShort(task.due)
  let tone: 'late' | 'today' | 'soon' | '' = ''
  if (isOpen(task)) {
    if (n < 0) { text = n === -1 ? tr('yesterday') : tr('late', { n: -n }); tone = 'late' }
    else if (n === 0) { text = tr('dueTodayShort'); tone = 'today' }
    else if (n === 1) { text = tr('tomorrow'); tone = 'soon' }
    else if (n <= 7) { text = tr('inDays', { n }); tone = 'soon' }
  }
  // Waiting on someone else: keep the date, but not the urgent colour.
  if (task.status === 'waiting') tone = ''
  const tones = plain
    ? { late: 'text-alert-400', today: 'text-sun-500', soon: 'text-brand-300', '': 'text-muted-foreground' }
    : { late: 'bg-alert-900 text-alert-400', today: 'bg-sun-900 text-sun-300', soon: 'bg-brand-900 text-brand-200', '': 'bg-zinc-800 text-zinc-300' }
  return (
    <time
      dateTime={task.due}
      title={fmtLong(task.due)}
      className={cn('text-[12.5px] font-medium whitespace-nowrap', !plain && 'rounded-full px-2.5 py-0.5', tones[tone], className)}
    >
      {text}
    </time>
  )
}

export function StepsPill({ task, className }: { task: Task; className?: string }) {
  const steps = task.checklist || []
  if (!steps.length) return null
  const done = steps.filter((s) => s.done).length
  const full = done === steps.length
  return (
    <Badge variant="secondary" className={cn('rounded-full', full && 'bg-brand-800 text-brand-200', className)}>
      <ListChecksIcon />{done}/{steps.length}
    </Badge>
  )
}

export function WaitingPill({ task }: { task: Task }) {
  const { tr } = useWorkspace()
  if (task.status !== 'waiting') return null
  return (
    <Badge variant="outline" title={tr('waitingFor')} className="max-w-full rounded-full border-sun-300/45 text-sun-300">
      <HourglassIcon />
      <bdi className="truncate">{task.waitingFor ? `${tr('waiting')}: ${task.waitingFor}` : tr('waiting')}</bdi>
    </Badge>
  )
}

// Marks a task done (with Undo for a few seconds) or open again.
export function useToggleTask() {
  const { tr, saveItem } = useWorkspace()
  return async (task: Task) => {
    const before = { ...task }
    const done = !isOpen(task)
    try {
      await saveItem('tasks', { ...task, status: done ? 'todo' : 'done' }, '')
      if (!done) {
        toast(tr('markedDone'), { action: { label: tr('undo'), onClick: () => { saveItem('tasks', before, '').catch(() => {}) } } })
      }
    } catch { /* toast already shown */ }
  }
}

// The round-cornered box on each task.
export function DoneCheck({ task, className }: { task: Task; className?: string }) {
  const { tr } = useWorkspace()
  const toggleTask = useToggleTask()
  const done = !isOpen(task)
  const toggle = () => toggleTask(task)
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={done}
      aria-label={done ? tr('markOpen') : tr('markDone')}
      className={cn(
        'relative grid size-[22px] shrink-0 place-items-center rounded-[7px] border-[1.6px] border-zinc-600 text-white transition-colors outline-none',
        'hover:border-brand-300 focus-visible:ring-[3px] focus-visible:ring-ring/50 after:absolute after:-inset-2.5 md:after:hidden max-md:size-6',
        done && 'border-primary bg-primary hover:border-primary',
        className,
      )}
    >
      {done && <CheckIcon className="size-4" strokeWidth={3} />}
    </button>
  )
}

const URL_RE = /https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"]/g

// Text with its links made clickable.
export function Linkified({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(URL_RE)) {
    parts.push(text.slice(last, m.index))
    parts.push(<a key={m.index} href={m[0]} target="_blank" rel="noopener noreferrer" className="text-brand-300 underline-offset-2 hover:underline">{m[0]}</a>)
    last = (m.index ?? 0) + m[0].length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}

export function PageHead({ eyebrow, title, children }: { eyebrow?: React.ReactNode; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mb-7">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2 text-sm text-muted-foreground">{eyebrow}</div>}
        <h1 dir="auto" className="text-[clamp(28px,3.4vw,40px)] font-black">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2.5 max-sm:w-full max-sm:[&>[data-variant=default]]:flex-1">{children}</div>}
    </header>
  )
}

export function Empty({ big, children }: { big?: boolean; children: React.ReactNode }) {
  return <p className={cn('my-1 text-muted-foreground', big && 'max-w-[52ch] py-10 text-base')}>{children}</p>
}

export function Count({ hot, className, children }: { hot?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('ms-auto min-w-[22px] rounded-full bg-zinc-800 px-[7px] py-0.5 text-center text-xs font-medium text-zinc-300', hot && 'bg-sun-500 text-black', className)}>
      {children}
    </span>
  )
}
