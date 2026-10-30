// The Tasks page (every task, with search and filters) and the Notes page.
import { PlusIcon, SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { STATUSES, byDeadline, byOrder, isOpen } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'
import { Empty, PageHead } from '@/components/bits'
import { DeskSelect } from '@/components/editors'
import { TaskList } from '@/components/task-list'
import { NoteCard } from '@/components/note-card'
import { NewTaskButton } from '@/views/today'

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { tr } = useWorkspace()
  return (
    <div className="relative flex-[1_1_240px] max-md:basis-full">
      <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
      <Input type="search" dir="auto" value={value} placeholder={tr('search')} aria-label={tr('search')} onChange={(e) => onChange(e.target.value)}
        className="h-10 bg-zinc-900 ps-9 max-md:h-11" />
    </div>
  )
}

const filterSelect = 'h-10 data-[size=default]:h-10 w-auto min-w-36 bg-zinc-900 max-md:h-11 max-md:data-[size=default]:h-11 max-md:min-w-0 max-md:flex-1'

export function TasksView() {
  const { tr, data, filters: f, setFilter } = useWorkspace()
  const q = f.q.trim().toLowerCase()
  const list = data.tasks.filter((t) =>
    (f.status === 'all' || (f.status === 'active' ? isOpen(t) && t.status !== 'waiting' : f.status === 'open' ? isOpen(t) : t.status === f.status)) &&
    (!f.desk || (f.desk === 'none' ? !t.deskId : t.deskId === f.desk)) &&
    (!q || (t.title + ' ' + t.notes).toLowerCase().includes(q)),
  ).sort(f.sort === 'new' ? (a, b) => b.created.localeCompare(a.created)
    : (a, b) => Number(!isOpen(a)) - Number(!isOpen(b)) || (f.sort === 'mine' ? byOrder(a, b) : byDeadline(a, b)))
  const sortable = f.sort === 'mine' && list.length > 1

  return (
    <>
      <PageHead title={tr('tasks')}><NewTaskButton /></PageHead>
      <div className="mb-[18px] flex flex-wrap gap-2 md:gap-2.5">
        <SearchBox value={f.q} onChange={(v) => setFilter('q', v)} />
        <DeskSelect any value={f.desk} onChange={(v) => setFilter('desk', v)} label={tr('desk')} className={filterSelect} />
        <Select value={f.status} onValueChange={(v) => setFilter('status', v)}>
          <SelectTrigger aria-label={tr('status')} className={filterSelect}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{tr('active')}</SelectItem>
            <SelectItem value="open">{tr('open')}</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{tr(s)}</SelectItem>)}
            <SelectItem value="all">{tr('all')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={f.sort} onValueChange={(v) => setFilter('sort', v)}>
          <SelectTrigger aria-label={tr('sort')} className={filterSelect}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mine">{tr('sortMine')}</SelectItem>
            <SelectItem value="due">{tr('sortDue')}</SelectItem>
            <SelectItem value="new">{tr('sortNew')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {sortable && <p className="-mt-1.5 mb-3 text-[13px] text-zinc-500">{tr('sortHint')}</p>}
      {list.length ? <TaskList tasks={list} sortable={sortable} /> : <Empty big>{tr('noTasks')}</Empty>}
    </>
  )
}

export function NotesView() {
  const { tr, data, filters: f, setFilter, openEditor } = useWorkspace()
  const q = f.noteQ.trim().toLowerCase()
  const list = data.notes.filter((n) =>
    (!f.noteDesk || (f.noteDesk === 'none' ? !n.deskId : n.deskId === f.noteDesk)) &&
    (!q || (n.title + ' ' + n.body).toLowerCase().includes(q)),
  ).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated.localeCompare(a.updated))

  return (
    <>
      <PageHead title={tr('notes')}>
        <Button className="h-10 px-4 text-[14.5px] max-md:h-11" onClick={() => openEditor({ kind: 'note', item: {} })}><PlusIcon />{tr('newNote')}</Button>
      </PageHead>
      <div className="mb-[18px] flex flex-wrap gap-2 md:gap-2.5">
        <SearchBox value={f.noteQ} onChange={(v) => setFilter('noteQ', v)} />
        <DeskSelect any value={f.noteDesk} onChange={(v) => setFilter('noteDesk', v)} label={tr('desk')} className={filterSelect} />
      </div>
      {list.length
        ? <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5">{list.map((n) => <NoteCard key={n.id} note={n} />)}</div>
        : <Empty big>{tr('noNotes')}</Empty>}
    </>
  )
}
