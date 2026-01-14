import type { PageOptions } from '@graphcommerce/framer-next-pages'
import { cacheFirst } from '@graphcommerce/graphql'
import type { CmsPageFragment } from '@graphcommerce/magento-cms'
import { CmsPageContent, CmsPageDocument } from '@graphcommerce/magento-cms'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { breadcrumbs } from '@graphcommerce/next-config/config'
import { Container, LayoutHeader, PageMeta, revalidate } from '@graphcommerce/next-ui'
import type { GetStaticProps } from '@graphcommerce/next-ui'
import { t } from '@lingui/core/macro'
import type { LayoutNavigationProps } from '../components'
import { LayoutDocument, LayoutNavigation, productListRenderer } from '../components'
import { graphqlSharedClient, graphqlSsrClient } from '../lib/graphql/graphqlSsrClient'

export type CmsPageProps = { cmsPage: CmsPageFragment | null }

type GetPageStaticProps = GetStaticProps<LayoutNavigationProps, CmsPageProps>

// Helper to decode HTML entities
function decodeHtmlEntities(html: string): string {
  const txt = document.createElement('textarea')
  txt.innerHTML = html
  return txt.value
}

function HomePage(props: CmsPageProps) {
  const { cmsPage } = props

  if (!cmsPage) return <Container>Configure cmsPage home</Container>

  // Decode HTML entities if present
  const content = cmsPage.content
    ? cmsPage.content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
    : ''

  return (
    <>
      <PageMeta
        title={cmsPage.meta_title || cmsPage.title || t`Home`}
        metaDescription={cmsPage.meta_description || undefined}
      />
      <LayoutHeader floatingMd hideMd={breadcrumbs} floatingSm />

      {/* Temporary: Render CMS HTML directly until proper CMS is set up */}
      {content ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <CmsPageContent cmsPage={cmsPage} productListRenderer={productListRenderer} />
      )}
    </>
  )
}

HomePage.pageOptions = {
  Layout: LayoutNavigation,
} as PageOptions

export default HomePage

export const getStaticProps: GetPageStaticProps = async (context) => {
  const client = graphqlSharedClient(context)
  const conf = client.query({ query: StoreConfigDocument })
  const staticClient = graphqlSsrClient(context)

  const confData = (await conf).data
  const identifier = confData?.storeConfig?.cms_home_page ?? 'home'
  const cmsPageQuery = staticClient.query({ query: CmsPageDocument, variables: { identifier } })
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: cacheFirst(staticClient),
  })
  const cmsPage = (await cmsPageQuery).data?.cmsPage

  const result = {
    props: {
      cmsPage: cmsPage ?? null,
      ...(await layout).data,
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: revalidate(),
  }
  return result
}
