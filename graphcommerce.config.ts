import type { GraphCommerceConfig } from '@graphcommerce/next-config'

/**
 * Verlichting.nl GraphCommerce Configuration
 * Docs: https://graphcommerce.org/docs/framework/config
 */
const config: Partial<GraphCommerceConfig> = {
  // Development settings - change for production
  robotsAllow: false,
  limitSsg: true,

  // Magento Backend
  magentoEndpoint: 'https://verlichting.nl/graphql',
  magentoVersion: 245, // Magento 2.4.5
  canonicalBaseUrl: 'https://verlichting.nl',

  // Storefronts - Dutch only for now
  storefront: [
    {
      locale: 'nl',
      magentoStoreCode: 'default', // TODO: Verify actual store code
      defaultLocale: true,
      googleAnalyticsId: undefined, // TODO: Add GA ID
      googleRecaptchaKey: undefined,
    },
  ],

  // Features
  recentlyViewedProducts: { enabled: true },
  productFiltersPro: true,
  productFiltersLayout: 'DEFAULT',

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

  // Compare functionality
  compare: true,
  compareVariant: 'ICON',

  // Wishlist
  wishlistHideForGuests: false,

  // Preview mode for content staging
  // previewSecret: process.env.PREVIEW_SECRET,
}

export default config
