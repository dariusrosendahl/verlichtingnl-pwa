import { iconChevronRight, IconSvg } from '@graphcommerce/next-ui'
import { Box, Link, Paper, Popper, styled } from '@mui/material'
import NextLink from 'next/link'
import { useState, useRef, useMemo } from 'react'
import type { SnowdogMenuNodeFragment } from '../../graphql/SnowdogMenu.gql'
import type { LayoutQuery } from './Layout.gql'

type SnowdogMenuNode = SnowdogMenuNodeFragment
type CategoryItem = NonNullable<NonNullable<LayoutQuery['categories']>['items']>[number]

interface MegaMenuProps {
  items: (SnowdogMenuNode | null)[] | null | undefined
  categories?: LayoutQuery['categories']
}

interface MegaMenuItemProps {
  item: SnowdogMenuNode
  allItems: (SnowdogMenuNode | null)[]
  categoryUrlMap: Map<string, string>
}

// Decode base64 UID to get category ID
function decodeUid(uid: string): string {
  try {
    return atob(uid)
  } catch {
    return uid
  }
}

// Build a flat map of category ID -> url_path from nested category structure
function buildCategoryUrlMap(categories: LayoutQuery['categories']): Map<string, string> {
  const map = new Map<string, string>()

  function traverse(items: (CategoryItem | null)[] | null | undefined) {
    if (!items) return
    for (const item of items) {
      if (!item) continue
      const categoryId = decodeUid(item.uid)
      if (item.url_path) {
        map.set(categoryId, item.url_path)
      }
      traverse(item.children)
    }
  }

  traverse(categories?.items)
  return map
}

const NavItem = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1, 1.5),
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}))

const MegaMenuPanel = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(3),
  minWidth: 600,
  maxWidth: 900,
  boxShadow: theme.shadows[8],
  borderRadius: theme.shape.borderRadius,
}))

const CategoryColumn = styled(Box)(({ theme }) => ({
  minWidth: 180,
}))

const CategoryTitle = styled(Link)(({ theme }) => ({
  display: 'block',
  fontWeight: 600,
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}))

const SubcategoryLink = styled(Link)(({ theme }) => ({
  display: 'block',
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.5, 0),
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}))

function buildHref(node: SnowdogMenuNode, categoryUrlMap: Map<string, string>): string {
  // For category nodes, look up the URL path from the category data
  if (node.type === 'category' && 'content' in node && node.content) {
    const urlPath = categoryUrlMap.get(node.content)
    if (urlPath) {
      return `/${urlPath}`
    }
  }

  // For other nodes with url_key
  const urlKey = node.url_key
  if (!urlKey) return '#'
  if (urlKey.startsWith('http://') || urlKey.startsWith('https://') || urlKey.startsWith('#')) {
    return urlKey
  }
  return urlKey.startsWith('/') ? urlKey : `/${urlKey}`
}

function getChildNodes(parentId: number, allItems: (SnowdogMenuNode | null)[]): SnowdogMenuNode[] {
  return allItems
    .filter((item): item is SnowdogMenuNode =>
      item !== null && item.parent_id === parentId
    )
    .sort((a, b) => a.position - b.position)
}

function MegaMenuItem({ item, allItems, categoryUrlMap }: MegaMenuItemProps) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLAnchorElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const childNodes = getChildNodes(item.node_id, allItems)
  const hasChildren = childNodes.length > 0
  const itemHref = buildHref(item, categoryUrlMap)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 150)
  }

  // Group children into columns (max 8 items per column)
  const columns: SnowdogMenuNode[][] = []
  const itemsPerColumn = 8
  for (let i = 0; i < childNodes.length; i += itemsPerColumn) {
    columns.push(childNodes.slice(i, i + itemsPerColumn))
  }

  return (
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ display: 'inline-block' }}
    >
      <NavItem ref={anchorRef} component={NextLink} href={itemHref}>
        {item.title}
        {hasChildren && <IconSvg src={iconChevronRight} size='small' sx={{ transform: 'rotate(90deg)' }} />}
      </NavItem>

      {hasChildren && (
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement='bottom-start'
          sx={{ zIndex: 1300 }}
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 4],
              },
            },
          ]}
        >
          <MegaMenuPanel onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {columns.map((column, colIndex) => (
                <CategoryColumn key={colIndex}>
                  {column.map((child) => {
                    const grandchildren = getChildNodes(child.node_id, allItems)
                    const href = buildHref(child, categoryUrlMap)

                    return (
                      <Box key={child.node_id} sx={{ mb: 2 }}>
                        <CategoryTitle component={NextLink} href={href}>
                          {child.title}
                        </CategoryTitle>
                        {grandchildren.slice(0, 5).map((grandchild) => (
                          <SubcategoryLink
                            key={grandchild.node_id}
                            component={NextLink}
                            href={buildHref(grandchild, categoryUrlMap)}
                          >
                            {grandchild.title}
                          </SubcategoryLink>
                        ))}
                        {grandchildren.length > 5 && (
                          <SubcategoryLink
                            component={NextLink}
                            href={href}
                            sx={{ fontStyle: 'italic' }}
                          >
                            Bekijk alle...
                          </SubcategoryLink>
                        )}
                      </Box>
                    )
                  })}
                </CategoryColumn>
              ))}
            </Box>
          </MegaMenuPanel>
        </Popper>
      )}
    </Box>
  )
}

export function MegaMenu({ items, categories }: MegaMenuProps) {
  const categoryUrlMap = useMemo(() => buildCategoryUrlMap(categories), [categories])

  if (!items || items.length === 0) return null

  // Get root items (parent_id is null or 0)
  const rootItems = items
    .filter((item): item is SnowdogMenuNode =>
      item !== null && (item.parent_id === null || item.parent_id === 0)
    )
    .sort((a, b) => a.position - b.position)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {rootItems.map((item) => (
        <MegaMenuItem
          key={item.node_id}
          item={item}
          allItems={items.filter((i): i is SnowdogMenuNode => i !== null)}
          categoryUrlMap={categoryUrlMap}
        />
      ))}
    </Box>
  )
}
