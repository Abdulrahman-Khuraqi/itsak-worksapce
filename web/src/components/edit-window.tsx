// The edit window: a centred Dialog on larger screens, a Drawer that slides up from the bottom on phones.
import * as React from 'react'
import { Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useIsPhone } from '@/components/bits'
import { useWorkspace } from '@/app/workspace'

export function EditWindow({ open, onOpenChange, title, onSubmit, onDelete, busy = null, children }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onSubmit?: () => void
  onDelete?: () => void
  // While a save or delete is on its way, both buttons are locked so a second click cannot send it again.
  busy?: 'save' | 'delete' | null
  children: React.ReactNode
}) {
  const phone = useIsPhone()
  const { tr } = useWorkspace()

  const form = (
    <form
      noValidate
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => { e.preventDefault(); if (!busy) onSubmit?.() }}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain px-4 py-2 md:px-5">{children}</div>
      {onSubmit && (
        <footer className="mt-1.5 flex items-center gap-2 border-t bg-card px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:px-5 md:pb-[18px]">
          {onDelete && (
            <Button type="button" variant="ghost" disabled={!!busy} aria-busy={busy === 'delete'} className="px-2 text-destructive hover:bg-alert-900 hover:text-destructive max-md:h-11" onClick={onDelete}>
              {busy === 'delete' ? <><Loader2Icon className="animate-spin" />{tr('deleting')}</> : tr('delete')}
            </Button>
          )}
          <span className="flex-1" />
          <Button type="button" variant="outline" className="max-md:h-11" onClick={() => onOpenChange(false)}>{tr('cancel')}</Button>
          <Button type="submit" disabled={!!busy} aria-busy={busy === 'save'} className="max-md:h-11 max-md:min-w-[110px]">
            {busy === 'save' ? <><Loader2Icon className="animate-spin" />{tr('saving')}</> : tr('save')}
          </Button>
        </footer>
      )}
    </form>
  )

  if (phone) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
        <DrawerContent className="max-h-[94dvh] rounded-t-[22px] border-zinc-700 bg-card data-[vaul-drawer-direction=bottom]:max-h-[94dvh]">
          <DrawerHeader className="px-4 pt-2.5 pb-1 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-start">
            <DrawerTitle className="font-head text-xl">{title}</DrawerTitle>
            <DrawerDescription className="sr-only">{title}</DrawerDescription>
          </DrawerHeader>
          {form}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[calc(100vh-32px)] flex-col gap-0 overflow-hidden rounded-[18px] border-zinc-700 bg-card p-0 shadow-[0_30px_80px_rgba(0,0,0,.7)] sm:max-w-[560px]">
        <DialogHeader className="px-5 pt-5 pb-1.5 text-start">
          <DialogTitle className="font-head text-xl">{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  )
}

export function Field({ label, htmlFor, children, hidden }: { label: string; htmlFor?: string; children: React.ReactNode; hidden?: boolean }) {
  if (hidden) return null
  const Tag = htmlFor ? 'div' : 'fieldset'
  return (
    <Tag className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
      {htmlFor
        ? <label htmlFor={htmlFor} className="text-[13px] font-medium text-muted-foreground">{label}</label>
        : <legend className="mb-1.5 p-0 text-[13px] font-medium text-muted-foreground">{label}</legend>}
      {children}
    </Tag>
  )
}
