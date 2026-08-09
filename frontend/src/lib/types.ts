export interface Category {
  id: string
  name: string
  is_system: boolean
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount_minor: number
  category_id: string | null
  category_name: string | null
  category_confirmed: boolean
  source: string
}

export interface Budget {
  id: string
  category_id: string
  category_name: string | null
  monthly_limit_minor: number
  period: string
}

export interface BudgetAdherence {
  category: string
  limit_minor: number
  spent_minor: number
  pct_used: number
  is_over: boolean
}

export interface Goal {
  id: string
  name: string
  target_amount_minor: number
  target_date: string
  saved_amount_minor: number
  progress_pct: number
  projected_completion_date: string | null
}

export interface CategoryTrend {
  category: string
  latest_month: string
  latest_spend_minor: number
  rolling_avg_minor: number
  pct_change: number | null
  direction: 'rising' | 'falling' | 'stable'
}

export interface TransactionAnomaly {
  date: string
  category: string
  amount_minor: number
  z_score: number
}

export interface CategoryMonthAnomaly {
  month: string
  category: string
  spend_minor: number
  z_score: number
}

export interface SavingsRate {
  month: string
  income_minor: number
  spend_minor: number
  net_minor: number
  savings_rate_pct: number
}

export interface CategoryForecastPiece {
  predicted_minor: number
  low_minor: number
  high_minor: number
  model_used: string
}

export interface Forecast {
  id: string
  generated_at: string
  horizon_month: string
  predicted_total_minor: number
  confidence_low_minor: number
  confidence_high_minor: number
  per_category_breakdown: Record<string, CategoryForecastPiece>
  model_used: string
  is_low_confidence: boolean
  mae: number | null
  mape: number | null
  benchmark_model: string | null
  benchmark_mae: number | null
  benchmark_mape: number | null
}

export interface RecommendationItem {
  title: string
  rationale: string
  projected_impact: string
  category: string
  priority: 'high' | 'medium' | 'low'
}

export interface Recommendations {
  cached: boolean
  summary: string
  insights: string[]
  recommendations: RecommendationItem[]
  risks: string[]
}

// --- CSV import ---

export interface ColumnMapping {
  date: string | null
  description: string | null
  amount: string | null
  debit: string | null
  credit: string | null
}

export interface CategoryGuess {
  category: string | null
  confidence: number | null
}

export interface UploadPreviewResponse {
  columns: string[]
  suggested_mapping: ColumnMapping
  sample_rows: Record<string, string>[]
  category_guesses: CategoryGuess[]
  total_rows: number
  upload_token: string
}

export interface UploadCommitResponse {
  inserted: number
  duplicates_skipped: number
  unparseable_skipped: number
}

// --- Market indices ---

export interface IntradayPoint {
  timestamp: number
  value: number
}

export interface IndexData {
  name: string
  symbol: string
  current: number
  change: number
  change_pct: number
  previous_close: number
  points: IntradayPoint[]
  timestamp: number
  is_open: boolean
  is_stale: boolean
}

export interface MarketIndicesResponse {
  indices: IndexData[]
  source: string
  delayed_minutes: number
}

// --- Screenshot transaction extraction ---

export interface ExtractionConfidence {
  amount: number
  merchant: number
  category: number
}

export interface TransactionExtraction {
  is_transaction: boolean
  amount: number | null
  currency: string | null
  direction: 'debit' | 'credit' | null
  merchant: string | null
  datetime: string | null
  reference: string | null
  category: string | null
  confidence: ExtractionConfidence
  unreadable_fields: string[]
  notes: string | null
}
