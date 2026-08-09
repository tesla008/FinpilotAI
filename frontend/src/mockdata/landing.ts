// Marketing copy + decorative preview figures for the landing page. Kept out
// of the JSX so a later pass can swap the preview numbers for a real
// snapshot from the API without touching layout code.

export const heroPreview = {
  totalBalanceMinor: 4_821_000, // matches the design reference's $48,210 preview figure
  balanceDeltaPct: 2.4,
}

export const heroNavItems = ['Dashboard', 'Import', 'Forecast', 'Advice', 'What-if']

export interface HeroStatChip {
  label: string
  valueMinor?: number
  display?: string
}

export const heroStatChips: HeroStatChip[] = [
  { label: 'Spent this month', valueMinor: 341_200 },
  { label: 'Projected month-end', valueMinor: 489_000 },
  { label: 'Savings rate', display: '22%' },
]

export interface HeroTransaction {
  merchant: string
  category: string
  amountMinor: number
  unusual?: boolean
}

export const heroTransactions: HeroTransaction[] = [
  { merchant: 'Whole Foods Market', category: 'Groceries', amountMinor: -8640 },
  { merchant: 'Delta Air Lines', category: 'Travel', amountMinor: -61200, unusual: true },
  { merchant: 'Paycheck deposit', category: 'Income', amountMinor: 320000 },
]

export const heroAiTip = 'Move ₹3,000 to savings this week — your cash flow forecast shows a surplus through October.'

export interface FeatureBand {
  eyebrow: string
  title: string
  body: string
  illustration: 'analyze' | 'forecast' | 'advise'
  reverse?: boolean
}

export const featureBands: FeatureBand[] = [
  {
    eyebrow: 'Analyze',
    title: 'Every transaction, understood.',
    body: 'FinPilot reads every transaction across your accounts and sorts it into categories automatically, no manual tagging required.',
    illustration: 'analyze',
  },
  {
    eyebrow: 'Forecast',
    title: "Know what's coming, not just what happened.",
    body: 'Bills, subscriptions, and spending patterns are projected forward, so you can see next month before it starts.',
    illustration: 'forecast',
    reverse: true,
  },
  {
    eyebrow: 'Advise',
    title: 'Advice you can act on, not just charts.',
    body: 'FinPilot turns the forecast into a specific next move: move money, trim a category, or adjust a budget.',
    illustration: 'advise',
  },
]

export const savingsGoalPct = 70
