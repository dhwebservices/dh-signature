import type { PagesFunction } from '@cloudflare/workers-types'
import { saveAdminState } from '../../_shared/signature-data'

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const payload = await request.json()
    await saveAdminState(env, payload)

    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error saving admin state.',
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      },
    )
  }
}
