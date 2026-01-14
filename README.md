# Verlichting.nl PWA (GraphCommerce)

A headless PWA storefront for Verlichting.nl built with [GraphCommerce](https://graphcommerce.org/).

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

### Product images not loading (blank/white boxes)

**Known Limitation**: Product images from local Magento won't load due to SSL certificate issues. The local Magento uses a self-signed certificate that Next.js image optimization cannot verify.

The PWA is fully functional for development - you can:
- Browse categories and products
- Test cart and checkout flows
- Work on component styling and layout

Images will work correctly in production where valid SSL certificates are used.

**Workaround**: If you need to see images during development, you can temporarily view the product on the production site (www.verlichting.nl) to see how it should look.

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
