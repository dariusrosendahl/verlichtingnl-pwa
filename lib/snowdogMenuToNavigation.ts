import type { NavigationNode, NavigationNodeButton } from '@graphcommerce/next-ui'
import { NavigationNodeType } from '@graphcommerce/next-ui'
import type { SnowdogMenuNodeFragment } from '../graphql/SnowdogMenu.gql'

type SnowdogMenuNode = SnowdogMenuNodeFragment

/**
 * Transforms Snowdog Menu nodes into NavigationProvider-compatible items.
 * Handles the flat node structure with parent_id/level/position and converts it
 * to the hierarchical NavigationNode structure expected by GraphCommerce.
 *
 * @param nodes - Array of Snowdog Menu nodes from GraphQL query
 * @param includeRoot - Whether to include root level items (level 0) or only their children
 * @returns Array of NavigationNode items for the NavigationProvider
 */
export function snowdogMenuToNavigation(
  nodes: (SnowdogMenuNode | null | undefined)[] | null | undefined,
  includeRoot = true,
): NavigationNode[] {
  if (!nodes || nodes.length === 0) return []

  // Filter out null nodes and sort by position
  const validNodes = nodes
    .filter((node): node is SnowdogMenuNode => node !== null && node !== undefined)
    .sort((a, b) => a.position - b.position)

  // Build a map of node_id to node for quick lookup
  const nodeMap = new Map<number, SnowdogMenuNode>()
  validNodes.forEach((node) => {
    nodeMap.set(node.node_id, node)
  })

  // Build a map of parent_id to children
  const childrenMap = new Map<number | null, SnowdogMenuNode[]>()
  validNodes.forEach((node) => {
    const parentId = node.parent_id ?? null
    const siblings = childrenMap.get(parentId) || []
    siblings.push(node)
    childrenMap.set(parentId, siblings)
  })

  // Recursively build navigation nodes
  function buildNavigationNodes(parentId: number | null): NavigationNode[] {
    const children = childrenMap.get(parentId) || []

    return children
      .filter((node) => {
        // Skip wrapper nodes that are purely structural
        if (node.type === 'wrapper' && !node.title) return false
        return true
      })
      .map((node) => {
        const childNodes = buildNavigationNodes(node.node_id)
        const href = buildHref(node)
        const id = `snowdog-${node.node_id}`

        // If node has children, create a button node (expandable menu item)
        if (childNodes.length > 0) {
          const buttonNode: NavigationNodeButton = {
            id,
            name: node.title || '',
            type: NavigationNodeType.BUTTON,
            href: href || undefined,
            childItems: childNodes,
          }
          return buttonNode
        }

        // Leaf node - create a simple link
        return {
          id,
          name: node.title || '',
          href: href || '#',
        } satisfies NavigationNode
      })
  }

  // Build href from node data
  function buildHref(node: SnowdogMenuNode): string | null {
    const urlKey = node.url_key

    if (!urlKey) return null

    // Handle external URLs (already absolute)
    if (urlKey.startsWith('http://') || urlKey.startsWith('https://')) {
      return urlKey
    }

    // Handle anchor links
    if (urlKey.startsWith('#')) {
      return urlKey
    }

    // Ensure internal URLs start with /
    if (urlKey.startsWith('/')) {
      return urlKey
    }

    return `/${urlKey}`
  }

  // Get root items (nodes with no parent or parent_id = 0)
  // parent_id of null or 0 typically indicates root level
  const rootNodes = buildNavigationNodes(null)

  // Also check for parent_id = 0 as some implementations use that
  const rootNodesZero = buildNavigationNodes(0)
  const allRootNodes = [...rootNodes, ...rootNodesZero]

  if (includeRoot) {
    return allRootNodes
  }

  // If not including root, flatten first level children
  return allRootNodes.flatMap((node) => {
    if ('childItems' in node && node.childItems) {
      return node.childItems
    }
    return [node]
  })
}

/**
 * Gets the first N root-level menu items for desktop navigation display.
 * Useful for showing top-level categories directly in the navbar.
 */
export function getSnowdogMenuRootItems(
  nodes: (SnowdogMenuNode | null | undefined)[] | null | undefined,
  count = 2,
): SnowdogMenuNode[] {
  if (!nodes) return []

  return nodes
    .filter((node): node is SnowdogMenuNode => {
      if (!node) return false
      // Root level nodes have parent_id of null or 0
      return node.parent_id === null || node.parent_id === 0
    })
    .sort((a, b) => a.position - b.position)
    .slice(0, count)
}
