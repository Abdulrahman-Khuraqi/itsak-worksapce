import * as React from 'react'
import { Direction } from 'radix-ui'

import { Toaster } from '@/components/ui/sonner'
import { useWorkspace } from '@/app/workspace'
import { Sidebar, TabBar, useUrgent } from '@/app/shell'
import { ConfirmQuestion, Editors } from '@/components/editors'
import { TodayView } from '@/views/today'
import { DesksView } from '@/views/desks'
import { DeskView } from '@/views/desk'
import { TasksView, NotesView } from '@/views/lists'
import { CalendarView } from '@/views/calendar'

export function App() {
  const { tr, lang, route, data, editor, confirmState, newTask } = useWorkspace()
  const urgent = useUrgent()
  const current = route.view === 'desk' ? 'desks' : route.view
  const mainRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const desk = route.view === 'desk' ? data.desks.find((d) => d.id === route.id) : null
    document.title = `${desk ? desk.name : tr(route.view)} · Itsak Workspace`
  }, [route, data.desks, tr])

  React.useEffect(() => {
    if (document.activeElement === document.body) mainRef.current?.focus({ preventScroll: true })
  }, [route])

  // N opens a new task, unless you are typing somewhere.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'n' || e.ctrlKey || e.metaKey || e.altKey || editor || confirmState) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, button, [contenteditable], [role="dialog"]')) return
      e.preventDefault()
      newTask()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [editor, confirmState, newTask])

  const view = {
    today: <TodayView />,
    desks: <DesksView />,
    desk: <DeskView id={route.id || ''} />,
    tasks: <TasksView />,
    calendar: <CalendarView />,
    notes: <NotesView />,
  }[route.view]

  return (
    <Direction.Provider dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid min-h-screen grid-cols-[248px_minmax(0,1fr)] max-md:grid-cols-[minmax(0,1fr)] max-md:content-start">
        <Sidebar current={current} urgent={urgent} />
        <main ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-[1280px] px-[clamp(16px,4vw,56px)] pt-9 pb-14 outline-none max-md:px-4 max-md:pt-5 max-md:pb-[calc(104px+env(safe-area-inset-bottom))]">
          {view}
        </main>
      </div>
      <TabBar current={current} urgent={urgent} />
      <Editors />
      <ConfirmQuestion />
      <Toaster position="bottom-center" dir={lang === 'ar' ? 'rtl' : 'ltr'} offset={24} toastOptions={{ classNames: { actionButton: '!bg-primary !text-white !font-semibold' } }} mobileOffset={{ bottom: 'calc(92px + env(safe-area-inset-bottom))' }} />
    </Direction.Provider>
  )
}
