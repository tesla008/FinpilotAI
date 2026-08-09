import { Link } from 'react-router-dom'
import { HeroBrand } from '../components/HeroBrand'
import { BrandMark } from '../components/BrandMark'
import { useCurrency } from '../lib/currency'
import { formatMoney } from '../lib/format'
import { categoryPillColors } from '../lib/categoryColors'
import {
  featureBands,
  heroAiTip,
  heroNavItems,
  heroPreview,
  heroStatChips,
  heroTransactions,
  savingsGoalPct,
  type FeatureBand,
} from '../mockdata/landing'
import './LandingPage.css'

const NAV_LINKS = ['Product', 'Security', 'Pricing']

export function LandingPage() {
  const currency = useCurrency()

  return (
    <div className="font-body text-body">
      {/* NAV — logo · links · CTA, left to right */}
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-5 sm:px-12 sm:py-7">
        <Link to="/">
          <BrandMark size={20} />
        </Link>
        <div className="hidden gap-9 text-[14.5px] text-secondary sm:flex">
          {NAV_LINKS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <Link
          to="/import"
          className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:px-5 sm:py-2.5"
        >
          Get started
        </Link>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-16 sm:px-12">
        <div className="hero-mesh pointer-events-none absolute inset-0 z-0" />
        <div className="relative z-10 mx-auto max-w-[900px] text-center">
          <HeroBrand />
          <h1 className="font-heading text-[40px] font-bold tracking-tight text-heading sm:text-display">
            See your financial
            <br />
            future before it arrives.
          </h1>
          <p className="mx-auto mt-6 max-w-[520px] text-body-lg text-secondary">
            FinPilot analyzes your spending, forecasts what's ahead, and tells you exactly what to do about it.
          </p>
          <Link
            to="/import"
            className="mt-9 inline-block rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-[0_12px_28px_-10px_rgba(67,56,202,0.5)] transition hover:brightness-110"
          >
            Upload a statement
          </Link>
        </div>

        {/* FLOATING DASHBOARD PREVIEW — a poster of the app, not a functional
            copy, so internal type sizes are deliberately smaller than the
            real design-system scale to stay legible at this scale. */}
        <div className="relative z-10 mx-auto mt-16 max-w-[760px]" style={{ perspective: 1800 }}>
          <div
            className="relative overflow-hidden rounded-xl bg-card"
            style={{
              transform: 'rotateX(7deg) rotateY(-9deg) rotateZ(1deg)',
              boxShadow: '0 60px 100px -40px rgba(30,30,45,0.35), 0 20px 40px -20px rgba(30,30,45,0.15)',
            }}
          >
            <div className="flex h-[38px] items-center gap-1.5 border-b border-hairline bg-hairline px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
            </div>

            <div className="flex">
              {/* NAV STRIP */}
              <div className="w-[92px] flex-none border-r border-hairline px-2.5 py-5">
                <BrandMark size={14} className="mb-5 px-1" iconOnly />
                <div className="flex flex-col gap-1">
                  {heroNavItems.map((item, i) => (
                    <div
                      key={item}
                      className={`rounded-[6px] px-2 py-1.5 text-[9px] font-medium ${
                        i === 0 ? 'bg-primary text-white' : 'text-secondary'
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* MAIN */}
              <div className="relative flex-1 px-6 py-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-1 text-[11px] text-muted">Total balance</div>
                    <div className="font-heading text-h3 font-bold tracking-tight text-heading tabular-nums">
                      {formatMoney(heroPreview.totalBalanceMinor, currency)}
                    </div>
                    <div className="mt-0.5 text-[10.5px] font-semibold text-positive">
                      +{heroPreview.balanceDeltaPct}% this month
                    </div>
                  </div>
                  <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-semibold text-primary">
                    AI Insight
                  </span>
                </div>

                {/* STAT CHIPS */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {heroStatChips.map((chip) => (
                    <div key={chip.label} className="rounded-md bg-canvas px-2.5 py-2">
                      <div className="text-[9px] text-muted">{chip.label}</div>
                      <div className="mt-0.5 font-heading text-[12px] font-bold text-heading tabular-nums">
                        {chip.display ?? formatMoney(chip.valueMinor!, currency)}
                      </div>
                    </div>
                  ))}
                </div>

                <HeroChart />

                {/* TRANSACTION LIST */}
                <div className="mt-4 flex flex-col gap-1.5">
                  {heroTransactions.map((tx) => {
                    const pill = categoryPillColors(tx.category)
                    return (
                      <div key={tx.merchant} className="flex items-center justify-between rounded-md py-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-[11px] font-medium text-body">{tx.merchant}</span>
                          <span
                            className="flex-none rounded-full px-2 py-0.5 text-[9px] font-semibold"
                            style={{ background: pill.bg, color: pill.ink }}
                          >
                            {tx.category}
                          </span>
                          {tx.unusual && (
                            <span className="flex-none rounded-full bg-overspend-soft px-2 py-0.5 text-[9px] font-semibold text-overspend-ink">
                              Unusual
                            </span>
                          )}
                        </div>
                        <span
                          className="flex-none text-[11px] font-semibold tabular-nums"
                          style={{ color: tx.amountMinor > 0 ? 'var(--color-positive)' : 'var(--color-heading)' }}
                        >
                          {formatMoney(tx.amountMinor, currency)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* AI RECOMMENDATION CARD */}
                <div
                  className="absolute -right-3 -bottom-4 w-[200px] rounded-[13px] p-px shadow-[0_20px_40px_-18px_rgba(30,30,40,0.35)]"
                  style={{ background: 'linear-gradient(135deg, var(--color-cyan), var(--color-primary))' }}
                >
                  <div className="rounded-[12px] bg-card px-3.5 py-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span
                        className="h-3 w-3 rounded-[3px]"
                        style={{ background: 'linear-gradient(135deg, var(--color-cyan), var(--color-primary))' }}
                      />
                      <span className="text-[8.5px] font-semibold tracking-wide text-primary uppercase">
                        FinPilot suggests
                      </span>
                    </div>
                    <p className="text-[10.5px] leading-snug text-body">{heroAiTip}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE BANDS */}
      <section className="mx-auto mt-24 max-w-[1320px] px-6 sm:mt-[140px] sm:px-12">
        {featureBands.map((band) => (
          <FeatureRow key={band.eyebrow} band={band} />
        ))}
      </section>

      {/* FOOTER */}
      <footer className="mx-auto flex max-w-[1320px] flex-col items-center gap-4 px-6 pt-12 pb-14 text-center sm:flex-row sm:justify-between sm:px-12 sm:text-left">
        <div className="opacity-85">
          <BrandMark size={18} />
        </div>
        <div className="flex gap-7 text-[13.5px] text-muted">
          <span>Product</span>
          <span>Security</span>
          <span>Contact</span>
        </div>
        <div className="text-[13px] text-muted">© 2026 FinPilot AI</div>
      </footer>
    </div>
  )
}

function FeatureRow({ band }: { band: FeatureBand }) {
  return (
    <div className="grid grid-cols-1 items-center gap-16 border-t border-hairline py-20 last:border-b md:grid-cols-2">
      <div className={band.reverse ? 'md:order-2' : ''}>
        <div className="mb-3.5 text-caption font-semibold tracking-[0.08em] text-primary uppercase">
          {band.eyebrow}
        </div>
        <h3 className="font-heading text-h2 font-bold tracking-tight text-heading">{band.title}</h3>
        <p className="mt-3.5 max-w-[420px] text-base leading-relaxed text-secondary">{band.body}</p>
      </div>
      <div className={`card-lifted p-7 ${band.reverse ? 'md:order-1' : ''}`}>
        <FeatureIllustration kind={band.illustration} />
      </div>
    </div>
  )
}

function HeroChart() {
  const todayX = 380

  return (
    <svg viewBox="0 0 600 110" width="100%" height="100" style={{ overflow: 'visible', display: 'block' }}>
      <line x1="0" y1="20" x2="600" y2="20" stroke="var(--color-hairline)" strokeWidth="1" />
      <line x1="0" y1="55" x2="600" y2="55" stroke="var(--color-hairline)" strokeWidth="1" />
      <line x1="0" y1="90" x2="600" y2="90" stroke="var(--color-hairline)" strokeWidth="1" />

      <line x1={todayX} y1="0" x2={todayX} y2="95" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="3,3" />
      <text x={todayX + 5} y="12" fontSize="9" fill="var(--color-muted)" fontFamily="var(--font-body)">
        Today
      </text>

      {/* actual spend, area-filled up to today */}
      <path
        d={`M0,85 C40,78 80,82 120,65 C160,50 200,58 240,42 C280,32 320,45 ${todayX},30 L${todayX},95 L0,95 Z`}
        fill="var(--color-primary)"
        opacity="0.08"
      />
      <path
        d={`M0,85 C40,78 80,82 120,65 C160,50 200,58 240,42 C280,32 320,45 ${todayX},30`}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx={todayX} cy="30" r="4" fill="var(--color-primary)" />

      {/* forecast continuation, dashed */}
      <path
        d={`M${todayX},30 C420,26 460,18 500,15 C530,13 565,16 600,8`}
        fill="none"
        stroke="var(--color-cyan)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2,7"
      />
    </svg>
  )
}

function FeatureIllustration({ kind }: { kind: FeatureBand['illustration'] }) {
  if (kind === 'analyze') {
    const bars = [
      { x: 10, y: 60, h: 50, color: 'var(--color-primary)' },
      { x: 55, y: 30, h: 80, color: 'var(--color-primary)' },
      { x: 100, y: 75, h: 35, color: 'var(--color-cyan)' },
      { x: 145, y: 45, h: 65, color: 'var(--color-primary)' },
      { x: 190, y: 85, h: 25, color: 'var(--color-cyan)' },
      { x: 235, y: 20, h: 90, color: 'var(--color-positive)' },
    ]
    return (
      <>
        <div className="mb-4 text-[12.5px] text-muted">Spending by category</div>
        <svg viewBox="0 0 300 120" width="100%" height="120">
          {bars.map((b) => (
            <rect key={b.x} x={b.x} y={b.y} width="28" height={b.h} rx="4" fill={b.color} />
          ))}
        </svg>
      </>
    )
  }

  if (kind === 'forecast') {
    return (
      <>
        <div className="mb-4 text-[12.5px] text-muted">Balance forecast · next 60 days</div>
        <svg viewBox="0 0 300 120" width="100%" height="120">
          <line x1="180" y1="0" x2="180" y2="120" stroke="var(--color-hairline)" strokeWidth="1" strokeDasharray="3,3" />
          <path
            d="M0,90 C40,80 80,85 120,65 C150,52 165,48 180,44"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M180,44 C210,36 240,42 270,25 C280,20 290,16 300,10"
            fill="none"
            stroke="var(--color-cyan)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1,7"
          />
          <circle cx="180" cy="44" r="4.5" fill="var(--color-primary)" />
        </svg>
      </>
    )
  }

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" width="110" height="110">
        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--color-hairline)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(savingsGoalPct / 100) * 301.6} 301.6`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div>
        <div className="mb-1.5 text-[12.5px] text-muted">Savings goal on track</div>
        <div className="font-heading text-h3 font-bold text-heading tabular-nums">{savingsGoalPct}%</div>
      </div>
    </div>
  )
}
