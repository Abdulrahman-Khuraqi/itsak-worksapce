import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { deskColor, deskStats } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'
import { DeskDot, Empty, PageHead } from '@/components/bits'
import { DeskProgress } from '@/views/today'

const cardBase = 'relative min-h-[200px] gap-3 overflow-hidden rounded-[14px] p-5 shadow-none'

export function DesksView() {
  const { tr, data, openEditor, fmtShort } = useWorkspace()
  const newDesk = () => openEditor({ kind: 'desk', item: {} })
  return (
    <>
      <PageHead title={tr('desks')}>
        <Button className="h-10 px-4 text-[14.5px] max-md:h-11" onClick={newDesk}><PlusIcon />{tr('newDesk')}</Button>
      </PageHead>
      {!data.desks.length && <Empty big>{tr('noDesks')}</Empty>}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {data.desks.map((d) => {
          const s = deskStats(data, d.id)
          const pct = s.total ? Math.round((s.done / s.total) * 100) : 0
          return (
            <Card key={d.id} className={cn(cardBase, 'p-0 hover:border-zinc-700 hover:bg-zinc-900')}>
              <a href={`#desk/${encodeURIComponent(d.id)}`} className="flex h-full flex-col gap-3 p-5 text-inherit no-underline before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-(--dc)"
                style={{ '--dc': deskColor(d.color) } as React.CSSProperties}>
                <span className="flex items-center gap-[9px] font-head text-[19px] leading-[1.25] font-bold"><DeskDot color={d.color} /><bdi>{d.name}</bdi></span>
                {d.description && <span dir="auto" className="line-clamp-3 text-sm text-muted-foreground">{d.description}</span>}
                <span className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] text-muted-foreground">
                  <span><b className="font-head text-base text-foreground">{s.open}</b> {tr('openWord')}</span>
                  {s.overdue > 0 && <span className="text-alert-400"><b className="font-head text-base">{s.overdue}</b> {tr('overdue')}</span>}
                  <span><b className="font-head text-base text-foreground">{s.notes}</b> {tr('noteWord')}</span>
                </span>
                <DeskProgress color={d.color} value={pct} />
                <span className="text-[13px] text-muted-foreground">{s.next ? tr('nextDue', { d: fmtShort(s.next.due) }) : tr('noDue')}</span>
              </a>
            </Card>
          )
        })}
        <button type="button" onClick={newDesk}
          className={cn(cardBase, 'flex flex-row items-center justify-center gap-2 border border-dashed bg-transparent font-medium text-muted-foreground hover:border-zinc-700 hover:bg-zinc-900 hover:text-foreground')}>
          <PlusIcon className="size-[18px]" />{tr('newDesk')}
        </button>
      </div>
    </>
  )
}
