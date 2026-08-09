// Single source of truth for realistic demo data across the Forecast,
// Advice, and What-If pages (none of which are backed by a seeded account
// yet). All money is in minor units (paise) — the same convention the real
// API uses — and every figure below is cross-referenced so a number quoted
// on one page matches the same number on another. Swap this module for
// real API calls later; nothing that imports it should need to change shape.

export const CURRENCY = 'INR'

// ---- Baseline household numbers (salaried, tier-2 city) ----

export const monthlyIncomeMinor = 58_000_00

export interface CategorySpend {
  name: string
  monthlyMinor: number
  merchants: string[]
}

// The five categories the What-If simulator lets a user adjust. Names match
// the real system's category list so this data can be swapped for the live
// /analysis/category-breakdown response without a reshape.
export const adjustableCategories: CategorySpend[] = [
  { name: 'Food', monthlyMinor: 7_800_00, merchants: ['Swiggy', 'Zomato', 'BigBasket', 'DMart'] },
  { name: 'Transport', monthlyMinor: 3_200_00, merchants: ['Indian Oil', 'Ola', 'Uber'] },
  { name: 'Shopping', monthlyMinor: 4_500_00, merchants: ['Amazon'] },
  { name: 'Entertainment', monthlyMinor: 1_800_00, merchants: ['Netflix', 'BookMyShow'] },
  { name: 'Health', monthlyMinor: 1_200_00, merchants: ['Apollo Pharmacy'] },
]

export interface FixedCost {
  name: string
  monthlyMinor: number
}

// Not adjustable in the simulator — rent, utilities, and a SIP debit behave
// like fixed outflows rather than discretionary spend.
export const fixedCosts: FixedCost[] = [
  { name: 'Rent', monthlyMinor: 14_000_00 },
  { name: 'Utilities', monthlyMinor: 2_200_00 }, // electricity board + Jio
  { name: 'SIP investment', monthlyMinor: 6_000_00 },
]

export const totalFixedCostsMinor = fixedCosts.reduce((sum, c) => sum + c.monthlyMinor, 0)
export const totalVariableSpendMinor = adjustableCategories.reduce((sum, c) => sum + c.monthlyMinor, 0)
export const totalMonthlySpendMinor = totalFixedCostsMinor + totalVariableSpendMinor
export const monthlyNetMinor = monthlyIncomeMinor - totalMonthlySpendMinor
export const savingsRatePct = Math.round((monthlyNetMinor / monthlyIncomeMinor) * 1000) / 10

export const currentSavedMinor = 1_85_000_00

export const goal = {
  name: 'Emergency fund',
  targetAmountMinor: 3_00_000_00,
  targetDate: '2027-02-15',
}

// ---- Forecast page ----

export interface MonthTotal {
  month: string // "Feb 2026"
  totalMinor: number
}

export const forecastHistory: MonthTotal[] = [
  { month: 'Feb 2026', totalMinor: 38_400_00 },
  { month: 'Mar 2026', totalMinor: 37_100_00 },
  { month: 'Apr 2026', totalMinor: 39_800_00 },
  { month: 'May 2026', totalMinor: 38_900_00 },
  { month: 'Jun 2026', totalMinor: 40_600_00 },
  { month: 'Jul 2026', totalMinor: totalMonthlySpendMinor }, // ties directly to the baseline above
]

export interface PredictedMonth {
  month: string
  predictedMinor: number
  lowMinor: number
  highMinor: number
}

export const forecastPredicted: PredictedMonth[] = [
  { month: 'Aug 2026', predictedMinor: 41_800_00, lowMinor: 39_200_00, highMinor: 44_600_00 },
  { month: 'Sep 2026', predictedMinor: 43_100_00, lowMinor: 39_800_00, highMinor: 46_900_00 },
  { month: 'Oct 2026', predictedMinor: 45_400_00, lowMinor: 41_000_00, highMinor: 50_200_00 }, // festival season bump
]

export const predictedTotalNext3MonthsMinor = forecastPredicted.reduce((s, m) => s + m.predictedMinor, 0)

export interface CategoryForecast {
  category: string
  direction: 'Trending up' | 'Flat' | 'Slightly up' | 'Trending down'
  sparkline: string // SVG path, viewBox 0 0 80 28
}

export const categoryForecasts: CategoryForecast[] = [
  { category: 'Food', direction: 'Trending up', sparkline: 'M0,20 C15,18 30,14 45,10 C55,7 65,5 80,3' },
  { category: 'Rent', direction: 'Flat', sparkline: 'M0,14 C20,15 40,13 60,14 C68,14 74,13 80,14' },
  { category: 'Shopping', direction: 'Slightly up', sparkline: 'M0,18 C20,16 40,15 60,11 C68,10 74,9 80,8' },
  { category: 'Entertainment', direction: 'Trending down', sparkline: 'M0,6 C20,9 40,14 60,17 C68,19 74,20 80,22' },
  { category: 'Transport', direction: 'Flat', sparkline: 'M0,13 C20,14 40,12 60,13 C68,13 74,14 80,13' },
]

export interface ForecastDriver {
  tag: string
  title: string
  body: string
}

export const forecastDrivers: ForecastDriver[] = [
  {
    tag: 'Trend',
    title: 'Food spend has climbed for three months straight',
    body: 'Swiggy and Zomato orders have pushed Food spend up each of the last three months, so the model extends that trend forward rather than assuming it levels off.',
  },
  {
    tag: 'Seasonality',
    title: 'October usually runs higher for Shopping',
    body: 'Festival-season Amazon spend in your history tends to rise in October. The forecast adds that seasonal bump on top of your recent trend for next month.',
  },
  {
    tag: 'Recent anomaly',
    title: 'One large Health expense is treated as one-off',
    body: 'A ₹9,500 dental treatment at Apollo Pharmacy was flagged as unusual and excluded from the baseline, so it does not inflate future months.',
  },
]

// ---- Advice page ----

export interface AdviceCard {
  id: string
  headline: string
  body: string
  figure: string
  figureLabel: string
}

export const budgetingAdvice: AdviceCard[] = [
  {
    id: 'b1',
    headline: 'Food is on track to overshoot a typical budget',
    body: `You've spent ₹7,800 on Food this month via Swiggy, Zomato, and BigBasket — up from a ₹6,900 average over the last three months.`,
    figure: '₹7,800',
    figureLabel: 'spent this month',
  },
  {
    id: 'b2',
    headline: 'Entertainment has slack this month',
    body: `You're at ₹1,800 on Entertainment against a typical ₹2,500 allowance — unused headroom you could redirect toward savings.`,
    figure: '₹700',
    figureLabel: 'unused headroom',
  },
]

export const savingAdvice: AdviceCard[] = [
  {
    id: 's1',
    headline: 'Move idle cash into a high-yield account',
    body: `Your checking balance has held a surplus for the past three weeks, earning close to nothing sitting idle.`,
    figure: '₹17,300',
    figureLabel: 'monthly surplus',
  },
  {
    id: 's2',
    headline: `You're under 7 months from your Emergency fund goal`,
    body: `At your current savings rate of ${savingsRatePct}%, you're on pace to reach your ₹3,00,000 target by mid-February.`,
    figure: '6.6 mo',
    figureLabel: 'to goal',
  },
]

export const investingAdvice: AdviceCard[] = [
  {
    id: 'i1',
    headline: 'Your SIP contribution is a healthy share of income',
    body: `You invest ₹6,000/month via SIP, about 10% of your ₹58,000 income — in line with common long-term savings guidance of 10–20% of income.`,
    figure: '10%',
    figureLabel: 'of income invested',
  },
  {
    id: 'i2',
    headline: 'Your surplus leaves room to revisit allocation',
    body: `With roughly ${savingsRatePct}% of income currently unallocated to fixed goals, this may be a good time to review how your existing investments are split across equity and debt — not a signal to buy or sell anything specific.`,
    figure: `${savingsRatePct}%`,
    figureLabel: 'flexible income',
  },
]
