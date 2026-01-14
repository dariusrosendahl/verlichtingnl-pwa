import {
  CategoryBreadcrumbs,
  CategoryChildren,
  CategoryDescription,
} from '@graphcommerce/magento-category'
import {
  ProductFiltersPro,
  ProductFiltersProAggregations,
  ProductFiltersProAllFiltersChip,
  ProductFiltersProCategorySection,
  productFiltersProChipRenderer,
  ProductFiltersProClearAll,
  ProductFiltersProLimitChip,
  ProductFiltersProLimitSection,
  ProductFiltersProNoResults,
  productFiltersProSectionRenderer,
  ProductFiltersProSortChip,
  ProductFiltersProSortSection,
  ProductListCount,
  ProductListFiltersContainer,
  ProductListPagination,
  ProductListSuggestions,
} from '@graphcommerce/magento-product'
import {
  ProductFiltersProCategorySectionSearch,
  ProductFiltersProSearchTerm,
} from '@graphcommerce/magento-search'
import { breadcrumbs } from '@graphcommerce/next-config/config'
import { Container, MediaQuery, memoDeep, StickyBelowHeader, sxx } from '@graphcommerce/next-ui'
import { Trans } from '@lingui/react/macro'
import { Box, Divider, Typography } from '@mui/material'
import { ProductListItems, productListRenderer } from '../ProductListItems'
import type { ProductListLayoutProps } from './types'
import { useLayoutConfiguration } from './types'
import { ProductViewToggle, useProductViewMode } from './ProductViewToggle'

export const ProductListLayoutSidebar = memoDeep(function ProductListLayoutSidebar(
  props: ProductListLayoutProps,
) {
  const { filters, filterTypes, params, products, handleSubmit, category, title, menu } = props
  const configuration = useLayoutConfiguration(true)
  const { viewMode, setViewMode } = useProductViewMode()

  if (!params || !products?.items || !filterTypes) return null
  const { total_count, sort_fields, page_info } = products

  // Adjust columns based on view mode
  const columns = viewMode === 'list'
    ? { xs: { count: 1 }, md: { count: 1 }, lg: { count: 1 } }
    : configuration.columns

  return (
    <ProductFiltersPro
      params={params}
      aggregations={filters?.aggregations}
      appliedAggregations={products?.aggregations}
      filterTypes={filterTypes}
      autoSubmitMd
      handleSubmit={handleSubmit}
    >
      {breadcrumbs && category && (
        <Container maxWidth={false}>
          <CategoryBreadcrumbs
            category={category}
            sx={(theme) => ({
              mb: theme.spacings.sm,
              [theme.breakpoints.down('md')]: {
                '& .MuiBreadcrumbs-ol': { justifyContent: 'center' },
              },
            })}
          />
        </Container>
      )}
      <Container
        maxWidth={false}
        sx={(theme) => ({
          display: 'grid',
          alignItems: 'start',
          rowGap: theme.spacings.md,
          columnGap: configuration.columnGap,
          mb: theme.spacings.xl,
          gridTemplate: {
            xs: '"title" "horizontalFilters" "count" "items" "pagination"',
            md: `
              "sidebar title"      auto
              "sidebar count"      auto
              "sidebar items"      auto
              "sidebar pagination" 1fr
              /${'var(--configuration-sidebarWidth)'}   auto
            `,
          },
        })}
        style={
          {
            '--configuration-sidebarWidth': configuration.sidebarWidth,
          } as React.CSSProperties
        }
      >
        <Box
          className='title'
          sx={(theme) => ({
            gridArea: 'title',
            display: 'grid',
            gridAutoFlow: 'row',
            rowGap: theme.spacings.xs,
          })}
        >
          {category ? (
            <>
              <Typography variant='h1'>{title}</Typography>

              <CategoryDescription
                textAlignMd='start'
                textAlignSm='start'
                category={category}
                productListRenderer={productListRenderer}
              />
              {/* Subcategory chips - shown on all screen sizes */}
              {category?.children && category.children.length > 0 && (
                <CategoryChildren
                  params={params}
                  sx={{
                    mt: 1,
                    '& .MuiChip-root': {
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                    },
                  }}
                >
                  {category.children}
                </CategoryChildren>
              )}
            </>
          ) : (
            <>
              <Typography variant='h2'>
                <ProductFiltersProSearchTerm params={params}>
                  <Trans>All products</Trans>
                </ProductFiltersProSearchTerm>
              </Typography>
              <ProductListSuggestions products={products} />
            </>
          )}
        </Box>

        <Box
          sx={{
            gridArea: 'count',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <ProductViewToggle viewMode={viewMode} onChange={setViewMode} />
          <ProductListCount total_count={total_count} sx={{ my: 0 }} />
        </Box>
        <Box sx={{ gridArea: 'items' }}>
          {products.items.length <= 0 ? (
            <ProductFiltersProNoResults search={params.search} />
          ) : (
            <ProductListItems
              {...products}
              loadingEager={6}
              title={(params.search ? `Search ${params.search}` : title) ?? ''}
              columns={columns}
            />
          )}
        </Box>

        <ProductListPagination
          page_info={page_info}
          params={params}
          sx={{ gridArea: 'pagination', my: 0 }}
        />

        <MediaQuery query={(theme) => theme.breakpoints.down('md')}>
          <StickyBelowHeader sx={{ gridArea: 'horizontalFilters' }}>
            <ProductListFiltersContainer
              sx={(theme) => ({
                '& .ProductListFiltersContainer-scroller': {
                  px: theme.page.horizontal,
                  mx: `calc(${theme.page.horizontal} * -1)`,
                },
              })}
            >
              <ProductFiltersProAggregations renderer={productFiltersProChipRenderer} />
              {products.items.length > 0 && (
                <>
                  <ProductFiltersProSortChip
                    total_count={total_count}
                    sort_fields={sort_fields}
                    category={category}
                  />
                  <ProductFiltersProLimitChip />
                </>
              )}

              <ProductFiltersProAllFiltersChip
                total_count={total_count}
                sort_fields={sort_fields}
                category={category}
              />
            </ProductListFiltersContainer>
          </StickyBelowHeader>
        </MediaQuery>

        <MediaQuery
          query={(theme) => theme.breakpoints.up('md')}
          display='block'
          sx={sxx(
            { gridArea: 'sidebar' },
            breadcrumbs === true ? { mt: 0 } : (theme) => ({ mt: theme.spacings.lg }),
          )}
        >
          {/* FILTERS header */}
          <Typography
            variant='h6'
            component='h2'
            sx={(theme) => ({
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: theme.spacings.sm,
            })}
          >
            <Trans>Filters</Trans>
          </Typography>

          <ProductFiltersProClearAll sx={{ alignSelf: 'center', mb: 2 }} />

          {/* Category filter section */}
          {category ? (
            <ProductFiltersProCategorySection
              category={category}
              params={params}
              hideBreadcrumbs
            />
          ) : (
            <ProductFiltersProCategorySectionSearch menu={menu} defaultExpanded />
          )}

          {/* Attribute filters */}
          <ProductFiltersProAggregations renderer={productFiltersProSectionRenderer} />

          <Divider sx={{ my: 2 }} />

          {/* Sort and limit at bottom */}
          <ProductFiltersProSortSection
            sort_fields={sort_fields}
            total_count={total_count}
            category={category}
          />
          <ProductFiltersProLimitSection />
        </MediaQuery>
      </Container>
    </ProductFiltersPro>
  )
})
