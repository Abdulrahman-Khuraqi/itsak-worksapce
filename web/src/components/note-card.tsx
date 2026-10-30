import { PinIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Note } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'
import { DeskChip, Linkified } from '@/components/bits'

export function NoteCard({ note }: { note: Note }) {
  const { tr, data, fmtShort, openEditor, saveItem } = useWorkspace()
  const desk = data.desks.find((d) => d.id === note.deskId)
  const body = note.body.length > 400 ? note.body.slice(0, 400) + '…' : note.body
  return (
    <article className={cn('flex min-w-0 flex-col gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5', note.pinned && 'border-brand-700')}>
      <header className="-me-1.5 -mt-0.5 flex items-start gap-1.5">
        <button
          type="button"
          dir="auto"
          onClick={() => openEditor({ kind: 'note', item: note })}
          className="min-w-0 flex-1 py-1 text-start font-head text-[15.5px] leading-[1.35] font-bold [overflow-wrap:anywhere] underline-offset-[3px] hover:text-white hover:underline hover:decoration-zinc-600 max-md:min-h-11"
        >
          {note.title || note.body.split('\n')[0]}
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-pressed={note.pinned}
          aria-label={tr('pin')}
          title={tr('pin')}
          onClick={() => saveItem('notes', { ...note, pinned: !note.pinned }, '').catch(() => {})}
          className={cn('text-muted-foreground max-md:size-10', note.pinned && 'text-sun-500 hover:text-sun-500')}
        >
          <PinIcon />
        </Button>
      </header>
      {note.title && body && <p dir="auto" className="m-0 text-sm whitespace-pre-line text-zinc-300 [overflow-wrap:anywhere]"><Linkified text={body} /></p>}
      <footer className="mt-auto flex items-center justify-between gap-2.5 text-[12.5px]">
        <DeskChip desk={desk} />
        <span className="text-muted-foreground">{tr('updated', { d: fmtShort(note.updated.slice(0, 10)) })}</span>
      </footer>
    </article>
  )
}
