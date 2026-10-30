// Month view of deadlines. Click a day number to add a task on that day.
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { byDeadline, deskColor, isOpen, todayYmd, ymd, type Task } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'
import { Empty, PageHead } from '@/components/bits'
import { TaskList } from '@/components/task-list'
import { NewTaskButton } from '@/views/today'

export function CalendarView() {
  const { tr, data, fmt, fmtLong, month: [year, month], setMonth, newTask, openEditor } = useWorkspace()
  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = first.getDay() // weeks start on Sunday
  const weeks = Math.ceil((offset + daysInMonth) / 7)
  const start = new Date(year, month, 1 - offset)
  const today = todayYmd()
  const byDay: Record<string, Task[]> = {}
  data.tasks.filter((t) => t.due).sort(byDeadline).forEach((t) => { (byDay[t.due] ||= []).push(t) })
  const dayAt = (i: number) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)

  const monthStart = ymd(first)
  const monthEnd = ymd(new Date(year, month, daysInMonth))
  const inMonth = data.tasks.filter((t) => t.due && t.due >= monthStart && t.due <= monthEnd).sort(byDeadline)
  const now = new Date()
  const isThisMonth = year === now.getFullYear() && month === now.getMonth()
  const step = (n: number) => {
    const d = n === 0 ? new Date() : new Date(year, month + n, 1)
    setMonth([d.getFullYear(), d.getMonth()])
  }

  return (
    <>
      <PageHead title={fmt(first, { month: 'long', year: 'numeric' })}>
        <div className="flex gap-1.5">
          <Button variant="outline" size="icon-lg" className="max-md:size-11" aria-label={tr('prevMonth')} onClick={() => step(-1)}><ChevronLeftIcon className="rtl-flip" /></Button>
          <Button variant="outline" className="h-10 max-md:h-11" disabled={isThisMonth} onClick={() => step(0)}>{tr('thisMonth')}</Button>
          <Button variant="outline" size="icon-lg" className="max-md:size-11" aria-label={tr('nextMonth')} onClick={() => step(1)}><ChevronRightIcon className="rtl-flip" /></Button>
        </div>
        <NewTaskButton />
      </PageHead>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[14px] border bg-border">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={'wd' + i} className="bg-card p-2.5 text-[12.5px] font-medium text-muted-foreground max-md:px-1 max-md:py-2 max-md:text-center max-md:text-[11px]">
            {fmt(dayAt(i), { weekday: 'short' })}
          </div>
        ))}
        {Array.from({ length: weeks * 7 }, (_, i) => {
          const d = dayAt(i)
          const key = ymd(d)
          const list = byDay[key] || []
          const out = d.getMonth() !== month
          return (
            <div key={key} className={cn('flex min-h-28 min-w-0 flex-col gap-1 bg-background p-1.5 max-md:min-h-16 max-md:p-[3px]', out && 'bg-zinc-950')}>
              <Button
                variant="ghost"
                aria-label={tr('addOn', { d: fmtLong(key) })}
                onClick={() => newTask({ due: key })}
                className={cn('size-[30px] self-start rounded-lg p-0 font-head text-sm font-bold text-zinc-300 max-md:size-9 max-md:text-[13px]',
                  out && 'text-zinc-600', key === today && 'bg-primary text-white hover:bg-primary/90')}
              >
                {d.getDate()}
              </Button>
              <ul className="flex flex-col gap-[3px]">
                {list.slice(0, 3).map((t) => {
                  const desk = data.desks.find((x) => x.id === t.deskId)
                  const late = isOpen(t) && key < today
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        dir="auto"
                        onClick={() => openEditor({ kind: 'task', item: t })}
                        style={{ '--dc': deskColor(desk?.color || 'zinc') } as React.CSSProperties}
                        className={cn(
                          'block w-full truncate rounded-[5px] bg-zinc-900 px-1.5 py-[3px] text-start text-xs leading-[1.35] text-zinc-200 hover:bg-zinc-800',
                          'shadow-[inset_2px_0_0_var(--dc)] rtl:shadow-[inset_-2px_0_0_var(--dc)]',
                          // On phones each task is a coloured line under the day.
                          'max-md:h-[5px] max-md:bg-(--dc) max-md:p-0 max-md:text-[0px] max-md:shadow-none',
                          !isOpen(t) && 'text-zinc-500 line-through max-md:opacity-35',
                          late && 'text-alert-400',
                        )}
                      >
                        {t.title}
                      </button>
                    </li>
                  )
                })}
                {list.length > 3 && <li className="ps-1.5 text-[11.5px] text-muted-foreground max-md:hidden">{tr('more', { n: list.length - 3 })}</li>}
              </ul>
            </div>
          )
        })}
      </div>

      <section className="mt-9">
        <h2 className="mb-[18px] text-[19px]">{tr('monthDeadlines')}</h2>
        {inMonth.length ? <TaskList tasks={inMonth} /> : <Empty>{tr('noMonthDeadlines')}</Empty>}
      </section>
    </>
  )
}
