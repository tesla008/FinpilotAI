import { useCurrency } from '../lib/currency'
import { formatMoney } from '../lib/format'
import {
  categoryForecasts,
  forecastDrivers,
  forecastHistory,
  forecastPredicted,
  predictedTotalNext3MonthsMinor,
} from '../data/mockData'

const CHART_WIDTH = 700
const CHART_HEIGHT = 280
const PLOT_TOP = 20
const PLOT_BOTTOM = 245

function buildForecastGeometry() {
  const historyPoints = forecastHistory.map((m) => m.totalMinor)
  const predictedPoints = forecastPredicted.map((m) => m.predictedMinor)
  const highPoints = forecastPredicted.map((m) => m.highMinor)
  const lowPoints = forecastPredicted.map((m) => m.lowMinor)
  const all = [...historyPoints, ...predictedPoints, ...highPoints, ...lowPoints]
  const min = Math.min(...all) * 0.92
  const max = Math.max(...all) * 1.05
  const range = max - min || 1

  const totalPoints = forecastHistory.length + forecastPredicted.length
  const stepX = CHART_WIDTH / (totalPoints - 1)
  const toY = (v: number) => PLOT_BOTTOM - ((v - min) / range) * (PLOT_BOTTOM - PLOT_TOP)
  const toX = (i: number) => i * stepX

  const historyXY = historyPoints.map((v, i) => [toX(i), toY(v)] as const)
  const todayIndex = forecastHistory.length - 1
  const predictedXY = predictedPoints.map((v, i) => [toX(todayIndex + 1 + i), toY(v)] as const)
  const highXY = highPoints.map((v, i) => [toX(todayIndex + 1 + i), toY(v)] as const)
  const lowXY = lowPoints.map((v, i) => [toX(todayIndex + 1 + i), toY(v)] as const)

  const line = (pts: readonly (readonly [number, number])[]) =>
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

  const historyPath = line(historyXY)
  const predictedPath = line([historyXY[historyXY.length - 1], ...predictedXY])

  const bandTop = [historyXY[historyXY.length - 1], ...highXY]
  const bandBottom = [historyXY[historyXY.length - 1], ...lowXY].reverse()
  const bandPath = `${line(bandTop)} L${line(bandBottom).slice(1)} Z`

  return { historyPath, predictedPath, bandPath, todayX: toX(todayIndex), todayY: historyXY[historyXY.length - 1][1] }
}

export function ForecastPage() {
  const currency = useCurrency()
  const geometry = buildForecastGeometry()
  const months = [...forecastHistory.map((m) => m.month.slice(0, 3)), ...forecastPredicted.map((m) => m.month.slice(0, 3))]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-h2 font-bold text-heading">Forecast</h1>
        <p className="mt-1.5 text-sm text-muted">Projected spending over the next three months</p>
      </div>

      <div className="mb-11 grid grid-cols-1 items-start gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="card-lifted p-8">
          <div className="mb-6 flex items-baseline justify-between">
            <div>
              <div className="mb-1.5 text-[12.5px] text-muted">Predicted total spend, next 3 months</div>
              <div className="font-heading text-h2 font-bold tracking-tight text-heading tabular-nums">
                {formatMoney(predictedTotalNext3MonthsMinor, currency)}
              </div>
            </div>
            <div className="flex gap-4">
              <Legend swatch="dot" color="var(--color-primary)" label="History" />
              <Legend swatch="dot" color="var(--color-cyan)" label="Predicted" />
              <Legend swatch="bar" color="color-mix(in srgb, var(--color-cyan) 20%, transparent)" label="Confidence range" />
            </div>
          </div>

          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} width="100%" height="280" style={{ overflow: 'visible' }}>
            <line x1="0" y1="30" x2={CHART_WIDTH} y2="30" stroke="var(--color-hairline)" strokeWidth="1" />
            <line x1="0" y1="95" x2={CHART_WIDTH} y2="95" stroke="var(--color-hairline)" strokeWidth="1" />
            <line x1="0" y1="160" x2={CHART_WIDTH} y2="160" stroke="var(--color-hairline)" strokeWidth="1" />
            <line x1="0" y1="225" x2={CHART_WIDTH} y2="225" stroke="var(--color-hairline)" strokeWidth="1" />
            <line
              x1={geometry.todayX}
              y1="0"
              x2={geometry.todayX}
              y2={PLOT_BOTTOM}
              stroke="var(--color-border)"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            <text x={geometry.todayX + 6} y="16" fontSize="11" fill="var(--color-muted)">
              Today
            </text>

            <path d={geometry.bandPath} fill="var(--color-cyan)" opacity="0.18" />
            <path d={geometry.historyPath} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
            <path d={geometry.predictedPath} fill="none" stroke="var(--color-cyan)" strokeWidth="3" strokeLinecap="round" />
            <circle cx={geometry.todayX} cy={geometry.todayY} r="5" fill="var(--color-primary)" />
          </svg>
          <div className="mt-2 flex justify-between px-1 text-xs text-muted">
            {months.map((m, i) => (
              <span key={`${m}-${i}`}>{m}</span>
            ))}
          </div>
        </div>

        <div className="card-lifted p-7">
          <div className="font-heading mb-1.5 text-[17px] font-semibold text-heading">By category</div>
          <div className="mb-4.5 text-[12.5px] text-muted">Direction over next 3 months</div>
          <div className="flex flex-col gap-4.5">
            {categoryForecasts.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div>
                  <div className="mb-0.5 text-[13.5px] font-medium text-body">{cat.category}</div>
                  <div className="text-xs font-semibold" style={{ color: directionColor(cat.direction) }}>
                    {cat.direction}
                  </div>
                </div>
                <svg viewBox="0 0 80 28" width="80" height="28">
                  <path d={cat.sparkline} fill="none" stroke={directionColor(cat.direction)} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="font-heading mb-1 text-[17px] font-semibold text-heading">What drove this forecast</div>
        <div className="text-[13.5px] text-muted">Plain-language reasoning behind the prediction</div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {forecastDrivers.map((d) => (
          <div key={d.tag} className="card p-6">
            <div className="mb-3 text-xs font-semibold tracking-[0.06em] text-primary uppercase">{d.tag}</div>
            <div className="font-heading mb-2.5 text-[16px] font-semibold text-heading">{d.title}</div>
            <div className="text-[13.5px] leading-relaxed text-secondary">{d.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function directionColor(direction: string): string {
  if (direction === 'Trending up') return 'var(--color-overspend)'
  if (direction === 'Slightly up') return 'var(--color-warning)'
  if (direction === 'Trending down') return 'var(--color-positive)'
  return 'var(--color-muted)'
}

function Legend({ swatch, color, label }: { swatch: 'dot' | 'bar'; color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted">
      <span
        className={swatch === 'dot' ? 'inline-block h-2 w-2 rounded-full' : 'inline-block h-2 w-2.5 rounded-[2px]'}
        style={{ background: color }}
      />
      {label}
    </span>
  )
}
