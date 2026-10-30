// The frame around every page: the sidebar on larger screens; on phones a compact top bar,
// a tab bar at the bottom with a big + in the middle, and a "More" sheet.
import * as React from 'react'
import { CalendarDaysIcon, CrosshairIcon, DownloadIcon, EllipsisIcon, FileTextIcon, GlobeIcon, LayoutGridIcon, ListChecksIcon, LogOutIcon, PlusIcon, SunIcon, UploadIcon, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { deskColor, deskStats, focusQueue, isOpen, todayYmd } from '@/lib/data'
import { Count, DeskDot } from '@/components/bits'
import { exportData, signOut, useImport, useWorkspace, type View } from '@/app/workspace'

const ICONS: Record<string, LucideIcon> = {
  focus: CrosshairIcon, today: SunIcon, desks: LayoutGridIcon, tasks: ListChecksIcon, calendar: CalendarDaysIcon, notes: FileTextIcon,
}

function useFootActions() {
  const { tr, lang, toggleLang, data, authEnabled } = useWorkspace()
  const importData = useImport()
  return [
    { icon: GlobeIcon, label: tr('switchLang'), lang: lang === 'ar' ? 'en' : 'ar', run: toggleLang },
    { icon: DownloadIcon, label: tr('exportData'), run: () => exportData(data) },
    { icon: UploadIcon, label: tr('importData'), run: importData },
    ...(authEnabled ? [{ icon: LogOutIcon, label: tr('signOut'), run: signOut }] : []),
  ]
}

const sideLink = 'flex w-full items-center gap-[11px] rounded-[9px] px-2.5 py-[9px] text-start font-medium text-zinc-300 no-underline hover:bg-zinc-900 hover:text-zinc-50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

function Brand() {
  return (
    <a href="#focus" aria-label="Itsak.tech Workspace" className="flex flex-col gap-2 px-2.5 pt-0.5 pb-1.5 max-md:min-h-11 max-md:flex-row max-md:items-center max-md:p-0">
      <img src="assets/img/logo-full-white.svg" alt="" width={148} height={40} className="block h-auto w-[148px] max-md:w-24" />
      <span className="self-start rounded-md bg-brand-800 px-2 pt-[5px] pb-1 font-head text-[10.5px] leading-none font-bold tracking-[.16em] text-brand-200 uppercase rtl:tracking-normal max-md:self-center max-md:px-1.5 max-md:text-[9.5px]">
        Workspace
      </span>
    </a>
  )
}

export function Sidebar({ current, urgent }: { current: View; urgent: number }) {
  const { tr, data, route, openEditor } = useWorkspace()
  const foot = useFootActions()
  const [moreOpen, setMoreOpen] = React.useState(false)
  const open = data.tasks.filter(isOpen)
  const nav: [View, number][] = [
    ['focus', focusQueue(data).length], ['today', urgent], ['desks', data.desks.length], ['tasks', open.length], ['calendar', 0], ['notes', data.notes.length],
  ]

  return (
    <aside className={cn(
      'sticky top-0 flex h-screen flex-col gap-6 overflow-y-auto border-e bg-card px-3.5 pt-6 pb-[18px]',
      'max-md:z-20 max-md:h-auto max-md:flex-row max-md:items-center max-md:gap-2 max-md:overflow-visible max-md:border-e-0 max-md:border-b',
      'max-md:bg-zinc-950/90 max-md:ps-4 max-md:pe-3 max-md:pt-[calc(8px+env(safe-area-inset-top))] max-md:pb-2 max-md:backdrop-blur-md max-md:backdrop-saturate-150',
    )}>
      <Brand />

      <nav aria-label={tr('mainNav')} className="flex flex-col gap-0.5 max-md:hidden">
        {nav.map(([view, count]) => {
          const Icon = ICONS[view]
          const active = current === view
          return (
            <a key={view} href={`#${view}`} aria-current={active ? 'page' : undefined}
              className={cn(sideLink, active && 'bg-primary text-white hover:bg-primary hover:text-white')}>
              <Icon className="size-[18px]" strokeWidth={1.8} />
              <span>{tr(view)}</span>
              {count > 0 && <Count hot={view === 'today'} className={cn(active && 'bg-black/35 text-white')}>{count}</Count>}
            </a>
          )
        })}
      </nav>

      <div className="flex flex-col gap-px max-md:hidden">
        <p className="mx-2.5 mb-1.5 font-head text-[11px] leading-none font-bold tracking-[.14em] text-zinc-500 uppercase rtl:tracking-normal">{tr('desks')}</p>
        {data.desks.map((d) => {
          const s = deskStats(data, d.id)
          const active = route.view === 'desk' && route.id === d.id
          return (
            <a key={d.id} href={`#desk/${encodeURIComponent(d.id)}`} aria-current={active ? 'page' : undefined}
              className={cn(sideLink, 'py-[7px] text-sm', active && 'bg-zinc-900 text-white shadow-[inset_3px_0_0_var(--dc)] rtl:shadow-[inset_-3px_0_0_var(--dc)]')}
              style={{ '--dc': deskColor(d.color) } as React.CSSProperties}>
              <DeskDot color={d.color} />
              <bdi className="truncate">{d.name}</bdi>
              {s.overdue ? <Count hot>{s.overdue}</Count> : s.open ? <Count>{s.open}</Count> : null}
            </a>
          )
        })}
        <button type="button" className={cn(sideLink, 'py-[7px] text-sm text-zinc-500')} onClick={() => openEditor({ kind: 'desk', item: {} })}>
          <PlusIcon className="size-[18px]" /><span>{tr('newDesk')}</span>
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-px border-t pt-3 max-md:hidden">
        {foot.map((a) => (
          <button key={a.label} type="button" lang={a.lang} onClick={a.run}
            className="flex items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-start text-[13.5px] text-muted-foreground hover:bg-zinc-900 hover:text-foreground">
            <a.icon className="size-[18px]" strokeWidth={1.8} /><span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Phone top bar: notes, calendar and the More sheet */}
      <div className="ms-auto hidden gap-0.5 max-md:flex">
        <Button asChild variant="ghost" size="icon-lg" className={cn('size-11 w-[42px] rounded-xl text-zinc-300', current === 'notes' && 'bg-primary text-white hover:bg-primary')}>
          <a href="#notes" aria-label={tr('notes')} aria-current={current === 'notes' ? 'page' : undefined}><FileTextIcon className="size-[22px]" /></a>
        </Button>
        <Button asChild variant="ghost" size="icon-lg" className={cn('size-11 w-[42px] rounded-xl text-zinc-300', current === 'calendar' && 'bg-primary text-white hover:bg-primary')}>
          <a href="#calendar" aria-label={tr('calendar')} aria-current={current === 'calendar' ? 'page' : undefined}><CalendarDaysIcon className="size-[22px]" /></a>
        </Button>
        <Button variant="ghost" size="icon-lg" className="size-11 w-[42px] rounded-xl text-zinc-300" aria-haspopup="dialog" aria-label={tr('moreMenu')} onClick={() => setMoreOpen(true)}>
          <EllipsisIcon className="size-[22px]" />
        </Button>
      </div>
      <Drawer open={moreOpen} onOpenChange={setMoreOpen}>
        <DrawerContent className="rounded-t-[22px] border-zinc-700 bg-card">
          <DrawerHeader className="px-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-start">
            <DrawerTitle className="font-head text-xl">{tr('moreMenu')}</DrawerTitle>
            <DrawerDescription className="sr-only">{tr('moreMenu')}</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col px-3 pt-1 pb-[calc(16px+env(safe-area-inset-bottom))]">
            {foot.map((a) => (
              <button key={a.label} type="button" lang={a.lang} onClick={() => { setMoreOpen(false); a.run() }}
                className="flex min-h-[52px] items-center gap-3.5 rounded-xl px-2.5 text-start text-base hover:bg-zinc-900 active:bg-zinc-900">
                <a.icon className="size-[22px] text-muted-foreground" /><span>{a.label}</span>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </aside>
  )
}

// Phone navigation: four places and a big + in the middle, like an app.
export function TabBar({ current, urgent }: { current: View; urgent: number }) {
  const { tr, newTask } = useWorkspace()
  const tab = (view: View, label: string, badge = 0) => {
    const Icon = ICONS[view]
    const active = current === view
    return (
      <a href={`#${view}`} aria-current={active ? 'page' : undefined} aria-label={label + (badge ? ', ' + tr('dueCount', { n: badge }) : '')}
        className={cn('group flex min-h-14 flex-col items-center justify-center gap-[3px] px-0.5 py-1 text-[11.5px] font-medium text-zinc-400 no-underline', active && 'text-white')}>
        <span className={cn('relative grid h-[30px] w-14 place-items-center rounded-full transition-colors group-active:bg-zinc-800', active && 'bg-primary group-active:bg-primary')}>
          <Icon className="size-[22px]" strokeWidth={1.8} />
          {badge > 0 && (
            <span aria-hidden className="absolute -top-1 end-1.5 h-[18px] min-w-[18px] rounded-full bg-sun-500 px-[5px] text-center text-[11px] leading-[18px] font-bold text-black shadow-[0_0_0_2px_var(--color-zinc-950)]">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </span>
        <span aria-hidden className="max-w-full truncate">{label}</span>
      </a>
    )
  }
  return (
    <nav aria-label={tr('mainNav')} className="fixed inset-x-0 bottom-0 z-30 hidden grid-cols-5 items-end border-t bg-zinc-950/95 px-1.5 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] backdrop-blur-md backdrop-saturate-150 max-md:grid">
      {tab('focus', tr('focus'))}
      {tab('today', tr('today'), urgent)}
      <button type="button" onClick={() => newTask()} aria-label={tr('newTask')} className="group self-center">
        <span className="mx-auto -mt-[26px] grid size-14 place-items-center rounded-full bg-primary text-white shadow-[0_8px_24px_rgba(102,45,139,.6),0_0_0_5px_#000] transition-transform group-active:scale-95">
          <PlusIcon className="size-7" strokeWidth={2.2} />
        </span>
      </button>
      {tab('desks', tr('desks'))}
      {tab('tasks', tr('tasks'))}
    </nav>
  )
}

export function useUrgent() {
  const { data } = useWorkspace()
  const today = todayYmd()
  return data.tasks.filter((t) => isOpen(t) && t.due && t.due <= today && t.status !== 'waiting').length
}
