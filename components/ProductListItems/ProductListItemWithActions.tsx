import type { ProductListItemProps } from '@graphcommerce/magento-product'
import { ProductListItem, useAddProductsToCartAction } from '@graphcommerce/magento-product'
import { Money } from '@graphcommerce/magento-store'
import { IconSvg, iconShoppingBag } from '@graphcommerce/next-ui'
import { Trans } from '@lingui/react/macro'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import type { ProductListItemSimpleFragment } from '@graphcommerce/magento-product-simple'
import { ProductReviewSummary } from '@graphcommerce/magento-review'
import { ProductWishlistChip } from '@graphcommerce/magento-wishlist'

// Icon for quote/offerte button
const iconDocument = (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
    <polyline points='14 2 14 8 20 8' />
    <line x1='16' y1='13' x2='8' y2='13' />
    <line x1='16' y1='17' x2='8' y2='17' />
    <polyline points='10 9 9 9 8 9' />
  </svg>
)

export type ProductListItemWithActionsProps = ProductListItemSimpleFragment & ProductListItemProps

// Dutch VAT rate
const VAT_RATE = 0.21

function calculateExclVat(inclVatPrice: number): number {
  return inclVatPrice / (1 + VAT_RATE)
}

export function ProductListItemWithActions(props: ProductListItemWithActionsProps) {
  const { sku, price_range } = props
  const { onClick: addToCartClick, loading, disabled, showSuccess } = useAddProductsToCartAction({ sku })

  const finalPrice = price_range?.minimum_price?.final_price?.value ?? 0
  const currency = price_range?.minimum_price?.final_price?.currency ?? 'EUR'
  const exclVatPrice = calculateExclVat(finalPrice)

  return (
    <ProductListItem
      {...props}
      aspectRatio={[1, 1]}
      bottomLeft={<ProductReviewSummary {...props} />}
      topRight={<ProductWishlistChip {...props} />}
    >
      {/* Additional price info and buttons below the default content */}
      <Box sx={{ mt: 0.5 }}>
        {/* Excl. BTW price */}
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ fontSize: '0.8rem' }}
        >
          <Trans>Excl. BTW:</Trans>{' '}
          <Money value={exclVatPrice} currency={currency} />
        </Typography>

        {/* Action buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 1.5,
          }}
        >
          <Button
            type='submit'
            variant='contained'
            color='primary'
            size='small'
            disabled={disabled}
            startIcon={
              loading ? (
                <CircularProgress size={16} color='inherit' />
              ) : (
                <IconSvg src={iconShoppingBag} size='small' />
              )
            }
            onClick={addToCartClick}
            sx={{
              flex: 1,
              fontSize: '0.75rem',
              py: 0.75,
              textTransform: 'none',
              minWidth: 0,
            }}
          >
            {showSuccess ? <Trans>Toegevoegd!</Trans> : <Trans>Winkelwagen</Trans>}
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={iconDocument}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // TODO: Implement quote request functionality
            }}
            sx={{
              flex: 1,
              fontSize: '0.75rem',
              py: 0.75,
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.primary',
              minWidth: 0,
              '&:hover': {
                borderColor: 'text.primary',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Trans>Offerte</Trans>
          </Button>
        </Box>
      </Box>
    </ProductListItem>
  )
}
