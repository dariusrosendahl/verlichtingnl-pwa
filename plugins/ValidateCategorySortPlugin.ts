import {
  type productListApplyCategoryDefaults as productListApplyCategoryDefaultsType,
  type useProductListApplyCategoryDefaults as useProductListApplyCategoryDefaultsType,
} from '@graphcommerce/magento-product'
import type { FunctionPlugin, PluginConfig } from '@graphcommerce/next-config'

export const config: PluginConfig = {
  type: 'function',
  module: '@graphcommerce/magento-product',
}

// Valid sort fields as defined in Magento's ProductAttributeSortInput
const VALID_SORT_FIELDS = ['name', 'position', 'price', 'relevance', 'qls']
const DEFAULT_SORT_FIELD = 'position'

/**
 * Helper to validate and fix sort field
 */
function validateSort<T extends { sort?: Record<string, unknown> }>(result: T): T {
  if (!result?.sort) return result

  const sortKeys = Object.keys(result.sort)
  if (sortKeys.length > 0) {
    const currentSortField = sortKeys[0]
    if (!VALID_SORT_FIELDS.includes(currentSortField)) {
      const sortDirection = result.sort[currentSortField]
      return { ...result, sort: { [DEFAULT_SORT_FIELD]: sortDirection } }
    }
  }

  return result
}

/**
 * Plugin to validate category sort values before they're used in GraphQL queries.
 *
 * Magento categories may have default_sort_by values (like 'bestsellers' or 'new')
 * that don't exist in the GraphQL ProductAttributeSortInput schema.
 * This plugin maps invalid sort values to a valid fallback ('position').
 */
export const productListApplyCategoryDefaults: FunctionPlugin<
  typeof productListApplyCategoryDefaultsType
> = async (prev, params, conf, category) => {
  const result = await prev(params, conf, category)
  if (!result) return result
  return validateSort(result)
}

/**
 * Hook version of the plugin for client-side usage
 */
export const useProductListApplyCategoryDefaults: FunctionPlugin<
  typeof useProductListApplyCategoryDefaultsType
> = (prev, params, category) => {
  const result = prev(params, category)
  if (!result) return result
  return validateSort(result)
}
