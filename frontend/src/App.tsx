import { Route, Routes } from 'react-router-dom'
import { CurrencyProvider } from './lib/currency'
import { AppShell } from './components/AppShell'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { ImportPage } from './pages/ImportPage'
import { ForecastPage } from './pages/ForecastPage'
import { AdvicePage } from './pages/AdvicePage'
import { WhatIfPage } from './pages/WhatIfPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { BudgetsPage } from './pages/BudgetsPage'
import { GoalsPage } from './pages/GoalsPage'
import { ReportsPage } from './pages/ReportsPage'

function App() {
  return (
    <CurrencyProvider>
      <Routes>
        {/* Landing has its own top nav/footer, no sidebar. */}
        <Route path="/" element={<LandingPage />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/advice" element={<AdvicePage />} />
          <Route path="/what-if" element={<WhatIfPage />} />

          {/* Not part of the design references' route list, kept reachable
              so the existing backend-wired functionality isn't lost while
              pages are rebuilt one at a time. */}
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </CurrencyProvider>
  )
}

export default App
