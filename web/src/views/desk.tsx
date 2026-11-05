// One desk: its To do / Doing / Waiting / Done board and its notes. Cards can be dragged
// within a column and between columns; the column a card lands in becomes its status.
import * as React from 'react'
import { DndContext, closestCorners, useDroppable, type DragEndEvent, type DragOverEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronLeftIcon, PencilIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { STATUSES, byOrder, deskColor, type Status, type Task } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'
import { DoneCheck, DueBadge, Empty, Linkified, PageHead, PriorityFlag, StepsPill, titleTone } from '@/components/bits'
import { DragHandle, liftedCard, sortingBody, useSortSensors, type HandleProps } from '@/components/task-list'
import { NoteCard } from '@/components/note-card'
import { NewTaskButton } from '@/views/today'

type Columns = Record<Status, string[]>

const columnDot: Record<Status, string> = { todo: 'bg-zinc-500', doing: 'bg-brand-400', waiting: 'bg-zinc-400', done: 'bg-zinc-700' }

function BoardCard({ task, handle, lifted, style, setRef }: { task: Task; handle: HandleProps; lifted?: boolean; style?: React.CSSProperties; setRef?: (el: HTMLElement | null) => void }) {
  const { openEditor } = useWorkspace()
  return (
    <li ref={setRef} style={style} className={cn(
      'flex flex-wrap items-start gap-2 rounded-[10px] border border-zinc-800 bg-zinc-900 px-3 py-[11px] hover:border-zinc-700',
      lifted && liftedCard,
    )}>
      <DragHandle handle={handle} className="-ms-1 size-6 max-md:-my-1.5 max-md:-ms-2 max-md:size-9" />
      <DoneCheck task={task} />
      <button type="button" onClick={() => openEditor({ kind: 'task', item: task })} className="group flex min-w-0 flex-1 flex-col gap-2 text-start">
        <span className="flex min-w-0 items-baseline">
          <PriorityFlag task={task} />
          <span dir="auto" className={cn('min-w-0 flex-1 [overflow-wrap:anywhere] underline-offset-4 group-hover:underline group-hover:decoration-zinc-600', titleTone(task))}>
            {task.title}
          </span>
        </span>
        {task.notes && <span dir="auto" className="line-clamp-2 text-[13px] text-zinc-500">{task.notes.slice(0, 120)}</span>}
        <StepsPill task={task} className="mt-1 self-start" />
      </button>
      {task.due && <DueBadge task={task} plain className="basis-full ps-[58px] text-[13px] max-md:ps-16" />}
    </li>
  )
}

function SortableBoardCard({ task, onArrow }: { task: Task; onArrow: (id: string, dir: -1 | 1) => void }) {
  const { setNodeRef, setActivatorNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <BoardCard
      task={task}
      setRef={setNodeRef}
      lifted={isDragging}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      handle={{ setRef: setActivatorNodeRef, listeners, attributes, onArrow: (dir) => onArrow(task.id, dir) }}
    />
  )
}

function Column({ status, ids, byId, deskId, onArrow }: { status: Status; ids: string[]; byId: Map<string, Task>; deskId: string; onArrow: (id: string, dir: -1 | 1) => void }) {
  const { tr, newTask } = useWorkspace()
  // The column itself is a drop target, so a card can go into an empty column.
  const { setNodeRef } = useDroppable({ id: 'col:' + status })
  return (
    <Card aria-label={tr(status)} className="min-h-40 gap-0 rounded-[14px] p-3 shadow-none">
      <h3 className="flex min-h-[38px] items-center gap-2 px-1 pb-2.5 text-sm">
        <i className={cn('size-2 rounded-full', columnDot[status])} />
        {tr(status)}
        <span className="rounded-full bg-zinc-800 px-[7px] py-[3px] font-sans text-[11.5px] leading-none font-medium text-muted-foreground">{ids.length}</span>
        {status !== 'done' && (
          <Button variant="ghost" size="icon-sm" className="ms-auto size-7 text-muted-foreground max-md:size-10" aria-label={tr('newTask')}
            onClick={() => newTask({ deskId, status })}>
            <PlusIcon />
          </Button>
        )}
      </h3>
      <SortableContext id={status} items={ids} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-16 flex-col gap-2">
          {ids.map((id) => byId.get(id)).filter((t): t is Task => !!t).map((t) => <SortableBoardCard key={t.id} task={t} onArrow={onArrow} />)}
          {!ids.length && <li className="rounded-[10px] border border-dashed border-zinc-800 px-1 py-[18px] text-center text-[13px] text-zinc-500">{tr('dropHere')}</li>}
        </ul>
      </SortableContext>
    </Card>
  )
}

function Board({ deskId, tasks }: { deskId: string; tasks: Task[] }) {
  const { change } = useWorkspace()
  const sensors = useSortSensors()
  const fromData = React.useMemo(() => {
    const cols = {} as Columns
    STATUSES.forEach((s) => { cols[s] = tasks.filter((t) => t.status === s).sort(byOrder).map((t) => t.id) })
    return cols
  }, [tasks])
  // While dragging (and until the saved file comes back) the board shows its own copy of the columns.
  const [local, setLocal] = React.useState<{ base: Columns; cols: Columns } | null>(null)
  const cols = local && local.base === fromData ? local.cols : fromData
  const setCols = (next: Columns) => setLocal({ base: fromData, cols: next })
  const byId = new Map(tasks.map((t) => [t.id, t]))
  const startCol = React.useRef<Status | null>(null)

  const columnOf = (id: string, c = cols): Status | null =>
    id.startsWith('col:') ? (id.slice(4) as Status) : STATUSES.find((s) => c[s].includes(id)) ?? null

  const save = (next: Columns, id: string, status: Status) => {
    setCols(next)
    const body: Record<string, unknown> = { action: 'reorder', ids: next[status], id }
    if (byId.get(id)?.status !== status) body.status = status
    change(body, '').catch(() => setLocal(null))
  }

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const from = columnOf(String(active.id))
    const to = columnOf(String(over.id))
    if (!from || !to || from === to) return
    const id = String(active.id)
    const target = cols[to].indexOf(String(over.id))
    const toList = cols[to].filter((x) => x !== id)
    toList.splice(target < 0 ? toList.length : target, 0, id)
    setCols({ ...cols, [from]: cols[from].filter((x) => x !== id), [to]: toList })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    sortingBody.onDragEnd()
    const id = String(active.id)
    const col = columnOf(id)
    if (!over || !col) { setLocal(null); return }
    let list = cols[col]
    const overIndex = list.indexOf(String(over.id))
    if (overIndex >= 0) list = arrayMove(list, list.indexOf(id), overIndex)
    const next = { ...cols, [col]: list }
    const unchanged = col === startCol.current && fromData[col].join() === list.join()
    if (unchanged) { setLocal(null); return }
    save(next, id, col)
  }

  const onArrow = (id: string, dir: -1 | 1) => {
    const col = columnOf(id)
    if (!col) return
    const from = cols[col].indexOf(id)
    const to = from + dir
    if (to < 0 || to >= cols[col].length) return
    save({ ...cols, [col]: arrayMove(cols[col], from, to) }, id, col)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => { sortingBody.onDragStart(); startCol.current = columnOf(String(active.id)) }}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => { sortingBody.onDragEnd(); setLocal(null) }}
    >
      <div className="grid items-start gap-3.5 md:grid-cols-2 min-[75rem]:grid-cols-4">
        {STATUSES.map((s) => <Column key={s} status={s} ids={cols[s]} byId={byId} deskId={deskId} onArrow={onArrow} />)}
      </div>
    </DndContext>
  )
}

export function DeskView({ id }: { id: string }) {
  const { tr, data, openEditor } = useWorkspace()
  const desk = data.desks.find((d) => d.id === id)
  React.useEffect(() => { if (!desk) location.hash = '#desks' }, [desk])
  const tasks = React.useMemo(() => data.tasks.filter((t) => t.deskId === id), [data.tasks, id])
  if (!desk) return null
  const notes = data.notes.filter((n) => n.deskId === id).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated.localeCompare(a.updated))

  return (
    <>
      <a href="#desks" className="mb-3.5 inline-flex items-center gap-1 text-sm text-muted-foreground no-underline hover:text-foreground max-md:min-h-11">
        <ChevronLeftIcon className="size-[18px] rtl-flip" />{tr('backToDesks')}
      </a>
      <PageHead
        eyebrow={<span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-300"><i className="size-2.5 rounded-full" style={{ background: deskColor(desk.color) }} />{tr('taskCount', { n: tasks.length })}</span>}
        title={desk.name}
      >
        <Button variant="outline" className="h-10 max-md:h-11" onClick={() => openEditor({ kind: 'desk', item: desk })}><PencilIcon />{tr('editDesk')}</Button>
        <NewTaskButton item={{ deskId: id }} />
      </PageHead>
      {desk.description && <p dir="auto" className="-mt-3.5 mb-7 max-w-[70ch] whitespace-pre-line text-zinc-300"><Linkified text={desk.description} /></p>}
      <Board deskId={id} tasks={tasks} />
      <Card className="mt-5 gap-3.5 rounded-[14px] p-5 shadow-none">
        <h2 className="flex items-center justify-between gap-3 text-[17px]">
          {tr('deskNotes')}
          <Button variant="outline" size="sm" className="max-md:h-10" onClick={() => openEditor({ kind: 'note', item: { deskId: id } })}><PlusIcon />{tr('addNote')}</Button>
        </h2>
        {notes.length
          ? <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5">{notes.map((n) => <NoteCard key={n.id} note={n} />)}</div>
          : <Empty>{tr('noNotes')}</Empty>}
      </Card>
    </>
  )
}
