// Home page: one task to work on now, the next two, then the rest. Nothing else.
import * as React from 'react'
import { ArrowUpIcon, CheckIcon, PencilIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { focusQueue, isOpen, parseYmd, todayYmd, type Task } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'
import { DeskChip, DoneCheck, DueBadge, Linkified, PageHead, StepsPill, useToggleTask } from '@/components/bits'
import { highEdge } from '@/components/task-list'
import { NewTaskButton } from '@/views/today'

/* ---------- Finishing the Focus task: ring fills, confetti, a short chime ---------- */

let audio: AudioContext | null = null
function chime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audio = audio || new Ctx()
    if (audio.state === 'suspended') audio.resume()
    const now = audio.currentTime
    const out = audio.createGain()
    out.gain.value = 0.18
    out.connect(audio.destination)
    // A quick digital arpeggio up, with a soft square layer for the "tech" edge.
    const notes: [number, number][] = [[659.25, 0], [987.77, 0.07], [1318.5, 0.14], [1975.5, 0.24]]
    notes.forEach(([freq, at], i) => {
      const last = i === notes.length - 1
      ;(['sine', 'square'] as const).forEach((type) => {
        const osc = audio!.createOscillator()
        const g = audio!.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, now + at)
        if (last) osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + at + 0.35)
        const peak = type === 'sine' ? 0.9 : 0.12
        const len = last ? 0.45 : 0.12
        g.gain.setValueAtTime(0.0001, now + at)
        g.gain.exponentialRampToValueAtTime(peak, now + at + 0.012)
        g.gain.exponentialRampToValueAtTime(0.0001, now + at + len)
        osc.connect(g).connect(out)
        osc.start(now + at)
        osc.stop(now + at + len + 0.02)
      })
    })
  } catch { /* no sound available: the animation is enough */ }
}

function confetti(from: HTMLElement) {
  // The confetti lives on <body> so it keeps flying while the page re-renders.
  const ring = from.getBoundingClientRect()
  const layer = document.createElement('div')
  layer.className = 'confetti'
  layer.setAttribute('aria-hidden', 'true')
  layer.style.left = `${ring.left + ring.width / 2}px`
  layer.style.top = `${ring.top + ring.height / 2}px`
  const colors = ['var(--color-brand-300)', 'var(--color-brand-400)', 'var(--color-sun-500)', 'var(--color-sun-300)', '#fff']
  for (let i = 0; i < 36; i++) {
    const bit = document.createElement('i')
    const angle = (i / 36) * Math.PI * 2 + Math.random() * 0.4
    const dist = 70 + Math.random() * 120
    bit.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
    bit.style.setProperty('--dy', `${Math.sin(angle) * dist - 40}px`)
    bit.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`)
    bit.style.background = colors[i % colors.length]
    if (i % 3 === 0) bit.style.borderRadius = '50%'
    layer.appendChild(bit)
  }
  document.body.appendChild(layer)
  setTimeout(() => layer.remove(), 1400)
}

/* ---------- Pieces ---------- */

function Label({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return <p id={id} className={cn('mb-3.5 font-head text-xs leading-none font-bold tracking-[.14em] text-muted-foreground uppercase rtl:text-[13px] rtl:tracking-normal', className)}>{children}</p>
}

function Meta({ task, className }: { task: Task; className?: string }) {
  const { tr, data } = useWorkspace()
  const desk = data.desks.find((d) => d.id === task.deskId)
  return (
    <span className={cn('flex flex-wrap items-center gap-x-2.5 gap-y-1.5', className)}>
      <DueBadge task={task} />
      <DeskChip desk={desk} />
      {task.status === 'doing' && <Badge className="rounded-full bg-brand-800 text-brand-200">{tr('doing')}</Badge>}
      {task.priority === 'high' && <Badge className="rounded-full bg-sun-900 text-sun-300">{tr('high')}</Badge>}
      <StepsPill task={task} />
    </span>
  )
}

function Hero({ task }: { task: Task }) {
  const { tr, saveItem, openEditor } = useWorkspace()
  const toggleTask = useToggleTask()
  const [celebrating, setCelebrating] = React.useState(false)
  const ringRef = React.useRef<HTMLSpanElement>(null)
  const note = (task.notes || '').length > 280 ? task.notes.slice(0, 280) + '…' : task.notes || ''

  // The big Done: celebrate first, then mark it done and move on to the next task.
  const finish = async () => {
    if (celebrating) return
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    setCelebrating(true)
    chime()
    if (!calm && ringRef.current) confetti(ringRef.current)
    await new Promise((done) => setTimeout(done, calm ? 300 : 950))
    await toggleTask(task)
    setCelebrating(false)
  }

  const toggleStep = (i: number) => {
    const checklist = task.checklist.map((s, k) => (k === i ? { ...s, done: !s.done } : s))
    saveItem('tasks', { ...task, checklist }, '').catch(() => {})
  }

  return (
    <section
      aria-labelledby="focus-now"
      className={cn(
        'rounded-[20px] border border-brand-700 bg-[linear-gradient(155deg,var(--color-brand-900)_0%,var(--color-card)_62%)] px-5 pt-[26px] pb-[22px] md:rounded-[22px] md:px-9 md:pt-9 md:pb-8',
        task.priority === 'high' && 'shadow-[inset_4px_0_0_var(--color-sun-500)] rtl:shadow-[inset_-4px_0_0_var(--color-sun-500)]',
        celebrating && 'animate-[hero-glow_.95s_ease-out]',
      )}
    >
      <Label id="focus-now" className="text-brand-300">{tr('focusNow')}</Label>
      <h2 dir="auto" className="text-[clamp(26px,3.6vw,36px)] leading-[1.3] font-black [overflow-wrap:anywhere]">{task.title}</h2>
      <Meta task={task} className="mt-[18px]" />
      {note && <p dir="auto" className="mt-5 text-base leading-[1.7] whitespace-pre-line text-zinc-300 [overflow-wrap:anywhere]"><Linkified text={note} /></p>}
      {task.checklist?.length > 0 && (
        <ul className="mt-6 flex flex-col gap-0.5">
          {task.checklist.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                aria-pressed={s.done}
                onClick={() => toggleStep(i)}
                className="-mx-2.5 flex min-h-12 w-[calc(100%+20px)] items-center gap-3.5 rounded-xl px-2.5 py-1.5 text-start text-base text-zinc-100 hover:bg-white/5 max-md:min-h-[52px]"
              >
                <span aria-hidden className={cn('grid size-[22px] shrink-0 place-items-center rounded-[7px] border-[1.6px] border-zinc-600 text-white', s.done && 'border-primary bg-primary')}>
                  {s.done && <CheckIcon className="size-4" strokeWidth={3} />}
                </span>
                <span dir="auto" className={cn(s.done && 'text-zinc-500 line-through')}>{s.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-[26px] flex flex-wrap gap-3 md:mt-8">
        <Button
          size="lg"
          onClick={finish}
          data-celebrating={celebrating || undefined}
          className="group/done h-[54px] min-w-[168px] rounded-[13px] px-7 text-base max-md:flex-[1_1_100%] md:h-[52px] data-[celebrating]:animate-[btn-glow_.9s_ease-out]"
        >
          <span ref={ringRef} aria-hidden className={cn(
            'grid size-6 place-items-center rounded-full border-[2.4px] border-white/85 transition-[background-color,border-color] group-hover/done:bg-white/15',
            celebrating && 'animate-[ring-pop_.45s_cubic-bezier(.3,1.6,.5,1)] border-white bg-white group-hover/done:bg-white',
          )}>
            <CheckIcon className={cn('size-4 text-primary opacity-0 transition-opacity delay-100 duration-300', celebrating && 'opacity-100')} strokeWidth={3} />
          </span>
          {tr('doneBtn')}
        </Button>
        <Button variant="outline" size="lg" className="h-[54px] rounded-[13px] px-7 text-base max-md:flex-[1_1_100%] md:h-[52px]" onClick={() => openEditor({ kind: 'task', item: task })}>
          <PencilIcon className="size-5" />{tr('edit')}
        </Button>
      </div>
    </section>
  )
}

function Row({ task, kind, queue }: { task: Task; kind: 'next' | 'rest'; queue: Task[] }) {
  const { tr, openEditor, change } = useWorkspace()
  const doFirst = () => {
    const ids = [task.id, ...queue.map((t) => t.id).filter((x) => x !== task.id)]
    change({ action: 'reorder', ids, id: task.id }, '').catch(() => {})
  }
  const next = kind === 'next'
  return (
    <li className={cn(
      'group flex items-center border',
      next
        ? 'gap-4 rounded-2xl bg-card py-4 ps-4 pe-2 md:py-5 md:ps-[22px] md:pe-[18px]'
        : 'gap-3.5 rounded-xl border-transparent py-2 ps-[18px] pe-2 hover:bg-card md:py-3',
      next && task.priority === 'high' && isOpen(task) && highEdge,
    )}>
      <DoneCheck task={task} className={cn(next && 'size-[26px] rounded-full max-md:size-[26px]')} />
      <button type="button" onClick={() => openEditor({ kind: 'task', item: task })} className="group/open flex min-w-0 flex-1 flex-col gap-2 text-start max-md:min-h-12 max-md:justify-center">
        <span dir="auto" className={cn('font-medium [overflow-wrap:anywhere] underline-offset-4 group-hover/open:underline group-hover/open:decoration-zinc-600',
          next ? 'text-[19px] leading-[1.4] text-zinc-50' : 'text-[15.5px] text-zinc-300')}>
          {task.title}
        </span>
        {next && <Meta task={task} />}
      </button>
      <Button variant="ghost" size="icon-sm" onClick={doFirst} aria-label={tr('doFirst')} title={tr('doFirst')}
        className="text-muted-foreground opacity-35 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 max-md:size-10 max-md:opacity-60">
        <ArrowUpIcon className="size-5" strokeWidth={2.4} />
      </Button>
    </li>
  )
}

export function FocusView() {
  const { tr, data, fmtLong } = useWorkspace()
  const today = todayYmd()
  const queue = focusQueue(data, today)
  const [first, ...others] = queue
  const doneToday = data.tasks.filter((t) => !isOpen(t) && t.doneAt && Date.parse(t.doneAt) >= parseYmd(today).getTime()).length
  const summary = [queue.length ? tr('focusLeft', { n: queue.length }) : '', doneToday ? tr('focusDone', { n: doneToday }) : ''].filter(Boolean).join(' · ')

  return (
    <div className="mx-auto max-w-[720px] [&>header]:mb-3.5">
      <PageHead eyebrow={fmtLong(today)} title={tr('focus')}>
        <NewTaskButton item={{ due: today }} />
      </PageHead>
      {summary && <p className="mb-[26px] text-[15px] text-muted-foreground md:mb-9">{summary}</p>}

      {first ? <Hero key={first.id} task={first} /> : (
        <section className="flex flex-col items-center gap-3 rounded-[22px] border border-dashed border-zinc-700 px-6 py-14 text-center">
          <span className="mb-2 grid size-16 place-items-center rounded-full bg-brand-800 text-brand-200"><CheckIcon className="size-[30px]" strokeWidth={2.2} /></span>
          <h2 className="text-2xl font-black">{tr('focusClear')}</h2>
          <p className="mb-3 max-w-[36ch] text-muted-foreground">{tr('focusClearSub')}</p>
          <Button asChild variant="outline" size="lg" className="h-[52px] rounded-[13px] px-7 text-base"><a href="#tasks">{tr('seeTasks')}</a></Button>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-9 md:mt-11">
          <Label>{tr('focusNext')}</Label>
          <ul className="flex flex-col gap-2.5">{others.slice(0, 2).map((t) => <Row key={t.id} task={t} kind="next" queue={queue} />)}</ul>
        </section>
      )}
      {others.length > 2 && (
        <section className="mt-9 md:mt-11">
          <Label>{tr('focusRest')}</Label>
          <ul className="flex flex-col gap-1">{others.slice(2).map((t) => <Row key={t.id} task={t} kind="rest" queue={queue} />)}</ul>
        </section>
      )}
    </div>
  )
}
