// Task cards, and lists of them that can be reordered by dragging the ⋮⋮ handle
// (mouse or finger). With the handle focused, the arrow keys move a task one step.
import * as React from 'react'
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DraggableAttributes, type DraggableSyntheticListeners } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { isOpen, type Desk, type Task } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'
import { DeskChip, DoneCheck, DueBadge, StepsPill, WaitingPill } from '@/components/bits'

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

export const highEdge = 'shadow-[inset_3px_0_0_var(--color-sun-500)] rtl:shadow-[inset_-3px_0_0_var(--color-sun-500)]'
export const liftedCard = 'relative z-10 bg-zinc-800 shadow-[0_10px_28px_rgba(0,0,0,.65),0_0_0_1px_var(--color-brand-400)]'

export function TaskCard({ task, showDesk = true, handle, lifted, style, setRef }: {
  task: Task
  showDesk?: boolean
  handle?: HandleProps
  lifted?: boolean
  style?: React.CSSProperties
  setRef?: (el: HTMLElement | null) => void
}) {
  const { tr, data, openEditor } = useWorkspace()
  const open = isOpen(task)
  const high = task.priority === 'high' && open
  const desk = showDesk ? data.desks.find((d) => d.id === task.deskId) : null
  return (
    <li
      ref={setRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-[14px] border bg-card px-3.5 py-3.5 transition-[border-color,background-color] hover:border-zinc-700 md:gap-3.5 md:px-[18px]',
        high && highEdge,
        !open && 'bg-transparent',
        lifted && liftedCard,
      )}
    >
      {handle && <DragHandle handle={handle} />}
      <DoneCheck task={task} />
      <button
        type="button"
        onClick={() => openEditor({ kind: 'task', item: task })}
        className="group flex min-w-0 flex-1 flex-col gap-2 py-0.5 text-start outline-none max-md:min-h-12 max-md:justify-center focus-visible:rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span
          dir="auto"
          className={cn(
            'text-base leading-[1.45] font-medium [overflow-wrap:anywhere] text-zinc-50 underline-offset-4 group-hover:text-white group-hover:underline group-hover:decoration-zinc-600 max-md:text-[16.5px]',
            !open && 'text-zinc-500 line-through group-hover:text-zinc-500',
          )}
        >
          {task.title}
        </span>
        <TaskMeta task={task} desk={desk} tr={tr} />
      </button>
    </li>
  )
}

function TaskMeta({ task, desk, tr }: { task: Task; desk: Desk | null | undefined; tr: (k: string) => string }) {
  const open = isOpen(task)
  const parts = [
    task.due && <DueBadge key="due" task={task} />,
    desk && <DeskChip key="desk" desk={desk} />,
    task.status === 'doing' && <Badge key="doing" className="rounded-full bg-brand-800 text-brand-200">{tr('doing')}</Badge>,
    task.status === 'waiting' && <WaitingPill key="waiting" task={task} />,
    task.priority === 'high' && open && <Badge key="high" className="rounded-full bg-sun-900 text-sun-300">{tr('high')}</Badge>,
    task.checklist?.length > 0 && <StepsPill key="steps" task={task} />,
  ].filter(Boolean)
  if (!parts.length) return null
  return <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">{parts}</span>
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
  const list = 'flex flex-col gap-2.5'

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
