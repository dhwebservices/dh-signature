import { Sparkles } from 'lucide-react'
import { useMsal } from '@azure/msal-react'
import { loginRequest } from '../authConfig'

export function LoginScreen() {
  const { instance } = useMsal()

  return (
    <div className="login-shell">
      <div className="login-panel">
        <div className="eyebrow">DH Signature</div>
        <h1>Tenant-wide signatures, under DH control.</h1>
        <p>
          Sign in with Microsoft Entra ID to manage signature templates, activate layouts for every user, and force updates when staff details are wrong.
        </p>
        <button
          className="primary-btn"
          onClick={() => instance.loginRedirect(loginRequest)}
        >
          <Sparkles size={16} />
          Sign in with Microsoft
        </button>
      </div>
    </div>
  )
}
