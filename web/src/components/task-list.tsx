// Task cards, and lists of them that can be reordered by dragging the ⋮⋮ handle
// (mouse or finger). With the handle focused, the arrow keys move a task one step.
import * as React from 'react'
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DraggableAttributes, type DraggableSyntheticListeners } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { isOpen, type Desk, type Task } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'
import { DeskChip, DoingLabel, DoneCheck, DueBadge, PriorityFlag, StepsPill, WaitingPill, titleTone, useDue } from '@/components/bits'

export interface HandleProps {
  setRef: (el: HTMLElement | null) => void
  listeners: DraggableSyntheticListeners
  attributes?: DraggableAttributes
  onArrow: (dir: -1 | 1) => void
}

export function DragHandle({ handle, className }: { handle: HandleProps; className?: string }) {
  const { tr } = useWorkspace()
  return (
    <button
      type="button"
      ref={handle.setRef}
      {...handle.attributes}
      {...handle.listeners}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          handle.onArrow(e.key === 'ArrowUp' ? -1 : 1)
        } else handle.listeners?.onKeyDown?.(e)
      }}
      aria-label={tr('dragToMove')}
      title={tr('dragToMove')}
      className={cn(
        'grid h-8 w-7 shrink-0 cursor-grab touch-none place-items-center rounded-[7px] text-zinc-500 outline-none',
        'hover:bg-zinc-800 hover:text-zinc-200 focus-visible:bg-zinc-800 focus-visible:text-zinc-200 focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'max-md:-ms-1.5 max-md:h-11 max-md:w-9',
        className,
      )}
    >
      <GripVerticalIcon className="size-[18px]" />
    </button>
  )
}

export const liftedCard = 'relative z-10 rounded-xl bg-zinc-800 shadow-[0_10px_28px_rgba(0,0,0,.65),0_0_0_1px_var(--color-brand-400)]'

// A thin bar on the start edge for tasks that are late (red) or due today (amber).
const urgentEdge = {
  late: 'before:bg-alert-500',
  today: 'before:bg-sun-500',
}
const edgeBar = 'before:absolute before:inset-y-3 before:start-0 before:w-[3px] before:rounded-e-full rtl:before:rounded-e-none rtl:before:rounded-s-full'

// One row: done box, title (with a flag if High) and a quiet line of details, and the deadline at the end,
// always in the same place so the dates line up and can be read down the list.
export function TaskCard({ task, showDesk = true, handle, lifted, style, setRef }: {
  task: Task
  showDesk?: boolean
  handle?: HandleProps
  lifted?: boolean
  style?: React.CSSProperties
  setRef?: (el: HTMLElement | null) => void
}) {
  const { data, openEditor } = useWorkspace()
  const due = useDue()(task)
  const edge = due && (due.tone === 'late' || due.tone === 'today') ? urgentEdge[due.tone] : ''
  const desk = showDesk ? data.desks.find((d) => d.id === task.deskId) : null
  return (
    <li
      ref={setRef}
      style={style}
      className={cn(
        'group/row relative flex items-center gap-3 px-3 py-3 transition-colors hover:bg-zinc-900/70 md:gap-3.5 md:px-4',
        'first:rounded-t-[13px] last:rounded-b-[13px]',
        edge && [edgeBar, edge],
        lifted && liftedCard,
      )}
    >
      {handle && <DragHandle handle={handle} className="md:-ms-1.5 md:w-6 md:opacity-0 md:transition-opacity md:group-hover/row:opacity-100 md:focus-visible:opacity-100" />}
      <DoneCheck task={task} />
      <button
        type="button"
        onClick={() => openEditor({ kind: 'task', item: task })}
        className="group flex min-w-0 flex-1 flex-col gap-1 py-0.5 text-start outline-none max-md:min-h-11 max-md:justify-center focus-visible:rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="flex min-w-0 items-baseline">
          <PriorityFlag task={task} />
          <span dir="auto" className={cn('min-w-0 flex-1 text-[15.5px] leading-[1.45] [overflow-wrap:anywhere] underline-offset-4 group-hover:underline group-hover:decoration-zinc-600 max-md:text-base', titleTone(task))}>
            {task.title}
          </span>
        </span>
        <TaskMeta task={task} desk={desk} />
      </button>
      <DueBadge task={task} className="shrink-0" />
    </li>
  )
}

function TaskMeta({ task, desk }: { task: Task; desk: Desk | null | undefined }) {
  const open = isOpen(task)
  const parts = [
    desk && <DeskChip key="desk" desk={desk} className="text-zinc-400" />,
    open && <DoingLabel key="doing" task={task} />,
    <WaitingPill key="waiting" task={task} />,
    <StepsPill key="steps" task={task} />,
  ].filter(Boolean)
  if (!desk && task.status !== 'doing' && task.status !== 'waiting' && !task.checklist?.length) return null
  return <span className="flex min-w-0 flex-wrap items-center gap-x-3.5 gap-y-1">{parts}</span>
}

function SortableTaskCard({ task, showDesk, onArrow }: { task: Task; showDesk?: boolean; onArrow: (id: string, dir: -1 | 1) => void }) {
  const { setNodeRef, setActivatorNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <TaskCard
      task={task}
      showDesk={showDesk}
      setRef={setNodeRef}
      lifted={isDragging}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      handle={{ setRef: setActivatorNodeRef, listeners, attributes, onArrow: (dir) => onArrow(task.id, dir) }}
    />
  )
}

export function useSortSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
}

export const sortingBody = {
  onDragStart: () => document.body.classList.add('is-sorting'),
  onDragEnd: () => document.body.classList.remove('is-sorting'),
}

// Keeps the order the person just dragged to until the saved file comes back.
export function useLocalOrder(ids: string[]) {
  const key = ids.join(',')
  const [local, setLocal] = React.useState<{ key: string; ids: string[] } | null>(null)
  return [local && local.key === key ? local.ids : ids, (next: string[]) => setLocal({ key, ids: next })] as const
}

// With sortKey the list can be reordered by dragging; the new order is saved with api.php "reorder".
export function TaskList({ tasks, showDesk = true, sortable = false }: { tasks: Task[]; showDesk?: boolean; sortable?: boolean }) {
  const { change } = useWorkspace()
  const sensors = useSortSensors()
  const [ids, setIds] = useLocalOrder(tasks.map((t) => t.id))
  const byId = new Map(tasks.map((t) => [t.id, t]))
  // One calm panel per list, rows split by thin lines.
  const list = 'flex flex-col divide-y divide-zinc-800/80 rounded-[14px] border bg-card'

  if (!sortable || tasks.length < 2) {
    return <ul className={list}>{tasks.map((t) => <TaskCard key={t.id} task={t} showDesk={showDesk} />)}</ul>
  }

  const save = (next: string[], moved: string) => {
    setIds(next)
    change({ action: 'reorder', ids: next, id: moved }, '').catch(() => setIds(ids))
  }
  const onDragEnd = (e: DragEndEvent) => {
    sortingBody.onDragEnd()
    const { active, over } = e
    if (!over || active.id === over.id) return
    save(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))), String(active.id))
  }
  const onArrow = (id: string, dir: -1 | 1) => {
    const from = ids.indexOf(id)
    const to = from + dir
    if (to < 0 || to >= ids.length) return
    save(arrayMove(ids, from, to), id)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={sortingBody.onDragStart} onDragEnd={onDragEnd} onDragCancel={sortingBody.onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={list}>
          {ids.map((id) => byId.get(id)).filter((t): t is Task => !!t).map((t) => (
            <SortableTaskCard key={t.id} task={t} showDesk={showDesk} onArrow={onArrow} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
