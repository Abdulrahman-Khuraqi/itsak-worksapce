import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { bucket, byDeadline, byOrder, deskColor, deskStats, isOpen, todayYmd, type Task } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'
import { DeskChip, Empty, PageHead } from '@/components/bits'
import { TaskList } from '@/components/task-list'
import { NoteCard } from '@/components/note-card'

export function DeskProgress({ color, value, className }: { color: string; value: number; className?: string }) {
  return (
    <Progress
      value={value}
      className={cn('h-[5px] bg-zinc-800 [&>[data-slot=progress-indicator]]:rounded-full [&>[data-slot=progress-indicator]]:bg-(--dc)', className)}
      style={{ '--dc': deskColor(color) } as React.CSSProperties}
    />
  )
}

// Phones use the + in the tab bar instead.
export function NewTaskButton({ item }: { item?: Partial<Task> }) {
  const { tr, newTask } = useWorkspace()
  return (
    <Button className="h-10 px-4 text-[14.5px] max-md:hidden" onClick={() => newTask(item)}>
      <PlusIcon /><span>{tr('newTask')}</span>
    </Button>
  )
}

// Colour means time, the same everywhere: red = late, amber = today, white = this week, grey = later.
const tones = {
  late: { edge: 'before:bg-alert-500', value: 'text-alert-400', head: 'text-alert-400' },
  today: { edge: 'before:bg-sun-500', value: 'text-sun-300', head: 'text-sun-500' },
  soon: { edge: 'before:bg-zinc-300', value: '', head: 'text-zinc-200' },
  done: { edge: 'before:bg-zinc-600', value: 'text-zinc-400', head: 'text-zinc-500' },
  doing: { edge: '', value: '', head: 'text-brand-300' },
  waiting: { edge: '', value: '', head: 'text-zinc-400' },
  quiet: { edge: '', value: '', head: 'text-zinc-500' },
}
export type GroupTone = keyof typeof tones

function Stat({ tone, label, value }: { tone: keyof typeof tones; label: string; value: number }) {
  return (
    <Card className={cn(
      'relative gap-0.5 overflow-hidden rounded-xl px-2.5 py-2.5 shadow-none sm:gap-1 sm:rounded-[14px] sm:px-[18px] sm:py-4',
      'before:absolute before:inset-y-0 before:start-0 before:w-[3px]', value ? tones[tone].edge : 'before:bg-zinc-800',
    )}>
      <span className={cn('font-head text-2xl leading-[1.05] font-black sm:text-[34px]', value ? tones[tone].value : 'text-zinc-600')}>{value}</span>
      <span className="text-[11.5px] leading-[1.3] text-muted-foreground sm:text-[13.5px]">{label}</span>
    </Card>
  )
}

export function Group({ title, tone, tasks, limit = 0, sortable = false }: { title: string; tone: keyof typeof tones; tasks: Task[]; limit?: number; sortable?: boolean }) {
  const { tr } = useWorkspace()
  if (!tasks.length) return null
  return (
    <section className="[&+&]:mt-[30px]">
      <h3 className={cn('mb-3 flex items-center gap-2 text-[12.5px] tracking-[.12em] uppercase rtl:text-[13px] rtl:tracking-normal', tones[tone].head)}>
        {title}
        <span className="rounded-full bg-zinc-800 px-[7px] py-[3px] font-sans text-[11.5px] leading-none font-medium tracking-normal text-muted-foreground">{tasks.length}</span>
      </h3>
      <TaskList tasks={limit ? tasks.slice(0, limit) : tasks} sortable={sortable} />
      {limit > 0 && tasks.length > limit && (
        <Button asChild variant="link" className="mt-1.5 h-auto px-0 py-0 text-[13.5px] text-brand-300 max-md:py-2.5">
          <a href="#tasks">{tr('showAll', { n: tasks.length })}</a>
        </Button>
      )}
    </section>
  )
}

export function TodayView() {
  const { tr, data, fmtLong } = useWorkspace()
  const today = todayYmd()
  const hour = new Date().getHours()
  const greeting = tr(hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening')
  const open = data.tasks.filter(isOpen).sort(byDeadline)
  const groups: Record<'overdue' | 'today' | 'week', Task[]> = { overdue: [], today: [], week: [] }
  open.forEach((t) => { const b = bucket(t, today); if (b in groups) groups[b as keyof typeof groups].push(t) })
  groups.today.sort(byOrder)
  const doing = open.filter((t) => t.status === 'doing' && !['overdue', 'today', 'week'].includes(bucket(t, today))).sort(byOrder)
  const noDate = open.filter((t) => !t.due && t.status === 'todo').sort(byOrder)
  const waiting = open.filter((t) => t.status === 'waiting').sort(byOrder)
  const later = open.filter((t) => bucket(t, today) === 'later' && t.status === 'todo')
  const weekAgo = Date.now() - 7 * 86400000
  const doneWeek = data.tasks.filter((t) => !isOpen(t) && t.doneAt && Date.parse(t.doneAt) >= weekAgo).length
  const pinned = data.notes.filter((n) => n.pinned).sort((a, b) => b.updated.localeCompare(a.updated))

  return (
    <>
      <PageHead eyebrow={fmtLong(today)} title={greeting}>
        <NewTaskButton item={{ due: today }} />
      </PageHead>

      <div className="mb-4 grid grid-cols-4 gap-2 sm:mb-5 sm:gap-3.5 sm:max-[67.5rem]:grid-cols-2">
        <Stat tone="late" label={tr('overdue')} value={groups.overdue.length} />
        <Stat tone="today" label={tr('dueToday')} value={groups.today.length} />
        <Stat tone="soon" label={tr('next7')} value={groups.week.length} />
        <Stat tone="done" label={tr('done7')} value={doneWeek} />
      </div>

      <div className="grid items-start gap-x-9 gap-y-5 min-[67.5rem]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <h2 className="mb-[18px] text-[19px]">{tr('deadlines')}</h2>
          <Group title={tr('overdue')} tone="late" tasks={groups.overdue} />
          <Group title={tr('dueToday')} tone="today" tasks={groups.today} sortable />
          <Group title={tr('comingUp')} tone="soon" tasks={groups.week} />
          <Group title={tr('inProgress')} tone="doing" tasks={doing} sortable />
          <Group title={tr('waitingGroup')} tone="waiting" tasks={waiting} sortable />
          <Group title={tr('noDeadline')} tone="quiet" tasks={noDate} limit={8} sortable />
          <Group title={tr('later')} tone="quiet" tasks={later} limit={5} />
          {!open.length && <Empty>{tr('allClear')}</Empty>}
        </div>

        <div className="flex flex-col gap-5">
          <Card className="gap-3.5 rounded-[14px] p-5 shadow-none">
            <h2 className="text-[17px]">{tr('desks')}</h2>
            {data.desks.length ? (
              <ul className="flex flex-col gap-1">
                {data.desks.map((d) => {
                  const s = deskStats(data, d.id)
                  const pct = s.total ? Math.round((s.done / s.total) * 100) : 0
                  return (
                    <li key={d.id}>
                      <a href={`#desk/${encodeURIComponent(d.id)}`} className="-mx-2.5 flex flex-col gap-2 rounded-[9px] p-2.5 text-inherit no-underline hover:bg-zinc-900">
                        <span className="flex justify-between gap-2.5 text-[13px]">
                          <DeskChip desk={d} className="text-sm text-foreground" />
                          <span className="text-muted-foreground">{tr('doneOf', { done: s.done, total: s.total })}</span>
                        </span>
                        <DeskProgress color={d.color} value={pct} />
                        {s.overdue > 0 && <span className="text-[12.5px] text-alert-400">{tr('overdue')}: {s.overdue}</span>}
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : <Empty>{tr('noDesks')}</Empty>}
          </Card>
          <Card className="gap-3.5 rounded-[14px] p-5 shadow-none">
            <h2 className="text-[17px]">{tr('pinned')}</h2>
            {pinned.length
              ? <div className="flex flex-col gap-2.5">{pinned.map((n) => <NoteCard key={n.id} note={n} />)}</div>
              : <Empty>{tr('noPinned')}</Empty>}
          </Card>
        </div>
      </div>
      <p className="mt-7 text-[13px] text-zinc-500 [@media(hover:none)]:hidden">{tr('shortcut')}</p>
    </>
  )
}
