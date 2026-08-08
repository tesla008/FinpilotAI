import { motion } from 'framer-motion'
import { CountUp } from './CountUp'
import { Skeleton } from './Skeleton'

interface StatTileProps {
  label: string
  value: number | null
  formatter: (n: number) => string
  delta?: { pct: number; label: string } | null
  tone?: 'default' | 'accent'
}

export function StatTile({ label, value, formatter, delta, tone = 'default' }: StatTileProps) {
  const isLoading = value === null

  return (
    <motion.div
      className="card p-5"
      whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(16,24,40,0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-9 w-32" />
      ) : (
        <p className={`font-display mt-1 text-3xl font-semibold ${tone === 'accent' ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
          <CountUp value={value} formatter={formatter} />
        </p>
      )}
      {delta && !isLoading && (
        <p
          className={`mt-2 text-sm font-medium ${
            delta.pct >= 0 ? 'text-[var(--accent)]' : 'text-[var(--red)]'
          }`}
        >
          {delta.pct >= 0 ? '↑' : '↓'} {Math.abs(delta.pct).toFixed(1)}% {delta.label}
        </p>
      )}
    </motion.div>
  )
}
