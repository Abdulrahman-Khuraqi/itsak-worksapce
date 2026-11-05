// Small pieces shared by the views: desk chips, deadline badges, pills, the done checkbox.
import * as React from 'react'
import { CheckIcon, FlagIcon, HourglassIcon, ListChecksIcon } from 'lucide-react'
import { toast } from 'sonner'

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

/* One visual language for every task:
   colour means time (red = late, amber = today, white = this week, grey = later),
   weight means importance (a flag and a brighter title for High, a dimmer title for Low). */
export type DueTone = 'late' | 'today' | 'soon' | 'later'

export function useDue() {
  const { tr, fmtShort } = useWorkspace()
  return (task: Task): { text: string; tone: DueTone } | null => {
    if (!task.due) return null
    const n = daysFrom(todayYmd(), task.due)
    // Done, or waiting on someone else: keep the date, but not the urgent colour.
    if (!isOpen(task) || task.status === 'waiting') return { text: fmtShort(task.due), tone: 'later' }
    if (n < 0) return { text: n === -1 ? tr('yesterday') : tr('late', { n: -n }), tone: 'late' }
    if (n === 0) return { text: tr('dueTodayShort'), tone: 'today' }
    if (n === 1) return { text: tr('tomorrow'), tone: 'soon' }
    if (n <= 7) return { text: tr('inDays', { n }), tone: 'soon' }
    return { text: fmtShort(task.due), tone: 'later' }
  }
}

// The deadline. Only late and today get a coloured label; the rest is plain text, so the urgent ones stand out.
export function DueBadge({ task, plain = false, className }: { task: Task; plain?: boolean; className?: string }) {
  const { fmtLong } = useWorkspace()
  const due = useDue()(task)
  if (!due) return null
  const tones: Record<DueTone, string> = plain
    ? { late: 'text-alert-400 font-semibold', today: 'text-sun-500 font-semibold', soon: 'text-zinc-200', later: 'text-zinc-500' }
    : { late: 'bg-alert-900 text-alert-400 font-semibold px-2.5', today: 'bg-sun-900 text-sun-300 font-semibold px-2.5', soon: 'text-zinc-200', later: 'text-zinc-500' }
  return (
    <time
      dateTime={task.due}
      title={fmtLong(task.due)}
      data-tone={due.tone}
      className={cn('rounded-full py-0.5 text-[12.5px] font-medium whitespace-nowrap', tones[due.tone], className)}
    >
      {due.text}
    </time>
  )
}

// High priority: a small flag in front of the title.
export function PriorityFlag({ task, className }: { task: Task; className?: string }) {
  const { tr } = useWorkspace()
  if (task.priority !== 'high' || !isOpen(task)) return null
  return (
    <span title={tr('high')} className={cn('me-1.5 inline-flex translate-y-[-1px] align-middle text-brand-300', className)}>
      <FlagIcon className="size-[15px] fill-current" strokeWidth={2} aria-hidden />
      <span className="sr-only">{tr('high')}: </span>
    </span>
  )
}

// How bright a task's title is: High stands out, Low steps back, done is crossed out.
export function titleTone(task: Task) {
  if (!isOpen(task)) return 'font-normal text-zinc-500 line-through decoration-zinc-600'
  if (task.status === 'waiting') return 'font-medium text-zinc-400'
  if (task.priority === 'high') return 'font-semibold text-white'
  if (task.priority === 'low') return 'font-normal text-zinc-400'
  return 'font-medium text-zinc-100'
}

// "In progress": a small purple dot and the word, no box.
export function DoingLabel({ task, className }: { task: Task; className?: string }) {
  const { tr } = useWorkspace()
  if (task.status !== 'doing') return null
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-300', className)}>
      <i className="size-1.5 rounded-full bg-brand-400 shadow-[0_0_0_3px_rgba(154,99,191,.25)]" />{tr('doing')}
    </span>
  )
}

export function StepsPill({ task, className }: { task: Task; className?: string }) {
  const steps = task.checklist || []
  if (!steps.length) return null
  const done = steps.filter((s) => s.done).length
  const full = done === steps.length
  return (
    <span className={cn('inline-flex items-center gap-1 text-[12.5px] font-medium text-zinc-400 tabular-nums', full && 'text-brand-300', className)}>
      <ListChecksIcon className="size-3.5" />{done}/{steps.length}
    </span>
  )
}

export function WaitingPill({ task }: { task: Task }) {
  const { tr } = useWorkspace()
  if (task.status !== 'waiting') return null
  return (
    <span title={tr('waitingFor')} className="inline-flex min-w-0 items-center gap-1 text-[12.5px] font-medium text-zinc-400">
      <HourglassIcon className="size-3.5 shrink-0" />
      <bdi className="truncate">{task.waitingFor ? `${tr('waiting')}: ${task.waitingFor}` : tr('waiting')}</bdi>
    </span>
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
