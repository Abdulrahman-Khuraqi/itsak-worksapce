// The edit windows for tasks, desks and notes, and the "are you sure?" question.
import * as React from 'react'
import { CalendarIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { arSA } from 'react-day-picker/locale'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { DESK_COLORS, PRIORITIES, STATUSES, addDays, deskColor, deskStats, parseYmd, todayYmd, ymd, type Desk, type Note, type Step, type Task } from '@/lib/data'
import { useWorkspace, type Editor } from '@/app/workspace'
import { EditWindow, Field } from '@/components/edit-window'

// Radix Select cannot hold an empty value, so "No desk" is stored as this while editing.
const NO_DESK = 'none'

export function DeskSelect({ value, onChange, any = false, id, className, label }: {
  value: string; onChange: (v: string) => void; any?: boolean; id?: string; className?: string; label?: string
}) {
  const { data, tr } = useWorkspace()
  const ALL = 'all'
  // In filters '' = all desks and 'none' = no desk; in forms '' = no desk.
  const current = any ? (value || ALL) : (value || NO_DESK)
  return (
    <Select value={current} onValueChange={(v) => onChange(any ? (v === ALL ? '' : v) : (v === NO_DESK ? '' : v))}>
      <SelectTrigger id={id} aria-label={label} className={cn('w-full bg-zinc-900 data-[size=default]:h-10 max-md:data-[size=default]:h-11', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {any && <SelectItem value={ALL}>{tr('allDesks')}</SelectItem>}
        <SelectItem value={NO_DESK}>{tr('noDesk')}</SelectItem>
        {data.desks.map((d) => (
          <SelectItem key={d.id} value={d.id}>
            <i className="inline-block size-2.5 rounded-full" style={{ background: deskColor(d.color) }} />
            <bdi className="truncate">{d.name}</bdi>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const chip = 'h-[34px] rounded-full border-zinc-800 bg-zinc-900 px-3 text-[13.5px] font-medium text-zinc-300 hover:border-zinc-600 hover:text-foreground max-md:h-10 max-md:px-3.5 max-md:text-sm'
const chipOn = 'border-primary bg-primary text-white hover:bg-primary hover:text-white'

// One-tap deadlines (No date / Today / Tomorrow / Next week) and a calendar for any other day.
function DeadlinePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { tr, lang, fmtShort } = useWorkspace()
  const [open, setOpen] = React.useState(false)
  const today = todayYmd()
  const choices: [string, string][] = [['', tr('noDate')], [today, tr('dueTodayShort')], [addDays(today, 1), tr('tomorrow')], [addDays(today, 7), tr('nextWeek')]]
  const custom = value && !choices.some(([v]) => v === value)
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={tr('due')}>
      {choices.map(([v, label]) => (
        <Button key={label} type="button" variant="outline" aria-pressed={v === value} className={cn(chip, v === value && chipOn)} onClick={() => onChange(v)}>
          {label}
        </Button>
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" aria-label={tr('pickDate')} title={tr('pickDate')} className={cn(chip, custom && chipOn)}>
            <CalendarIcon />{custom ? fmtShort(value) : ''}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            locale={lang === 'ar' ? arSA : undefined}
            numerals="latn"
            weekStartsOn={0}
            selected={value ? parseYmd(value) : undefined}
            defaultMonth={value ? parseYmd(value) : undefined}
            onSelect={(d) => { onChange(d ? ymd(d) : ''); setOpen(false) }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

const segItem = 'h-auto flex-1 rounded-[7px] px-1.5 py-[7px] text-[13.5px] font-medium text-muted-foreground hover:bg-transparent data-[state=on]:bg-zinc-700 data-[state=on]:text-white max-md:py-[11px] max-md:text-sm'
const segTone: Record<string, string> = {
  doing: 'data-[state=on]:bg-primary',
  waiting: 'data-[state=on]:bg-sun-300 data-[state=on]:text-black',
  done: 'data-[state=on]:bg-zinc-600',
  high: 'data-[state=on]:bg-sun-500 data-[state=on]:text-black',
}

function Segmented<T extends string>({ values, value, onChange, label }: { values: readonly T[]; value: T; onChange: (v: T) => void; label: string }) {
  const { tr } = useWorkspace()
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      aria-label={label}
      spacing={1}
      className="w-full gap-1 rounded-[10px] border border-zinc-800 bg-zinc-900 p-[3px]"
    >
      {values.map((v) => <ToggleGroupItem key={v} value={v} className={cn(segItem, segTone[v])}>{tr(v)}</ToggleGroupItem>)}
    </ToggleGroup>
  )
}

function StepsEditor({ steps, setSteps, pending, setPending }: { steps: Step[]; setSteps: (s: Step[]) => void; pending: string; setPending: (s: string) => void }) {
  const { tr } = useWorkspace()
  const newRef = React.useRef<HTMLInputElement>(null)
  const update = (i: number, patch: Partial<Step>) => setSteps(steps.map((s, n) => (n === i ? { ...s, ...patch } : s)))
  return (
    <div className="flex flex-col gap-1">
      {steps.length > 0 && (
        <ul className="flex flex-col gap-1">
          {steps.map((step, i) => (
            <li key={i} className="flex items-center gap-2">
              <Checkbox checked={step.done} onCheckedChange={(c) => update(i, { done: c === true })} aria-label={tr('markDone')} className="size-[18px] max-md:size-[22px]" />
              <Input
                value={step.text}
                maxLength={200}
                dir="auto"
                aria-label={tr('checklist')}
                onChange={(e) => update(i, { text: e.target.value })}
                // Enter in a step jumps to "add a step" instead of saving the task.
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); newRef.current?.focus() } }}
                className={cn('h-9 flex-1 border-transparent bg-transparent px-2 shadow-none hover:border-zinc-800 focus-visible:bg-zinc-900 dark:bg-transparent max-md:h-11', step.done && 'text-zinc-500 line-through')}
              />
              <Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground opacity-60 hover:opacity-100 max-md:size-10" aria-label={tr('removeStep')}
                onClick={() => setSteps(steps.filter((_, n) => n !== i))}>
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Input
        ref={newRef}
        value={pending}
        placeholder={tr('addStep')}
        aria-label={tr('addStep')}
        maxLength={200}
        dir="auto"
        onChange={(e) => setPending(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
          e.preventDefault()
          const text = pending.trim()
          if (!text) return
          setSteps([...steps, { text, done: false }])
          setPending('')
        }}
        className="h-[38px] border-dashed bg-zinc-900 max-md:h-11"
      />
    </div>
  )
}

function TaskEditor({ item, close }: { item: Partial<Task>; close: () => void }) {
  const { tr, saveItem, change } = useWorkspace()
  const [title, setTitle] = React.useState(item.title || '')
  const [deskId, setDeskId] = React.useState(item.deskId || '')
  const [due, setDue] = React.useState(item.due || '')
  const [status, setStatus] = React.useState(item.status || 'todo')
  const [waitingFor, setWaitingFor] = React.useState(item.waitingFor || '')
  const [priority, setPriority] = React.useState(item.priority || 'normal')
  const [steps, setSteps] = React.useState<Step[]>(item.checklist || [])
  const [pending, setPending] = React.useState('')
  const [notes, setNotes] = React.useState(item.notes || '')
  const titleRef = React.useRef<HTMLInputElement>(null)
  const waitingRef = React.useRef<HTMLInputElement>(null)

  const submit = async () => {
    if (!title.trim()) { titleRef.current?.focus(); return }
    const checklist = steps.concat(pending.trim() ? [{ text: pending.trim(), done: false }] : [])
      .map((s) => ({ ...s, text: s.text.trim() })).filter((s) => s.text)
    try {
      await saveItem('tasks', { ...item, id: item.id || '', title, deskId, due, status, waitingFor, priority, checklist, notes })
      close()
    } catch { /* toast already shown, keep the window open */ }
  }

  // Tasks go straight away with an Undo.
  const remove = async () => {
    try {
      await change({ action: 'delete', type: 'tasks', id: item.id }, '')
      close()
      toast(tr('taskDeleted'), { action: { label: tr('undo'), onClick: () => { saveItem('tasks', { ...item, id: '' }, '').catch(() => {}) } } })
    } catch { /* toast already shown */ }
  }

  return (
    <>
      <Field label={tr('title')} htmlFor="task-title">
        <Input id="task-title" ref={titleRef} autoFocus required maxLength={200} dir="auto" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 bg-zinc-900 max-md:h-11" />
      </Field>
      <Field label={tr('desk')} htmlFor="task-desk"><DeskSelect id="task-desk" value={deskId} onChange={setDeskId} /></Field>
      <Field label={tr('due')}><DeadlinePicker value={due} onChange={setDue} /></Field>
      <Field label={tr('status')}>
        <Segmented values={STATUSES} value={status} label={tr('status')} onChange={(v) => {
          setStatus(v)
          // Picking "Waiting" shows the "waiting for" field.
          if (v === 'waiting') setTimeout(() => waitingRef.current?.focus())
        }} />
      </Field>
      <Field label={tr('waitingFor')} htmlFor="task-waiting" hidden={status !== 'waiting'}>
        <Input id="task-waiting" ref={waitingRef} maxLength={200} dir="auto" placeholder={tr('waitingForPh')} value={waitingFor} onChange={(e) => setWaitingFor(e.target.value)} className="h-10 bg-zinc-900 max-md:h-11" />
      </Field>
      <Field label={tr('priority')}><Segmented values={PRIORITIES} value={priority} label={tr('priority')} onChange={setPriority} /></Field>
      <Field label={tr('checklist')}><StepsEditor steps={steps} setSteps={setSteps} pending={pending} setPending={setPending} /></Field>
      <Field label={tr('details')} htmlFor="task-notes">
        <Textarea id="task-notes" rows={4} maxLength={5000} dir="auto" value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-zinc-900" />
      </Field>
      <SubmitHook submit={submit} remove={item.id ? remove : undefined} />
    </>
  )
}

function DeskEditor({ item, close }: { item: Partial<Desk>; close: () => void }) {
  const { tr, saveItem, change, data, confirm, route } = useWorkspace()
  const [name, setName] = React.useState(item.name || '')
  const [color, setColor] = React.useState<string>(item.color || 'purple')
  const [description, setDescription] = React.useState(item.description || '')
  const nameRef = React.useRef<HTMLInputElement>(null)

  const submit = async () => {
    if (!name.trim()) { nameRef.current?.focus(); return }
    try {
      const json = await saveItem('desks', { ...item, id: item.id || '', name, color, description })
      close()
      if (!item.id && json.id) location.hash = '#desk/' + json.id
    } catch { /* keep the window open */ }
  }

  // A desk takes its tasks and notes with it, so ask first.
  const remove = async () => {
    const s = deskStats(data, item.id!)
    if (!(await confirm(tr('confirmDesk', { name: item.name || '', tasks: s.total, notes: s.notes })))) return
    try {
      await change({ action: 'delete', type: 'desks', id: item.id }, tr('deleted'))
      close()
      if (route.id === item.id) location.hash = '#desks'
    } catch { /* toast already shown */ }
  }

  return (
    <>
      <Field label={tr('name')} htmlFor="desk-name">
        <Input id="desk-name" ref={nameRef} autoFocus required maxLength={80} dir="auto" value={name} onChange={(e) => setName(e.target.value)} className="h-10 bg-zinc-900 max-md:h-11" />
      </Field>
      <Field label={tr('color')}>
        <ToggleGroup type="single" value={color} onValueChange={(v) => v && setColor(v)} spacing={2} className="flex-wrap gap-2.5 pt-1">
          {DESK_COLORS.map((c) => (
            <ToggleGroupItem key={c} value={c} aria-label={c} className="size-9 min-w-0 rounded-full p-0 hover:bg-transparent data-[state=on]:bg-transparent">
              <i className={cn('size-7 rounded-full border-2 border-card shadow-[0_0_0_1px_var(--color-zinc-700)]', color === c && 'shadow-[0_0_0_2px_#fff]')} style={{ background: deskColor(c) }} />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
      <Field label={tr('description')} htmlFor="desk-desc">
        <Textarea id="desk-desc" rows={3} maxLength={500} dir="auto" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-zinc-900" />
      </Field>
      <SubmitHook submit={submit} remove={item.id ? remove : undefined} />
    </>
  )
}

function NoteEditor({ item, close }: { item: Partial<Note>; close: () => void }) {
  const { tr, saveItem, change } = useWorkspace()
  const [title, setTitle] = React.useState(item.title || '')
  const [deskId, setDeskId] = React.useState(item.deskId || '')
  const [body, setBody] = React.useState(item.body || '')
  const [pinned, setPinned] = React.useState(!!item.pinned)

  const submit = async () => {
    try {
      await saveItem('notes', { ...item, id: item.id || '', title, deskId, body, pinned })
      close()
    } catch { /* keep the window open */ }
  }
  const remove = async () => {
    try {
      await change({ action: 'delete', type: 'notes', id: item.id }, '')
      close()
      toast(tr('noteDeleted'), { action: { label: tr('undo'), onClick: () => { saveItem('notes', { ...item, id: '' }, '').catch(() => {}) } } })
    } catch { /* toast already shown */ }
  }

  return (
    <>
      <Field label={tr('title')} htmlFor="note-title">
        <Input id="note-title" autoFocus maxLength={200} dir="auto" value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 bg-zinc-900 max-md:h-11" />
      </Field>
      <Field label={tr('desk')} htmlFor="note-desk"><DeskSelect id="note-desk" value={deskId} onChange={setDeskId} /></Field>
      <Field label={tr('body')} htmlFor="note-body">
        <Textarea id="note-body" rows={10} maxLength={20000} dir="auto" value={body} onChange={(e) => setBody(e.target.value)} className="bg-zinc-900" />
      </Field>
      <div className="flex items-center gap-2.5">
        <Checkbox id="note-pin" checked={pinned} onCheckedChange={(c) => setPinned(c === true)} className="size-[18px]" />
        <Label htmlFor="note-pin" className="text-sm font-normal">{tr('pin')}</Label>
      </div>
      <SubmitHook submit={submit} remove={item.id ? remove : undefined} />
    </>
  )
}

// Lets each editor hand its save and delete to the window's footer buttons.
type Actions = { submit: () => Promise<void> | void; remove?: () => Promise<void> | void }
const SubmitContext = React.createContext<(s: Actions) => void>(() => {})
function SubmitHook({ submit, remove }: Actions) {
  const register = React.useContext(SubmitContext)
  React.useEffect(() => register({ submit, remove }))
  return null
}

const TITLES = { task: ['newTask', 'editTask'], desk: ['newDesk', 'editDesk'], note: ['newNote', 'editNote'] } as const

export function Editors() {
  const { editor, openEditor, tr } = useWorkspace()
  // Keep the last window's content while it animates closed.
  const [shown, setShown] = React.useState<{ editor: NonNullable<Editor>; n: number } | null>(null)
  const actions = React.useRef<Actions>({ submit: () => {} })
  const [hasDelete, setHasDelete] = React.useState(false)
  const register = React.useCallback((a: Actions) => {
    actions.current = a
    setHasDelete(!!a.remove)
  }, [])

  // One save or delete at a time. The ref stops a quick second click straight away
  // (state updates land too late for that); the state shows "Saving…" on the button.
  const [busy, setBusy] = React.useState<'save' | 'delete' | null>(null)
  const busyRef = React.useRef(false)
  const openRef = React.useRef(!!editor)
  openRef.current = !!editor
  const run = async (kind: 'save' | 'delete', action?: () => Promise<void> | void) => {
    if (!action || busyRef.current) return
    busyRef.current = true
    setBusy(kind)
    try {
      await action()
    } finally {
      // If it worked the window is closing: stay locked so the closing window
      // cannot be saved again. If it failed the window is still open: unlock it.
      if (openRef.current) { busyRef.current = false; setBusy(null) }
    }
  }

  React.useEffect(() => {
    if (editor) {
      setShown((s) => ({ editor, n: (s?.n ?? 0) + 1 }))
      busyRef.current = false
      setBusy(null)
    }
  }, [editor])

  if (!shown) return null
  const close = () => openEditor(null)
  const { editor: current, n } = shown
  const title = tr(TITLES[current.kind][current.item.id ? 1 : 0])

  return (
    <SubmitContext.Provider value={register}>
      <EditWindow
        open={!!editor}
        onOpenChange={(o) => { if (!o) close() }}
        title={title}
        onSubmit={() => run('save', actions.current.submit)}
        onDelete={hasDelete ? () => run('delete', actions.current.remove) : undefined}
        busy={busy}
      >
        {current.kind === 'task' && <TaskEditor key={n} item={current.item} close={close} />}
        {current.kind === 'desk' && <DeskEditor key={n} item={current.item} close={close} />}
        {current.kind === 'note' && <NoteEditor key={n} item={current.item} close={close} />}
      </EditWindow>
    </SubmitContext.Provider>
  )
}

export function ConfirmQuestion() {
  const { confirmState, tr } = useWorkspace()
  return (
    <AlertDialog open={!!confirmState} onOpenChange={(o) => { if (!o) confirmState?.resolve(false) }}>
      <AlertDialogContent className="rounded-[18px] border-zinc-700 bg-card">
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="sr-only">{tr('delete')}</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-foreground">{confirmState?.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => confirmState?.resolve(false)}>{tr('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={() => confirmState?.resolve(true)}>{tr('ok')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
