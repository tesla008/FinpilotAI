import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { useCurrency } from '../lib/currency'
import { formatMoney } from '../lib/format'
import { StatTile } from '../components/StatTile'
import { TrendChart } from '../components/TrendChart'
import { CategoryBreakdown } from '../components/CategoryBreakdown'
import { AIPanel, fetchRecommendations } from '../components/AIPanel'
import type { BudgetAdherence, Forecast, Recommendations } from '../lib/types'

export function DashboardPage() {
  const currency = useCurrency()
  const [balance, setBalance] = useState<number | null>(null)
  const [monthlyTotals, setMonthlyTotals] = useState<Record<string, number> | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<string, number> | null>(null)
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [adherence, setAdherence] = useState<BudgetAdherence[] | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null)
  const [aiLoading, setAiLoading] = useState(true)

  useEffect(() => {
    api.get('/analysis/balance').then((res) => setBalance(res.data.balance_minor))
    api.get('/analysis/monthly-totals').then((res) => setMonthlyTotals(res.data))
    api.get('/forecasts/latest').then((res) => setForecast(res.data))
    api.get('/analysis/budget-adherence').then((res) => setAdherence(res.data))
    fetchRecommendations()
      .then(setRecommendations)
      .finally(() => setAiLoading(false))
  }, [])

  const months = monthlyTotals ? Object.keys(monthlyTotals).sort() : []
  const latestMonth = months[months.length - 1]
  const thisMonthSpend = latestMonth ? monthlyTotals![latestMonth] : null

  // Category breakdown depends on knowing the latest month first, so it's
  // fetched once monthlyTotals resolves rather than in the initial batch.
  useEffect(() => {
    if (!latestMonth) return
    api.get('/analysis/category-breakdown', { params: { month: latestMonth } }).then((res) => setCategoryBreakdown(res.data))
  }, [latestMonth])

  const overBudget = adherence?.filter((b) => b.is_over) ?? []

  async function handleAiRefresh() {
    setAiLoading(true)
    try {
      const data = await fetchRecommendations(true)
      setRecommendations(data)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="All-time balance" value={balance} formatter={(n) => formatMoney(n, currency)} tone="accent" />
        <StatTile label="This month's spend" value={thisMonthSpend} formatter={(n) => formatMoney(n, currency)} />
        <StatTile
          label="Next month forecast"
          value={forecast?.predicted_total_minor ?? null}
          formatter={(n) => formatMoney(n, currency)}
          delta={
            forecast && thisMonthSpend
              ? { pct: ((forecast.predicted_total_minor - thisMonthSpend) / thisMonthSpend) * 100, label: 'vs this month' }
              : null
          }
        />
      </div>

      {overBudget.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[var(--red)]/20 bg-[var(--red-soft)] px-4 py-3 text-sm text-[var(--red)]"
        >
          Over budget in {overBudget.map((b) => b.category).join(', ')} this month.
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-lifted p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">Spending trend</h2>
            {forecast?.is_low_confidence && (
              <span className="rounded-full bg-[var(--amber-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--amber)]">
                Low-confidence forecast
              </span>
            )}
          </div>
          <TrendChart monthlyTotals={monthlyTotals} forecast={forecast} currency={currency} />
        </div>

        <div className="card-lifted p-6">
          <h2 className="font-display mb-4 text-base font-semibold">By category</h2>
          <CategoryBreakdown data={categoryBreakdown} currency={currency} />
        </div>
      </div>

      <AIPanel data={recommendations} isLoading={aiLoading} onRefresh={handleAiRefresh} />
    </div>
  )
}
