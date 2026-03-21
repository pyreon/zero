import type { Middleware, MiddlewareContext } from '@pyreon/server'

// ─── Compression middleware ─────────────────────────────────────────────────

export interface CompressionConfig {
  /** Minimum response size in bytes to compress. Default: `1024` (1KB) */
  threshold?: number
  /** Encoding preference order. Default: `["gzip", "deflate"]` */
  encodings?: ('gzip' | 'deflate')[]
}

/**
 * Compression middleware — compresses responses using gzip or deflate
 * based on the client's Accept-Encoding header.
 *
 * Only compresses text-based content types (HTML, JSON, JS, CSS, XML, SVG).
 * Skips responses below the size threshold.
 *
 * @example
 * import { compressionMiddleware } from "@pyreon/zero/compression"
 *
 * compressionMiddleware() // gzip with 1KB threshold
 * compressionMiddleware({ threshold: 512, encodings: ["gzip"] })
 */
export function compressionMiddleware(
  config: CompressionConfig = {},
): Middleware {
  const { encodings = ['gzip', 'deflate'] } = config

  return async (ctx: MiddlewareContext) => {
    const acceptEncoding = ctx.req.headers.get('accept-encoding') ?? ''

    // Find the best supported encoding
    const encoding = encodings.find((enc) => acceptEncoding.includes(enc))
    if (!encoding) return

    // Signal to downstream that we handle encoding
    ctx.headers.set('X-Zero-Compress', encoding)
  }
}

/**
 * Compress a Response body if it meets the criteria.
 * Call this after the response is generated (post-middleware).
 *
 * @example
 * const response = await handler(request)
 * const compressed = await compressResponse(response, 'gzip', 1024)
 */
export async function compressResponse(
  response: Response,
  encoding: 'gzip' | 'deflate',
  threshold: number,
): Promise<Response> {
  const contentType = response.headers.get('content-type') ?? ''

  // Only compress text-based content
  if (!isCompressible(contentType)) return response

  // Skip if already encoded
  if (response.headers.get('content-encoding')) return response

  const body = await response.arrayBuffer()

  // Skip below threshold
  if (body.byteLength < threshold) return response

  const compressed = await compress(body, encoding)

  const headers = new Headers(response.headers)
  headers.set('Content-Encoding', encoding)
  headers.delete('Content-Length') // Let the runtime recalculate
  headers.append('Vary', 'Accept-Encoding')

  return new Response(compressed, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

const COMPRESSIBLE_TYPES = [
  'text/',
  'application/json',
  'application/javascript',
  'application/xml',
  'application/xhtml+xml',
  'image/svg+xml',
]

function isCompressible(contentType: string): boolean {
  return COMPRESSIBLE_TYPES.some((t) => contentType.includes(t))
}

async function compress(
  data: ArrayBuffer,
  encoding: 'gzip' | 'deflate',
): Promise<ArrayBuffer> {
  const format = encoding === 'gzip' ? 'gzip' : 'deflate'
  const stream = new Blob([data])
    .stream()
    .pipeThrough(new CompressionStream(format))
  return new Response(stream).arrayBuffer()
}
