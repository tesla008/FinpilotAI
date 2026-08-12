import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleSignInButton } from '../components/GoogleSignInButton'
import { BrandMark } from '../components/BrandMark'

export function SignInPage() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  if (loading) return null
  if (user) return <Navigate to={from} replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-lg bg-card p-9 text-center shadow-[var(--shadow-card)]">
        <div className="mb-6 flex justify-center">
          <BrandMark size={28} />
        </div>

        <h1 className="font-heading text-h4 font-bold text-heading">Sign in to see your financial future</h1>

        <div className="mt-7 mb-7">
          <GoogleSignInButton />
        </div>

        <p className="text-xs leading-relaxed text-muted">
          We only read your name, email, and profile picture — never your Gmail, Drive, or any bank account.
        </p>
      </div>
    </div>
  )
}
