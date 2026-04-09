import { Router } from 'express'
import { renderSignature } from '@dh-signature/signature-renderer'
import { getAssignmentByEmail } from '../services/mockStore'
import { signatureProfiles, signatureTemplates } from '@dh-signature/shared-types'

export const signaturesRouter = Router()

signaturesRouter.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'dh-signature-api' })
})

signaturesRouter.get('/signature', (req, res) => {
  const email = String(req.query.email || '').trim()
  if (!email) {
    return res.status(400).json({ error: 'email is required' })
  }

  const assignment = getAssignmentByEmail(email)
  const rendered = renderSignature(assignment)
  return res.json({
    assignment,
    rendered,
  })
})

signaturesRouter.get('/admin/overview', (_req, res) => {
  res.json({
    profiles: signatureProfiles,
    templates: signatureTemplates,
    controls: {
      canActivateTenantWide: true,
      canForceRefresh: true,
      authProvider: 'Microsoft Entra ID',
    },
  })
})
