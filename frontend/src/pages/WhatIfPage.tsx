import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useCurrency } from '../lib/currency'
import { formatMoney } from '../lib/format'
import { Skeleton } from '../components/Skeleton'
import type { Forecast, Goal, SavingsRate } from '../lib/types'

export function WhatIfPage() {
  const currency = useCurrency()
  const [breakdown, setBreakdown] = useState<Record<string, number> | null>(null)
  const [savingsRates, setSavingsRates] = useState<SavingsRate[] | null>(null)
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [adjustments, setAdjustments] = useState<Record<string, number>>({})
  const [commentary, setCommentary] = useState<string | null>(null)
  const [commentaryLoading, setCommentaryLoading] = useState(false)

  useEffect(() => {
    api.get('/analysis/savings-rate').then((res) => setSavingsRates(res.data))
    api.get('/forecasts/latest').then((res) => setForecast(res.data))
    api.get('/goals').then((res) => setGoals(res.data))
  }, [])

  const latestMonth = savingsRates?.length ? savingsRates[savingsRates.length - 1].month : null
  const latestIncome = savingsRates?.length ? savingsRates[savingsRates.length - 1].income_minor : 0

  // Scoped to the same month as latestIncome — comparing one month's income
  // against all-time category totals would produce a nonsense savings rate.
  useEffect(() => {
    if (!latestMonth) return
    api.get('/analysis/category-breakdown', { params: { month: latestMonth } }).then((res) => setBreakdown(res.data))
  }, [latestMonth])

  const baselineTotal = useMemo(() => (breakdown ? Object.values(breakdown).reduce((a, b) => a + b, 0) : 0), [breakdown])

  const revisedTotal = useMemo(() => {
    if (!breakdown) return 0
    return Object.entries(breakdown).reduce((sum, [category, amount]) => {
      const pct = adjustments[category] ?? 0
      return sum + amount * (1 + pct / 100)
    }, 0)
  }, [breakdown, adjustments])

  const baselineNet = latestIncome - baselineTotal
  const revisedNet = latestIncome - revisedTotal
  const baselineSavingsRate = latestIncome > 0 ? (baselineNet / latestIncome) * 100 : 0
  const revisedSavingsRate = latestIncome > 0 ? (revisedNet / latestIncome) * 100 : 0

  const primaryGoal = goals[0]
  const monthsToGoalDelta = useMemo(() => {
    if (!primaryGoal || revisedNet <= 0 || baselineNet <= 0) return null
    const remaining = primaryGoal.target_amount_minor - primaryGoal.saved_amount_minor
    const baselineMonths = remaining / baselineNet
    const revisedMonths = remaining / revisedNet
    return baselineMonths - revisedMonths // positive = goal reached sooner
  }, [primaryGoal, baselineNet, revisedNet])

  function setAdjustment(category: string, pct: number) {
    setAdjustments((a) => ({ ...a, [category]: pct }))
  }

  async function handleAiCommentary() {
    setCommentaryLoading(true)
    setCommentary(null)
    try {
      const res = await api.post('/ai/whatif-commentary', {
        adjustments,
        revised_total: revisedTotal / 100,
        baseline_total: baselineTotal / 100,
        revised_savings_rate_pct: Math.round(revisedSavingsRate * 10) / 10,
      })
      setCommentary(res.data.summary)
    } finally {
      setCommentaryLoading(false)
    }
  }

  if (!breakdown) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-semibold">What-if simulator</h1>
      <p className="text-sm text-[var(--text-secondary)]">
        Adjust spend per category and see the projected effect update instantly — nothing here is saved until you act on it.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-lifted space-y-5 p-6">
          {Object.entries(breakdown).map(([category, amount]) => {
            const pct = adjustments[category] ?? 0
            return (
              <div key={category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category}</span>
                  <span className="tabular-nums text-[var(--text-secondary)]">
                    {formatMoney(amount, currency)} <span className={pct < 0 ? 'text-[var(--accent)]' : pct > 0 ? 'text-[var(--red)]' : ''}>({pct > 0 ? '+' : ''}{pct}%)</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={5}
                  value={pct}
                  onChange={(e) => setAdjustment(category, Number(e.target.value))}
                  className="mt-2 w-full accent-[var(--accent)]"
                />
              </div>
            )
          })}
        </div>

        <div className="space-y-4">
          <div className="card-lifted p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Revised monthly spend</p>
            <p className="font-display mt-1 text-2xl font-semibold tabular-nums">{formatMoney(revisedTotal, currency)}</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              vs {formatMoney(baselineTotal, currency)} baseline ({revisedTotal <= baselineTotal ? '−' : '+'}
              {formatMoney(Math.abs(revisedTotal - baselineTotal), currency)})
            </p>
          </div>

          <div className="card-lifted p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">Revised savings rate</p>
            <p className="font-display mt-1 text-2xl font-semibold tabular-nums">{revisedSavingsRate.toFixed(1)}%</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">vs {baselineSavingsRate.toFixed(1)}% baseline</p>
          </div>

          {forecast && (
            <div className="card-lifted p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">vs next month's forecast</p>
              <p className="font-display mt-1 text-2xl font-semibold tabular-nums">
                {formatMoney(revisedTotal - forecast.predicted_total_minor, currency)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">difference from the baseline Prophet forecast</p>
            </div>
          )}

          {primaryGoal && (
            <div className="card-lifted p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-tertiary)]">"{primaryGoal.name}" months-to-goal</p>
              <p className="font-display mt-1 text-2xl font-semibold tabular-nums">
                {monthsToGoalDelta === null ? '—' : `${monthsToGoalDelta >= 0 ? '−' : '+'}${Math.abs(monthsToGoalDelta).toFixed(1)} months`}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{monthsToGoalDelta !== null && monthsToGoalDelta >= 0 ? 'sooner' : 'later'} at this scenario's savings rate</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, var(--surface-tint), var(--surface))', boxShadow: 'var(--shadow-md)', border: '1px solid #e9e5ff' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">AI commentary on this scenario</h2>
          <button onClick={handleAiCommentary} disabled={commentaryLoading} className="text-xs font-medium text-[#4338CA] hover:underline disabled:opacity-50">
            {commentaryLoading ? 'Thinking…' : 'Ask FinPilot'}
          </button>
        </div>
        {commentary && <p className="mt-3 text-sm text-[var(--text-primary)]">{commentary}</p>}
        {!commentary && !commentaryLoading && <p className="mt-3 text-sm text-[var(--text-tertiary)]">Adjust the sliders, then ask for AI commentary on this specific scenario.</p>}
      </div>
    </div>
  )
}
