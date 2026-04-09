import type { PagesFunction } from '@cloudflare/workers-types'
import { buildOverview } from '../../_shared/signature-data'

export const onRequestGet: PagesFunction = async ({ env }) => {
  try {
    const overview = await buildOverview(env)

    return new Response(JSON.stringify(overview), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error loading tenant overview.',
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      },
    )
  }
}
