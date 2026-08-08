import { motion } from 'framer-motion'
import { formatMoney } from '../lib/format'
import { Skeleton } from './Skeleton'

const CHART_COLORS = ['#047857', '#4338CA', '#0891B2', '#B45309', '#7C3AED', '#BE185D', '#65A30D', '#475569']

interface CategoryBreakdownProps {
  data: Record<string, number> | null
  currency: string
}

export function CategoryBreakdown({ data, currency }: CategoryBreakdownProps) {
  if (!data) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    )
  }

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const max = entries.length ? entries[0][1] : 1

  if (entries.length === 0) {
    return <p className="text-sm text-[var(--text-tertiary)]">No spend recorded yet.</p>
  }

  return (
    <div className="space-y-3">
      {entries.map(([category, amount], i) => (
        <div key={category}>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-medium text-[var(--text-primary)]">{category}</span>
            <span className="tabular-nums text-[var(--text-secondary)]">{formatMoney(amount, currency)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              initial={{ width: 0 }}
              animate={{ width: `${(amount / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
