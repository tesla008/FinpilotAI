import { NavLink, Outlet } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { ProfileAvatar } from './ProfileAvatar'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/import', label: 'Import' },
  { to: '/forecast', label: 'Forecast' },
  { to: '/advice', label: 'Advice' },
  { to: '/what-if', label: 'What-if' },
]

/**
 * 232px fixed left sidebar used by every in-app page (not the landing page,
 * which has its own top nav). Matches the design system: white surface,
 * 1px hairline right border, logo at 38px, active nav item as a filled
 * indigo pill.
 */
export function AppShell() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="sticky top-0 flex h-screen w-[232px] flex-none flex-col border-r border-hairline bg-card px-5 py-8">
        <NavLink to="/" className="mb-9 px-2">
          <BrandMark size={38} />
        </NavLink>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-sm px-3.5 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-primary font-semibold text-white' : 'text-secondary hover:bg-hairline'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {user && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `mt-4 flex items-center gap-2.5 rounded-sm border-t border-hairline px-2 pt-4 pb-1 transition-colors ${
                isActive ? 'text-heading' : 'text-secondary hover:text-heading'
              }`
            }
          >
            <ProfileAvatar user={user} size={32} />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{user.name}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none text-muted">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </NavLink>
        )}
      </aside>

      <main className="max-w-[1360px] flex-1 px-14 pt-11 pb-20">
        <Outlet />
      </main>
    </div>
  )
}
