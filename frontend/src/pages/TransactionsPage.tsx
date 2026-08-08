import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useCurrency } from '../lib/currency'
import { formatDate, formatMoney } from '../lib/format'
import { UploadModal } from '../components/UploadModal'
import { Skeleton } from '../components/Skeleton'
import type { Category, Transaction } from '../lib/types'

export function TransactionsPage() {
  const currency = useCurrency()
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  const [newTxn, setNewTxn] = useState({ date: '', description: '', amount: '', category_id: '' })

  async function loadTransactions() {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (categoryFilter) params.category_id = categoryFilter
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    const res = await api.get<Transaction[]>('/transactions', { params })
    setTransactions(res.data)
  }

  useEffect(() => {
    api.get<Category[]>('/categories').then((res) => setCategories(res.data))
  }, [])

  useEffect(() => {
    setTransactions(null)
    const t = setTimeout(loadTransactions, 250) // debounce search/filter changes
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter, dateFrom, dateTo])

  async function handleCategoryChange(txnId: string, categoryId: string) {
    await api.patch(`/transactions/${txnId}`, { category_id: categoryId })
    loadTransactions()
  }

  async function handleDelete(txnId: string) {
    await api.delete(`/transactions/${txnId}`)
    loadTransactions()
  }

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault()
    const amountMinor = Math.round(parseFloat(newTxn.amount) * 100)
    await api.post('/transactions', {
      date: newTxn.date,
      description: newTxn.description,
      amount_minor: amountMinor,
      category_id: newTxn.category_id || null,
    })
    setNewTxn({ date: '', description: '', amount: '', category_id: '' })
    setShowAddForm(false)
    loadTransactions()
  }

  function exportCsv() {
    window.open(`${api.defaults.baseURL}/reports/transactions/export.csv`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Transactions</h1>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-black/[0.02]">
            Export CSV
          </button>
          <button onClick={() => setShowAddForm((v) => !v)} className="rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-black/[0.02]">
            Add manually
          </button>
          <button onClick={() => setShowUpload(true)} className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white">
            Import CSV
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTransaction} className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
          <input required type="date" value={newTxn.date} onChange={(e) => setNewTxn((t) => ({ ...t, date: e.target.value }))} className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm" />
          <input required placeholder="Description" value={newTxn.description} onChange={(e) => setNewTxn((t) => ({ ...t, description: e.target.value }))} className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm sm:col-span-2" />
          <input required type="number" step="0.01" placeholder="Amount (+income / -spend)" value={newTxn.amount} onChange={(e) => setNewTxn((t) => ({ ...t, amount: e.target.value }))} className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm" />
          <select value={newTxn.category_id} onChange={(e) => setNewTxn((t) => ({ ...t, category_id: e.target.value }))} className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm">
            <option value="">Auto-categorize</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit" className="col-span-2 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white sm:col-span-1">
            Add
          </button>
        </form>
      )}

      <div className="card flex flex-wrap gap-3 p-4">
        <input placeholder="Search description…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 min-w-[180px] rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm" />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm" />
      </div>

      <div className="card-lifted overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--bg)] text-xs uppercase text-[var(--text-tertiary)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Description</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {transactions === null &&
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3" colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))}
            {transactions?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[var(--text-tertiary)]">
                  No transactions match these filters.
                </td>
              </tr>
            )}
            {transactions?.map((t) => (
              <tr key={t.id} className="border-t border-[var(--border)] hover:bg-black/[0.015]">
                <td className="px-4 py-2.5 text-[var(--text-secondary)]">{formatDate(t.date)}</td>
                <td className="px-4 py-2.5 text-[var(--text-primary)]">{t.description}</td>
                <td className="px-4 py-2.5">
                  <select
                    value={t.category_id ?? ''}
                    onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                    className="rounded-md border border-transparent bg-transparent text-xs text-[var(--text-secondary)] hover:border-[var(--border)]"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={`px-4 py-2.5 text-right tabular-nums font-medium ${t.amount_minor < 0 ? 'text-[var(--text-primary)]' : 'text-[var(--accent)]'}`}>
                  {formatMoney(t.amount_minor, currency)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => handleDelete(t.id)} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--red)]">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onDone={() => {
            setShowUpload(false)
            loadTransactions()
          }}
        />
      )}
    </div>
  )
}
