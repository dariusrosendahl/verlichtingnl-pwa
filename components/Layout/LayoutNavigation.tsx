import { CartFab, useCartEnabled } from '@graphcommerce/magento-cart'
import { CmsBlock } from '@graphcommerce/magento-cms'
import { CustomerFab, CustomerMenuFabItem } from '@graphcommerce/magento-customer'
import { SearchFab, SearchField } from '@graphcommerce/magento-search'
import {
  StoreSwitcherButton,
  StoreSwitcherFab,
  StoreSwitcherMenuFabSecondaryItem,
} from '@graphcommerce/magento-store'
import { WishlistFab, WishlistMenuFabItem } from '@graphcommerce/magento-wishlist'
import type { LayoutDefaultProps } from '@graphcommerce/next-ui'
import {
  DarkLightModeMenuSecondaryItem,
  DesktopNavActions,
  DesktopNavBar,
  iconCustomerService,
  iconHeart,
  IconSvg,
  LayoutDefault,
  MenuFabSecondaryItem,
  MobileTopRight,
  NavigationFab,
  NavigationOverlay,
  NavigationProvider,
  PlaceholderFab,
  useMemoDeep,
  useNavigationSelection,
} from '@graphcommerce/next-ui'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Divider, Fab } from '@mui/material'
import { useRouter } from 'next/router'
import { snowdogMenuToNavigation } from '../../lib/snowdogMenuToNavigation'
import { MegaMenu } from './MegaMenu'
import { productListRenderer } from '../ProductListItems/productListRenderer'
import { Footer } from './Footer'
import type { LayoutQuery } from './Layout.gql'
import { Logo } from './Logo'

export type LayoutNavigationProps = LayoutQuery &
  Omit<LayoutDefaultProps, 'footer' | 'header' | 'cartFab' | 'menuFab'>

export function LayoutNavigation(props: LayoutNavigationProps) {
  const { snowdogMenu, categories, children, cmsBlocks, ...uiProps } = props

  const selection = useNavigationSelection()
  const router = useRouter()

  const cartEnabled = useCartEnabled()

  const footerBlock = cmsBlocks?.items?.find((item) => item?.identifier === 'footer_links_block')

  return (
    <>
      <NavigationProvider
        selection={selection}
        items={useMemoDeep(
          () => [
            { id: 'home', name: <Trans>Home</Trans>, href: '/' },
            // Snowdog menu items
            ...snowdogMenuToNavigation(snowdogMenu?.items, true),
            <Divider key='divider' sx={(theme) => ({ my: theme.spacings.xs })} />,
            <CustomerMenuFabItem
              onClick={() => selection.set(false)}
              key='account'
              guestHref='/account/signin'
              authHref='/account'
            >
              <Trans>Account</Trans>
            </CustomerMenuFabItem>,
            <MenuFabSecondaryItem
              key='service'
              icon={<IconSvg src={iconCustomerService} size='medium' />}
              href='/service'
            >
              <Trans>Customer Service</Trans>
            </MenuFabSecondaryItem>,
            <WishlistMenuFabItem
              onClick={() => selection.set(false)}
              key='wishlist'
              icon={<IconSvg src={iconHeart} size='medium' />}
            >
              <Trans>Wishlist</Trans>
            </WishlistMenuFabItem>,
            <DarkLightModeMenuSecondaryItem key='darkmode' />,
            <StoreSwitcherMenuFabSecondaryItem key='store-switcher' />,
          ],
          [snowdogMenu, selection],
        )}
      >
        <NavigationOverlay
          stretchColumns={false}
          variantSm='left'
          sizeSm='full'
          justifySm='start'
          itemWidthSm='70vw'
          variantMd='left'
          sizeMd='full'
          justifyMd='start'
          itemWidthMd='230px'
          mouseEvent='hover'
          itemPadding='md'
        />
      </NavigationProvider>

      <LayoutDefault
        {...uiProps}
        noSticky={router.asPath.split('?')[0] === '/'}
        header={
          <>
            <Logo />

            <DesktopNavBar>
              <MegaMenu items={snowdogMenu?.items} categories={categories} />
            </DesktopNavBar>
            <DesktopNavActions>
              <StoreSwitcherButton />
              <SearchField
                formControl={{ sx: { width: '400px' } }}
                searchField={{ productListRenderer }}
              />
              <Fab href='/service' aria-label={t`Customer Service`} size='large' color='inherit'>
                <IconSvg src={iconCustomerService} size='large' />
              </Fab>
              <WishlistFab
                icon={<IconSvg src={iconHeart} size='large' />}
                BadgeProps={{ color: 'secondary' }}
              />
              <CustomerFab
                guestHref='/account/signin'
                authHref='/account'
                BadgeProps={{ color: 'secondary' }}
              />
              {/* The placeholder exists because the CartFab is sticky but we want to reserve the space for the <CartFab /> */}
              {cartEnabled && <PlaceholderFab />}
            </DesktopNavActions>

            <MobileTopRight>
              <StoreSwitcherFab size='responsiveMedium' />
              <SearchFab size='responsiveMedium' />
            </MobileTopRight>
          </>
        }
        footer={
          <Footer
            socialLinks={
              footerBlock ? (
                <CmsBlock cmsBlock={footerBlock} productListRenderer={productListRenderer} />
              ) : (
                <div />
              )
            }
          />
        }
        cartFab={<CartFab BadgeProps={{ color: 'secondary' }} />}
        menuFab={<NavigationFab onClick={() => selection.set([])} />}
      >
        {children}
      </LayoutDefault>
    </>
  )
}
