import type { ImageLoaderProps } from 'next/image'

const LOCAL_HOSTS = ['verlichtingnl.localho.st', 'verlichting.localhost']
const PRODUCTION_HOST = 'www.verlichting.nl'

/**
 * Custom image loader for development that serves images directly from production.
 * This bypasses Next.js image optimization and SSL certificate issues in development.
 *
 * In development:
 * - Local Magento URLs are rewritten to production
 * - Images are served directly without /_next/image optimization
 *
 * In production:
 * - Uses Next.js image optimization as normal
 */
export default function customImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // For local/static assets, return as-is
  if (src.startsWith('/') || src.startsWith('/_next/') || src.startsWith('data:')) {
    return src
  }

  // In development, bypass image optimization and serve directly from production
  if (process.env.NODE_ENV === 'development') {
    // Rewrite local Magento URLs to production
    let finalSrc = src
    for (const host of LOCAL_HOSTS) {
      if (finalSrc.includes(host)) {
        finalSrc = finalSrc.replace(host, PRODUCTION_HOST)
        break
      }
    }
    // Return direct URL without optimization
    return finalSrc
  }

  // In production, use Next.js image optimization
  const params = new URLSearchParams()
  params.set('url', src)
  params.set('w', width.toString())
  params.set('q', (quality || 75).toString())

  return `/_next/image?${params.toString()}`
}
