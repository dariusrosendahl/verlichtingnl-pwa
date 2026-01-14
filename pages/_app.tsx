import { FramerNextPages } from '@graphcommerce/framer-next-pages'
import { GraphQLProvider } from '@graphcommerce/graphql'
import { GlobalHead } from '@graphcommerce/magento-store'
import { CssAndFramerMotionProvider, PageLoadIndicator } from '@graphcommerce/next-ui'
import { CssBaseline, ThemeProvider } from '@mui/material'
import type { AppProps } from 'next/app'
import { useMemo } from 'react'
import { theme } from '../components/theme'
import { I18nProvider } from '../lib/i18n/I18nProvider'
import { transformImageUrlsLink } from '../lib/transformImageUrlsLink'

export default function ThemedApp(props: AppProps) {
  const { router } = props
  const { locale = 'en' } = router

  // Transform local Magento image URLs to relative paths in development
  const links = useMemo(() => [transformImageUrlsLink], [])

  return (
    <CssAndFramerMotionProvider {...props}>
      <I18nProvider key={locale} locale={locale}>
        <GraphQLProvider {...props} links={links}>
          <ThemeProvider theme={theme}>
            <GlobalHead />
            <CssBaseline />
            <PageLoadIndicator />
            <FramerNextPages {...props} />
          </ThemeProvider>
        </GraphQLProvider>
      </I18nProvider>
    </CssAndFramerMotionProvider>
  )
}
