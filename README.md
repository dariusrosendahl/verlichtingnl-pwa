# Verlichting.nl PWA (GraphCommerce)

A headless PWA storefront for Verlichting.nl built with [GraphCommerce](https://graphcommerce.org/).

## Current Status

### ✅ What Works
- **GraphQL connection to local Magento** - Uses `NODE_TLS_REJECT_UNAUTHORIZED=0` to bypass SSL cert issues
- **Product images** - URLs are transformed from local to production, images load correctly
- **Category browsing** - Product listings with filtering and sorting
- **Product detail pages** - Full product information
- **Cart functionality** - Add/remove items
- **Checkout flow** - Basic checkout process
- **Search** - Product search

### ⚠️ Known Limitations
- **Missing CMS blocks** - `footer_links_block`, `no-route` page not in local Magento (non-critical warnings)
- **Missing Snowdog menu** - `main-menu` not configured in local Magento
- **Large page data warnings** - Some pages exceed 128KB threshold
- **Turbopack occasional errors** - Next.js 16 Turbopack can have internal errors (see Troubleshooting)

### ❌ Not Yet Configured
- **Newsletter** - Subscription mutation returns error
- **Reviews** - Product review submission
- **Compare** - Disabled in config as Magento module not available

## Prerequisites

- Node.js >= 20 < 24
- Yarn 4.1.1 (via corepack: `corepack enable`)
- Running Magento instance (Docker setup in `/klanten/verlichting/src`)

## Quick Start

### 1. Start Magento Backend

First, ensure the Magento Docker containers are running:

```bash
cd /Users/dariusrosendahl/klanten/verlichting/src
docker-compose -f compose.yaml up -d
```

Verify containers are running:
```bash
docker ps | grep verlichting
```

### 2. Run Magento Indexers

The PWA needs indexed data from Magento:

```bash
docker exec verlichting-phpfpm-1 bin/magento indexer:reindex
docker exec verlichting-phpfpm-1 bin/magento cache:flush
```

### 3. Generate GraphQL Mesh

The PWA uses GraphQL Mesh to connect to Magento. Generate the mesh files:

```bash
cd /Users/dariusrosendahl/klanten/verlichting-pwa

# SSL verification must be disabled for local self-signed certificates
NODE_TLS_REJECT_UNAUTHORIZED=0 yarn codegen:full
```

### 4. Start Development Server

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 yarn dev
```

The PWA will be available at: http://localhost:3000

## Configuration

### Magento Endpoint

The Magento GraphQL endpoint is configured in `graphcommerce.config.ts`:

```typescript
magentoEndpoint: 'https://verlichtingnl.localho.st/graphql',
```

This must match the Magento base URL configured in the Docker setup.

### Environment Variables

The `.env` file contains:
- `MAGENTO_ENDPOINT` - Production Magento URL (used as fallback)

### SSL Certificate Issues

The local Magento uses a self-signed SSL certificate. To bypass certificate verification:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 yarn dev
```

## Common Commands

```bash
# Install dependencies
yarn install

# Run codegen (generates GraphQL types)
yarn codegen

# Run full codegen including mesh build
NODE_TLS_REJECT_UNAUTHORIZED=0 yarn codegen:full

# Start dev server
NODE_TLS_REJECT_UNAUTHORIZED=0 yarn dev

# Start dev server with Turbopack (faster)
NODE_TLS_REJECT_UNAUTHORIZED=0 yarn dev:turbo

# Build for production
NODE_TLS_REJECT_UNAUTHORIZED=0 yarn build

# Start production server
yarn start

# Lint code
yarn tsc:lint

# Extract translations
yarn lingui
```

## Troubleshooting

### "Module not found: Can't resolve '../../../.mesh'"

The GraphQL Mesh hasn't been generated. Run:
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 yarn codegen:full
```

### "Failed to fetch introspection from ... TypeError: Cannot read properties of undefined"

1. Check Magento is running: `docker ps | grep verlichting`
2. Ensure the endpoint URL is correct in `graphcommerce.config.ts`
3. Make sure `NODE_TLS_REJECT_UNAUTHORIZED=0` is set

### GraphQL errors about missing CMS blocks

Some CMS blocks referenced in the PWA may not exist in the local Magento. These are non-critical warnings:
```
[GraphQL errors]: The CMS block with the "footer_links_block" ID doesn't exist.
```

### Raw HTML showing instead of rendered content

This indicates CMS content from Magento contains HTML that needs proper rendering. Check if the CMS pages/blocks have the correct content format.

### Product images in local development

**How it works**: Product images work in local development through a URL transformation:

1. Magento returns image URLs like `https://verlichtingnl.localho.st/media/catalog/product/...`
2. An Apollo Link (`lib/transformImageUrlsLink.ts`) transforms these to `https://www.verlichting.nl/media/catalog/product/...`
3. Next.js image optimization fetches from production (which has valid SSL)
4. Images load correctly

**Requirements for images to work**:
- `NODE_TLS_REJECT_UNAUTHORIZED=0` must be set (for GraphQL requests to local Magento)
- The Apollo Link must be active in both SSR and client-side GraphQL clients
- The `transformImageUrlsLink` is configured in:
  - `lib/graphql/graphqlSsrClient.ts` (SSR)
  - `pages/_app.tsx` (client-side)

**If images stop working**:
1. Check that `lib/transformImageUrlsLink.ts` exists and is properly configured
2. Verify the link is included in the Apollo Client chain
3. Ensure `www.verlichting.nl` is in `remotePatterns` in `next.config.ts`
4. Don't set `unoptimized: true` globally in `next.config.ts` - this breaks the image endpoint

### Turbopack Internal Errors / 500 Internal Server Error

If you get repeated `TurbopackInternalError: failed to receive message` or 500 errors:

1. Kill all running servers:
   ```bash
   pkill -f "next dev"
   lsof -ti:3000 | xargs kill -9 2>/dev/null || true
   ```

2. Clear the cache and reinstall:
   ```bash
   rm -rf node_modules/.cache .next
   yarn install
   ```

3. Restore the GraphQL config file (this can get corrupted by codegen):
   ```bash
   cp node_modules/@graphcommerce/graphql/config.original.ts node_modules/@graphcommerce/graphql/config.ts
   ```

4. Restart the dev server:
   ```bash
   NODE_TLS_REJECT_UNAUTHORIZED=0 yarn dev
   ```

### "Export graphqlConfig doesn't exist in target module"

The `config.ts` file in `node_modules/@graphcommerce/graphql/` was deleted or corrupted. Fix it:
```bash
cp node_modules/@graphcommerce/graphql/config.original.ts node_modules/@graphcommerce/graphql/config.ts
```

### Plugin target not found errors during codegen

These warnings are harmless and can be ignored:
```
Plugin target not found @graphcommerce/graphql#graphqlConfig for plugin...
```
The codegen will still complete successfully.

## Project Structure

```
verlichting-pwa/
├── .mesh/                  # Generated GraphQL Mesh files
├── components/             # React components
├── graphql/               # GraphQL queries and fragments
├── lib/                   # Utility libraries
├── pages/                 # Next.js pages
├── plugins/               # GraphCommerce plugins
├── public/                # Static assets
├── graphcommerce.config.ts # Main configuration
└── package.json
```

## Useful URLs

- PWA Dev: http://localhost:3000
- Magento Admin: https://verlichtingnl.localho.st/beheer
- Magento GraphQL: https://verlichtingnl.localho.st/graphql
- phpMyAdmin: http://localhost:8080

## Related Documentation

- [GraphCommerce Docs](https://graphcommerce.org/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Magento GraphQL API](https://developer.adobe.com/commerce/webapi/graphql/)
