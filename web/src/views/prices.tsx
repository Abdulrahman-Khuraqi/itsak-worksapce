// The Prices page: each product with our price, another Saudi store's price and Amazon.sa's,
// side by side, so you can choose the price to sell at. Tap a price to choose it, or type one.
import * as React from 'react'
import { CheckIcon, PencilIcon, PlusIcon, SearchIcon, Undo2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/data'
import { useWorkspace } from '@/app/workspace'
import { Empty, PageHead } from '@/components/bits'

const competitors = (p: Product) => [p.storePrice, p.amazon].filter((v): v is number => v != null)
const cheapestRival = (p: Product) => { const c = competitors(p); return c.length ? Math.min(...c) : null }
const lowestOfAll = (p: Product) => { const all = [p.ours, ...competitors(p)].filter((v): v is number => v != null); return all.length ? Math.min(...all) : null }

function useMoney() {
  const { lang, tr } = useWorkspace()
  return React.useCallback((n: number | null) => {
    if (n == null) return '—'
    const num = new Intl.NumberFormat(lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { maximumFractionDigits: 2 }).format(n)
    return `${num} ${tr('sar')}`
  }, [lang, tr])
}

// How a price compares with the cheapest competitor.
function Compare({ product, value }: { product: Product; value: number | null }) {
  const { tr } = useWorkspace()
  const money = useMoney()
  const rival = cheapestRival(product)
  if (rival == null || value == null || Number.isNaN(value)) return null
  const d = Math.round((value - rival) * 100) / 100
  if (d < 0) return <span className="text-[12.5px] text-emerald-400">{tr('cheaperBy', { n: money(-d) })}</span>
  if (d === 0) return <span className="text-[12.5px] text-muted-foreground">{tr('sameAsLowest')}</span>
  return <span className="text-[12.5px] text-alert-400">{tr('dearerBy', { n: money(d) })}</span>
}

function PriceCell({ label, sub, value, lowest, picked, tone, onPick }: {
  label: string; sub: string; value: number | null; lowest: boolean; picked: boolean; tone: string; onPick: () => void
}) {
  const { tr } = useWorkspace()
  const money = useMoney()
  return (
    <button type="button" disabled={value == null} onClick={onPick} title={value != null ? tr('tapToChoose') : undefined}
      className={cn(
        'flex min-w-0 flex-col items-center gap-0.5 rounded-xl border-2 border-transparent px-2 py-2 text-center transition-colors outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 enabled:hover:border-zinc-600 disabled:cursor-default',
        tone, picked && 'border-white enabled:hover:border-white',
      )}>
      <span className="text-[11.5px] text-muted-foreground md:hidden">{label}</span>
      <span className="flex flex-wrap items-center justify-center gap-1 font-head text-[15.5px] font-bold">
        {value == null ? <span className="font-normal text-muted-foreground">{tr('notListed')}</span> : money(value)}
        {lowest && <span className="rounded-md bg-emerald-500 px-1.5 text-[10.5px] leading-[18px] font-bold text-black">{tr('lowest')}</span>}
      </span>
      <bdi className="max-w-full truncate text-[12px] text-muted-foreground">{sub}</bdi>
    </button>
  )
}

function ProductRow({ product: p }: { product: Product }) {
  const { tr, saveItem, openEditor } = useWorkspace()
  const money = useMoney()
  const [typed, setTyped] = React.useState(String(p.final ?? p.ours ?? ''))
  React.useEffect(() => { setTyped(String(p.final ?? p.ours ?? '')) }, [p.final, p.ours])
  const low = lowestOfAll(p)
  const chosen = p.final != null

  const choose = (final: number | null) => {
    saveItem('products', { ...p, final }, final != null ? tr('priceChosen', { n: money(final) }) : '').catch(() => {})
  }
  const typedNumber = typed.trim() === '' ? null : Number(typed)

  return (
    <Card className={cn(
      'grid grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_minmax(0,1.45fr)] items-center gap-3 rounded-[14px] p-3.5 shadow-none',
      'max-md:grid-cols-3 max-md:gap-2.5',
      chosen && 'border-emerald-500/60',
    )}>
      <div className="flex min-w-0 items-start gap-2 max-md:col-span-3">
        <div className="min-w-0 flex-1">
          <bdi className="block truncate font-head text-[16px] font-bold">{p.name}</bdi>
          {p.sku && <bdi className="block truncate text-[12.5px] text-muted-foreground">{p.sku}</bdi>}
        </div>
        <Button variant="ghost" size="icon-sm" aria-label={tr('editProduct')} className="text-muted-foreground max-md:size-10"
          onClick={() => openEditor({ kind: 'product', item: p })}>
          <PencilIcon />
        </Button>
      </div>
      <PriceCell label={tr('ourPrice')} sub={tr('ourStore')} value={p.ours} lowest={p.ours != null && p.ours === low}
        picked={chosen && p.final === p.ours} tone="bg-brand-900/70" onPick={() => choose(p.ours)} />
      <PriceCell label={tr('otherStore')} sub={p.storeName || tr('otherStore')} value={p.storePrice} lowest={p.storePrice != null && p.storePrice === low}
        picked={chosen && p.final === p.storePrice} tone="bg-zinc-800/70" onPick={() => choose(p.storePrice)} />
      <PriceCell label={tr('amazonPrice')} sub="amazon.sa" value={p.amazon} lowest={p.amazon != null && p.amazon === low}
        picked={chosen && p.final === p.amazon} tone="bg-sun-900/60" onPick={() => choose(p.amazon)} />
      <form className="flex min-w-0 flex-col gap-1 max-md:col-span-3"
        onSubmit={(e) => { e.preventDefault(); if (typedNumber != null && typedNumber >= 0) choose(typedNumber) }}>
        <div className="flex gap-1.5">
          <div dir="ltr" className="relative min-w-0 flex-1">
            <Input type="number" inputMode="decimal" min={0} step="0.01" dir="ltr" value={typed} aria-label={tr('chosenPrice')}
              readOnly={chosen} onChange={(e) => setTyped(e.target.value)}
              className={cn('h-10 bg-zinc-900 pr-11 font-head font-bold max-md:h-11', chosen && 'text-emerald-400')} />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">{tr('sar')}</span>
          </div>
          {chosen
            ? <Button type="button" variant="outline" className="h-10 max-md:h-11" onClick={() => choose(null)}><Undo2Icon />{tr('change')}</Button>
            : <Button type="submit" className="h-10 max-md:h-11" disabled={typedNumber == null || typedNumber < 0}><CheckIcon />{tr('choose')}</Button>}
        </div>
        {chosen
          ? <span className="text-[12.5px] text-emerald-400">✓ {tr('chosenPrice')}: {money(p.final)}</span>
          : <Compare product={p} value={typedNumber} />}
      </form>
    </Card>
  )
}

const filterSelect = 'h-10 data-[size=default]:h-10 w-auto min-w-44 bg-zinc-900 max-md:h-11 max-md:data-[size=default]:h-11 max-md:min-w-0 max-md:flex-1'

export function PricesView() {
  const { tr, data, openEditor } = useWorkspace()
  const [q, setQ] = React.useState('')
  const [show, setShow] = React.useState('all')
  const products = data.products
  const dearer = (p: Product) => { const r = cheapestRival(p); return p.ours != null && r != null && p.ours > r }
  const cheapest = (p: Product) => { const r = cheapestRival(p); return p.ours != null && (r == null || p.ours <= r) }

  const needle = q.trim().toLowerCase()
  const list = products.filter((p) =>
    (!needle || (p.name + ' ' + p.sku + ' ' + p.storeName).toLowerCase().includes(needle)) &&
    (show === 'all' || (show === 'todo' ? p.final == null : show === 'done' ? p.final != null : dearer(p))),
  ).sort((a, b) => Number(a.final != null) - Number(b.final != null) || a.name.localeCompare(b.name))

  const stats: [string, number, string][] = [
    [tr('pricesTotal'), products.length, ''],
    [tr('pricesCheaper'), products.filter(cheapest).length, 'text-emerald-400'],
    [tr('pricesDearer'), products.filter(dearer).length, 'text-alert-400'],
    [tr('pricesChosen'), products.filter((p) => p.final != null).length, ''],
  ]
  const newProduct = () => openEditor({ kind: 'product', item: {} })

  return (
    <>
      <PageHead title={tr('prices')} eyebrow={<span className="rounded-full bg-brand-900 px-2.5 py-1 text-[12.5px] font-medium text-brand-200">🇸🇦 {tr('saudiOnly')}</span>}>
        <Button className="h-10 px-4 text-[14.5px] max-md:h-11" onClick={newProduct}><PlusIcon />{tr('newProduct')}</Button>
      </PageHead>

      {!products.length ? <Empty big>{tr('noProducts')}</Empty> : (
        <>
          <div className="mb-4 grid grid-cols-4 gap-2.5 max-md:grid-cols-2">
            {stats.map(([label, n, tone]) => (
              <Card key={label} className="gap-0.5 rounded-[14px] px-4 py-3 shadow-none">
                <b className={cn('font-head text-2xl', tone)}>{n}</b>
                <span className="text-[13px] text-muted-foreground">{label}</span>
              </Card>
            ))}
          </div>

          <div className="mb-[18px] flex flex-wrap gap-2 md:gap-2.5">
            <div className="relative flex-[1_1_240px] max-md:basis-full">
              <SearchIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
              <Input type="search" dir="auto" value={q} placeholder={tr('search')} aria-label={tr('search')} onChange={(e) => setQ(e.target.value)}
                className="h-10 bg-zinc-900 ps-9 max-md:h-11" />
            </div>
            <Select value={show} onValueChange={setShow}>
              <SelectTrigger aria-label={tr('status')} className={filterSelect}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr('all')}</SelectItem>
                <SelectItem value="todo">{tr('pricesTodo')}</SelectItem>
                <SelectItem value="dearer">{tr('pricesDearer')}</SelectItem>
                <SelectItem value="done">{tr('pricesDone')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-2 grid grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_minmax(0,1.45fr)] gap-3 px-3.5 text-[13px] font-medium text-muted-foreground max-md:hidden">
            <span>{tr('product')}</span>
            <span className="text-center">{tr('ourPrice')}</span>
            <span className="text-center">{tr('otherStore')}</span>
            <span className="text-center">{tr('amazonPrice')}</span>
            <span>{tr('chosenPrice')}</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {list.map((p) => <ProductRow key={p.id} product={p} />)}
            {!list.length && <Empty>{tr('noProductsMatch')}</Empty>}
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">{tr('tapToChoose')}</p>
        </>
      )}
    </>
  )
}
