import type { Configuration } from '@azure/msal-browser'

const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID || '00000000-0000-0000-0000-000000000000'
const tenantId = import.meta.env.VITE_ENTRA_TENANT_ID || 'common'

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
}

export const loginRequest = {
  scopes: ['User.Read'],
}
