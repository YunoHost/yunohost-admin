/**
 * A Node that can have a parent and children.
 */
export class Node {
  constructor (data) {
    this.data = data
    this.depth = 0
    this.height = 0
    this.parent = null
    // this.id = null
    // this.children = null
  }

  /**
   * Invokes the specified `callback` for this node and each descendant in pre-order
   * traversal, such that a given node is only visited after all of its ancestors
   * have already been visited.
   * The specified function is passed the current descendant, the zero-based traversal
   * index, and this node.
   * Code taken and adapted from d3.js https://github.com/d3/d3-hierarchy/blob/main/src/hierarchy/eachBefore.js.
   *
   * @param {function} callback
   * @return {Object}
   */
  eachBefore (callback) {
    const nodes = []
    let index = -1
    let node = this

    while (node) {
      callback(node, ++index, this)
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
   *
   * @param {function} callback
   * @return {Object}
   */
  eachAfter (callback) {
    const nodes = []
    const next = []
    let node = this

    while (node) {
      next.push(node)
      if (node.children) {
        nodes.push(...node.children)
      }
      node = nodes.pop()
    }

    let index = 0
    for (let i = next.length - 1; i >= 0; i--) {
      callback(next[i], index++, this)
    }

    return this
  }

  /**
   * Returns a deep copied and filtered tree of itself.
   * Specified filter function is passed each nodes in post-order traversal and must
   * return `true` or `false` like a regular filter function.
   *
   * @param {Function} callback - filter callback function to invoke on each nodes
   * @param {Object} args
   * @param {String} [args.idKey='name'] - the key name where we can find the node identity.
   * @param {String} [args.parentIdKey='name'] - the key name where we can find the parent identity.
   * @return {Node}
   */
  filter (callback) {
    // Duplicates this tree and iter on nodes from leaves to root (post-order traversal)
    return hierarchy(this).eachAfter((node, i) => {
      // Since we create a new hierarchy from another, nodes's `data` contains the
      // whole dupplicated node. Overwrite node's `data` by node's original `data`.
      node.data = node.data.data

      if (node.children) {
        // Removed flagged children
        node.children = node.children.filter(child => !child.remove)
        if (!node.children.length) delete node.children
      }

      // Perform filter callback on non-root nodes
      const match = node.data ? callback(node, i, this) : true
      // Flag node if there's no match in node nor in its children
      if (!match && !node.children) {
        node.remove = true
      }
    })
  }
}


/**
 * Generates a new hierarchy from the specified tabular `dataset`.
 * The specified `dataset` must be an array of objects that contains at least a
 * `name` property and an optional `parent` property referencing its parent `name`.
 * Code taken and adapted from d3.js https://github.com/d3/d3-hierarchy/blob/main/src/stratify.js#L16.
 *
 * @param {Array} dataset
 * @param {Object} args
 * @param {String} [args.idKey='name'] - the key name where we can find the node identity.
 * @param {String} [args.parentIdKey='name'] - the key name where we can find the parent identity.
 * @return {Node}
 */
export function stratify (dataset, { idKey = 'name', parentIdKey = 'parent' } = {}) {
  const root = new Node(null, true)
  root.children = []
  const nodesMap = new Map()

  // Creates all nodes that will be arranged in a hierarchy
  const nodes = dataset.map(d => {
    const node = new Node(d)
    node.id = d[idKey]
    nodesMap.set(node.id, node)
    if (d[parentIdKey]) {
      node.parent = d[parentIdKey]
    }
    return node
  })

  // Build a hierarchy from nodes
  nodes.forEach((node, i) => {
    const parentId = node.parent
    if (parentId) {
      const parent = nodesMap.get(parentId)
      if (!parent) throw new Error('Missing parent node: ' + parentId)
      if (parent.children) parent.children.push(node)
      else parent.children = [node]
      node.parent = parent
    } else {
      node.parent = root
      root.children.push(node)
    }
  })

  root.eachBefore(node => {
    // Compute node depth
    if (node.parent) {
      node.depth = node.parent.depth + 1
      // Remove parent key if parent is root (node with no data)
      if (!node.parent.data) delete node.parent
    }
    computeNodeHeight(node)
  })
  return root
}


/**
 * Constructs a root node from the specified hierarchical `data`.
 * The specified `data` must be an object representing the root node and its children.
 * If given a `Node` object this will return a deep copy of it.
 * Code taken and adapted from d3.js https://github.com/d3/d3-hierarchy/blob/main/src/hierarchy/index.js#L15.
 *
 * @param {Node|Object} data - object representing a root node (a simple { id, children } object or a `Node`)
 * @return {Node}
 */
export function hierarchy (data) {
  const root = new Node(data)
  const nodes = []
  let node = root

  while (node) {
    if (node.data.children) {
      node.children = node.data.children.map(child_ => {
        const child = new Node(child_)
        child.id = child_.id
        child.parent = node === root ? null : node
        child.depth = node.depth + 1
        nodes.push(child)
        return child
      })
    }
    node = nodes.pop()
  }

  root.eachBefore(computeNodeHeight)
  return root
}


/**
 * Compute the node height by iterating on parents
 * Code taken from d3.js https://github.com/d3/d3-hierarchy/blob/main/src/hierarchy/index.js#L62.
 *
 * @param {Node} node
 */
function computeNodeHeight (node) {
  let height = 0
  do {
    node.height = height
    node = node.parent
  } while (node && node.height < ++height)
}
