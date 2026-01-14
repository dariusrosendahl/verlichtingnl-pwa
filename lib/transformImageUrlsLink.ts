import { ApolloLink } from '@apollo/client'
import { map } from '@graphcommerce/graphql/rxjs'

const LOCAL_HOSTS = ['verlichtingnl.localho.st', 'verlichting.localhost']

/**
 * Recursively transforms image URLs in GraphQL response data.
 * Converts absolute local Magento URLs to relative paths that Next.js can proxy.
 *
 * Example:
 * https://verlichtingnl.localho.st/media/catalog/product/image.jpg
 * becomes: /media/catalog/product/image.jpg
 *
 * This allows the Next.js rewrite in next.config.ts to proxy these to production.
 */
function transformUrls<T>(data: T): T {
  if (data === null || data === undefined) return data

  if (typeof data === 'string') {
    for (const host of LOCAL_HOSTS) {
      if (data.includes(`https://${host}`)) {
        try {
          const url = new URL(data)
          if (LOCAL_HOSTS.includes(url.hostname)) {
            return url.pathname as T
          }
        } catch {
          // Not a valid URL
        }
      }
    }
    return data
  }

  if (Array.isArray(data)) {
    return data.map(transformUrls) as T
  }

  if (typeof data === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = transformUrls(value)
    }
    return result as T
  }

  return data
}

/**
 * Apollo Link that transforms local Magento image URLs to relative paths.
 * Only active in development mode.
 */
export const transformImageUrlsLink = new ApolloLink((operation, forward) => {
  // Only transform in development
  if (process.env.NODE_ENV !== 'development') {
    return forward(operation)
  }

  return forward(operation).pipe(
    map((result) => {
      if (result.data) {
        return {
          ...result,
          data: transformUrls(result.data),
        }
      }
      return result
    }),
  )
})
