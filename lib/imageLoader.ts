import type { ImageLoaderProps } from 'next/image'

/**
 * Custom image loader for development that rewrites local Magento URLs to production.
 * This fixes the SSL/localhost issues when loading images from verlichtingnl.localho.st.
 */
export default function customImageLoader({ src, width, quality }: ImageLoaderProps): string {
  // For local/static assets, return directly without optimization
  if (src.startsWith('/') || src.startsWith('/_next/')) {
    return src
  }

  const localHosts = ['verlichtingnl.localho.st', 'verlichting.localhost']
  const isLocalHost = localHosts.some((host) => src.includes(host))

  if (process.env.NODE_ENV === 'development' && isLocalHost) {
    // Rewrite local Magento URLs to production so images load properly
    // This avoids SSL certificate issues with the local self-signed cert
    let rewrittenSrc = src
    for (const host of localHosts) {
      if (src.includes(host)) {
        rewrittenSrc = src.replace(host, 'www.verlichting.nl')
        break
      }
    }
    return rewrittenSrc
  }

  // For production or non-local hosts, use default Next.js image optimization
  const params = new URLSearchParams()
  params.set('url', src)
  params.set('w', width.toString())
  params.set('q', (quality || 75).toString())

  return `/_next/image?${params.toString()}`
}
