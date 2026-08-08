import { Route, Routes } from 'react-router-dom'
import { CurrencyProvider } from './lib/currency'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { BudgetsPage } from './pages/BudgetsPage'
import { GoalsPage } from './pages/GoalsPage'
import { WhatIfPage } from './pages/WhatIfPage'
import { ReportsPage } from './pages/ReportsPage'

function App() {
  return (
    <CurrencyProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/whatif" element={<WhatIfPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </CurrencyProvider>
  )
}

export default App
