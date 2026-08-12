// Minimal surface of the Google Identity Services global we actually use.
// The script itself is loaded via a <script> tag in index.html (not an npm
// package — that's how GIS is meant to be consumed), so this just types it.
export interface GoogleCredentialResponse {
  credential: string // the ID token — this is what the backend verifies
}

interface GoogleAccountsId {
  initialize(config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void
  prompt(): void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

/** Resolves once window.google.accounts.id is available. The script tag has
 * async/defer, so it may not have finished loading yet when a component
 * mounts — this polls briefly rather than assuming it's already there. */
export function waitForGoogleIdentity(timeoutMs = 8000): Promise<GoogleAccountsId> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google.accounts.id)
        return
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('Google Identity Services failed to load.'))
        return
      }
      setTimeout(check, 100)
    }
    check()
  })
}
