import { ApolloLink } from '@apollo/client'
import { map } from '@graphcommerce/graphql/rxjs'

const LOCAL_HOSTS = ['verlichtingnl.localho.st', 'verlichting.localhost']
const PRODUCTION_HOST = 'www.verlichting.nl'

/**
 * Recursively transforms image URLs in GraphQL response data.
 * Converts local Magento URLs to production URLs.
 *
 * Example:
 * https://verlichtingnl.localho.st/media/catalog/product/image.jpg
 * becomes: https://www.verlichting.nl/media/catalog/product/image.jpg
 *
 * This allows images to load with valid SSL certificates in development,
 * while Next.js image optimization can fetch from production directly.
 */
function transformUrls<T>(data: T): T {
  if (data === null || data === undefined) return data

  if (typeof data === 'string') {
    // Replace any local host with production host
    let result = data
    for (const host of LOCAL_HOSTS) {
      if (result.includes(host)) {
        result = result.replace(new RegExp(host, 'g'), PRODUCTION_HOST)
      }
    }
    return result as T
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
