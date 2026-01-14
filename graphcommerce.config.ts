import type { GraphCommerceConfig } from '@graphcommerce/next-config'

/** Verlichting.nl GraphCommerce Configuration Docs: https://graphcommerce.org/docs/framework/config */
const config: Partial<GraphCommerceConfig> = {
  // Development settings - change for production
  robotsAllow: false,
  limitSsg: true,

  // Magento Backend - Local development for schema introspection
  // Production Magento blocks introspection, so we build with local schema
  // Note: Set MAGENTO_ENDPOINT env var if needed for different environments
  magentoEndpoint:
    process.env.MAGENTO_ENDPOINT ?? 'https://verlichtingnl.localho.st/graphql',
  magentoVersion: 245, // Magento 2.4.5
  canonicalBaseUrl: 'https://www.verlichting.nl',

  // Storefronts - Using local Magento store code
  storefront: [
    {
      locale: 'nl',
      magentoStoreCode: 'nl', // Local Magento store code
      defaultLocale: true,
      googleAnalyticsId: undefined,
      googleRecaptchaKey: undefined,
    },
  ],

  // Features
  recentlyViewedProducts: { enabled: true },
  productFiltersPro: true,
  productFiltersLayout: 'SIDEBAR',
  productListPaginationVariant: 'EXTENDED',

  // Default sort - use 'position' since 'new' doesn't exist in this Magento
  sortByDefault: 'position',

  // Permissions - enable all commerce features
  permissions: {
    cart: 'ENABLED',
    checkout: 'ENABLED',
    customerAccount: 'ENABLED',
  },

  // B2B Features
  customerCompanyFieldsEnable: true, // Enable company fields for B2B

  // Price display - controlled by customer type switcher
  // cartDisplayPricesInclTax will be dynamic based on customer type

  // Compare functionality - disabled as Magento Compare module not available
  compare: false,
  // compareVariant: 'ICON',

  // Wishlist
  wishlistHideForGuests: false,

  // Preview mode for content staging
  // previewSecret: process.env.PREVIEW_SECRET,

  // Note: Image URL rewriting is handled in lib/imageLoader.ts
  // This rewrites local Magento URLs to production for proper image loading
}

export default config
