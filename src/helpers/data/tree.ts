import type { RouteLocationRaw } from 'vue-router'

type TreeNodeData = {
  name: string
  parent: string | null
  to: RouteLocationRaw
  opened: boolean
}

/**
 * A Node that can have a parent and children.
 */
class TreeNode {
  data: TreeNodeData | null = null
  depth: number = 0
  height: number = 0
  parent: AnyTreeNode | null = null
  id: string = 'root'
  children: TreeChildNode[] = []
  _remove: boolean = false

  /**
   * Invokes the specified `callback` for this node and each descendant in pre-order
   * traversal, such that a given node is only visited after all of its ancestors
   * have already been visited.
   * The specified function is passed the current descendant, the zero-based traversal
   * index, and this node.
   * Code taken and adapted from d3.js https://github.com/d3/d3-hierarchy/blob/main/src/hierarchy/eachBefore.js.
   */
  eachBefore(
    callback: (node: AnyTreeNode, index: number, root: TreeRootNode) => void,
  ) {
    const root = this as TreeRootNode
    const nodes: AnyTreeNode[] = []
    let index = -1
    let node: AnyTreeNode | undefined = root

    while (node) {
      callback(node, ++index, root)
      if (node.children) {
        nodes.push(...node.children)
      }
      node = nodes.pop()
    }

    return this
  }

  /**
   * Invokes the specified `callback` for this node and each descendant in post-order
   * traversal, such that a given node s only visited after all of its descendants
   * have already been visited
   * The specified function is passed the current descendant, the zero-based traversal
   * index, and this node.
   * Code taken and adapted from d3.js https://github.com/d3/d3-hierarchy/blob/main/src/hierarchy/eachAfter.js.
   */
  eachAfter(
    callback: (node: AnyTreeNode, index: number, root: TreeRootNode) => void,
  ) {
    const root = this as TreeRootNode
    const nodes: AnyTreeNode[] = []
    const next: AnyTreeNode[] = []
    let node: AnyTreeNode | undefined = root

    while (node) {
      next.push(node)
      if (node.children) {
        nodes.push(...node.children)
      }
      node = nodes.pop()
    }

    let index = 0
    for (let i = next.length - 1; i >= 0; i--) {
      callback(next[i], index++, root)
    }

    return root
  }

  /**
   * Returns a deep copied and filtered tree of itself.
   * Specified filter function is passed each nodes in post-order traversal and must
   * return `true` or `false` like a regular filter function.
   */
  filter(
    callback: (node: AnyTreeNode, index: number, root: TreeRootNode) => boolean,
  ) {
    const root = this as TreeRootNode
    // Duplicates this tree and iter on nodes from leaves to root (post-order traversal)
    return hierarchy(root).eachAfter((node, i) => {
      // Since we create a new hierarchy from another, nodes's `data` contains the
      // whole dupplicated node. Overwrite node's `data` by node's original `data`.

      if (node.children) {
        // Removed flagged children
        node.children = node.children.filter((child) => !child._remove)
      }

      // Perform filter callback on non-root nodes
      const match =
        node instanceof TreeChildNode ? callback(node, i, root) : true
      // Flag node if there's no match in node nor in its children
      if (!match && !node.children.length) {
        node._remove = true
      }
    })
  }

  get length(): number {
    return this.children.length
  }
}

export class TreeRootNode extends TreeNode {
  data: null = null
  parent: null = null
  id: 'root' = 'root' as const
}

export class TreeChildNode extends TreeNode {
  data: TreeNodeData
  parent: AnyTreeNode
  id: string

  constructor(data: TreeNodeData, parent: AnyTreeNode) {
    super()
    this.data = data
    this.parent = parent
    this.id = data.name
  }
}

export type AnyTreeNode = TreeRootNode | TreeChildNode
/**
 * Generates a new hierarchy from the specified tabular `dataset`.
 * The specified `dataset` must be an array of objects that contains at least a
 * `name` property and an optional `parent` property referencing its parent `name`.
 * Code taken and adapted from d3.js https://github.com/d3/d3-hierarchy/blob/main/src/stratify.js#L16.
 */
export function stratify(dataset: TreeNodeData[]) {
  const root = new TreeRootNode()
  const nodesMap: Map<TreeChildNode['id'], TreeChildNode> = new Map()

  // Creates all nodes that will be arranged in a hierarchy
  dataset.map((d) => {
    const parent = d.parent ? nodesMap.get(d.parent) || root : root
    const node = new TreeChildNode(d, parent)
    parent.children.push(node)
    nodesMap.set(node.id, node)
    return node
  })

  root.eachBefore((node) => {
    // Compute node depth
    if (node.parent) {
      node.depth = node.parent.depth + 1
      // Remove parent key if parent is root (node with no data)
    }
    computeNodeHeight(node)
  })

  return root
}

/**
 * Constructs a root node from the specified hierarchical `data`.
 * The specified `data` must be an object representing the root node and its children.
 * If given a `TreeRootNode` object this will return a deep copy of it.
 * Code taken and adapted from d3.js https://github.com/d3/d3-hierarchy/blob/main/src/hierarchy/index.js#L15.
 *
 * @param data - object representing a root node (a simple { id, children } object or a `TreeNode`)
 */
export function hierarchy(data: TreeRootNode) {
  function deepCopyNodes(nodes: TreeChildNode[], parent: AnyTreeNode) {
    return nodes.map((node) => {
      const copy = new TreeChildNode(node.data, parent)
      copy.depth = parent.depth + 1
      copy.children = deepCopyNodes(node.children, copy)
      return copy
    })
  }

  const root = new TreeRootNode()
  root.children = deepCopyNodes(data.children, root)
  root.eachBefore(computeNodeHeight)
  return root
}

/**
 * Compute the node height by iterating on parents
 * Code taken from d3.js https://github.com/d3/d3-hierarchy/blob/main/src/hierarchy/index.js#L62.
 */
function computeNodeHeight(node: TreeNode) {
  let node_: TreeNode | null = node
  let height = 0
  do {
    node_.height = height
    node_ = node_.parent
  } while (node_ && node_.height < ++height)
}
