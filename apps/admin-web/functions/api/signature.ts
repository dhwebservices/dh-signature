import type { PagesFunction } from '@cloudflare/workers-types'
import { renderSignature } from '@dh-signature/signature-renderer'
import { buildAssignmentByEmail } from '../_shared/signature-data'

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const url = new URL(request.url)
  const email = url.searchParams.get('email')?.trim()

  if (!email) {
    return new Response(JSON.stringify({ error: 'email is required' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }

  try {
    const assignment = await buildAssignmentByEmail(email, env)
    const rendered = renderSignature(assignment)

    return new Response(JSON.stringify({ assignment, rendered }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error loading signature preview.',
      }),
      {
        status: 404,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      },
    )
  }
}
