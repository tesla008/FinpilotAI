import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { waitForGoogleIdentity, type GoogleCredentialResponse } from '../lib/googleIdentity'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

export function GoogleSignInButton() {
  const { signInWithGoogleToken } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Sign-in is not configured yet — VITE_GOOGLE_CLIENT_ID is missing.')
      return
    }

    let cancelled = false

    waitForGoogleIdentity()
      .then((googleId) => {
        if (cancelled || !containerRef.current) return

        googleId.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: GoogleCredentialResponse) => {
            try {
              await signInWithGoogleToken(response.credential)
            } catch {
              setError('Could not complete sign-in. Please try again.')
            }
          },
        })
        googleId.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 320,
        })
      })
      .catch(() => setError('Could not load Google Sign-In. Check your connection and try again.'))

    return () => {
      cancelled = true
    }
  }, [signInWithGoogleToken])

  return (
    <div>
      <div ref={containerRef} className="flex justify-center" />
      {error && <p className="mt-3 text-center text-sm text-overspend">{error}</p>}
    </div>
  )
}
