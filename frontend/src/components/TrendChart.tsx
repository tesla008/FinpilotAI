import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMonth, formatMoney } from '../lib/format'
import { Skeleton } from './Skeleton'
import type { Forecast } from '../lib/types'

interface TrendChartProps {
  monthlyTotals: Record<string, number> | null
  forecast: Forecast | null
  currency: string
}

export function TrendChart({ monthlyTotals, forecast, currency }: TrendChartProps) {
  if (!monthlyTotals) {
    return <Skeleton className="h-72 w-full" />
  }

  const months = Object.keys(monthlyTotals).sort()
  const data = months.map((m) => ({
    month: formatMonth(m),
    actual: monthlyTotals[m] / 100,
    band: undefined as [number, number] | undefined,
  }))

  if (forecast) {
    data.push({
      month: formatMonth(forecast.horizon_month.slice(0, 7)),
      actual: undefined as unknown as number,
      band: [forecast.confidence_low_minor / 100, forecast.confidence_high_minor / 100],
    })
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eceef1" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8a93a0' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: '#8a93a0' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatMoney(v * 100, currency)}
          width={70}
        />
        <Tooltip
          formatter={(value) => formatMoney(Number(value ?? 0) * 100, currency)}
          contentStyle={{ borderRadius: 12, border: '1px solid #eceef1', boxShadow: '0 8px 24px rgba(16,24,40,0.08)' }}
        />
        <Area
          dataKey="band"
          stroke="none"
          fill="#047857"
          fillOpacity={0.12}
          isAnimationActive
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#047857"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#047857' }}
          activeDot={{ r: 5 }}
          isAnimationActive
          animationDuration={700}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
