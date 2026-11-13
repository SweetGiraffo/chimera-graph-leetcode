import { Problem } from '../../types/problem';

export const MODULE_1_PROBLEMS: Problem[] = [
  {
    id: 'm1-p1',
    moduleId: 'module-1',
    order: 1,
    title: 'Construct Weighted Adjacency Matrix',
    difficulty: 'Easy',
    tags: ['Graph Representation', 'Adjacency Matrix', 'Linear Algebra'],
    funcName: 'construct_adj_matrix',
    description: `You are given the number of nodes $n$ in a directed graph (with 0-indexed nodes $0, 1, \\dots, n-1$) and an edge list where each edge is represented as a triple \`[u, v, w]\`, denoting a directed edge from node $u$ to node $v$ with weight $w$.

If there are duplicate edges between the same ordered pair $(u, v)$, their weights should be summed together. Self-loops are permitted.

Return the $n \\times n$ weighted adjacency matrix $A$ as a list of lists of floats, where $A[u][v]$ is the total weight of edges from $u$ to $v$, and $0.0$ if no edge exists.`,
    mathematicalExplanation: `A directed weighted graph $G = (V, E, W)$ with $|V| = n$ vertices is represented by an adjacency matrix $A \\in \\mathbb{R}^{n \\times n}$:
$$A_{uv} = \\sum_{(u, v, w) \\in E} w$$
For any pair $(u, v)$ with no direct edge, $A_{uv} = 0$. Note that for directed graphs, $A$ is generally **asymmetric** ($A_{uv} \\neq A_{vu}$).`,
    chimeraContext: `In Chimera, multi-modal entity extraction yields subject-predicate-object triples with extraction confidence weights (e.g. \`[CUDA, DEVELOPED_BY, NVIDIA, 0.95]\`). Before running graph propagation, multiple mentions of identical relations are aggregated into this initial weighted adjacency matrix.`,
    examples: [
      {
        input: 'n = 3, edges = [[0, 1, 2.5], [1, 2, 1.0], [0, 2, 0.5]]',
        output: '[[0.0, 2.5, 0.5], [0.0, 0.0, 1.0], [0.0, 0.0, 0.0]]',
        explanation: 'Node 0 has edges to 1 (weight 2.5) and 2 (weight 0.5). Node 1 has an edge to 2 (weight 1.0). Node 2 has no outgoing edges.'
      },
      {
        input: 'n = 2, edges = [[0, 1, 1.5], [0, 1, 2.5], [1, 0, 3.0]]',
        output: '[[0.0, 4.0], [3.0, 0.0]]',
        explanation: 'Duplicate edges from 0 to 1 are summed: 1.5 + 2.5 = 4.0.'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      '0 <= len(edges) <= 1000',
      '0 <= u, v < n',
      '0.0 <= w <= 100.0'
    ],
    expectedComplexity: {
      time: 'O(n^2 + |E|)',
      space: 'O(n^2)'
    },
    starterCode: `def construct_adj_matrix(n: int, edges: list[list[float]]) -> list[list[float]]:
    """
    Constructs an n x n weighted adjacency matrix from an edge list.
    
    Args:
        n: Number of nodes in the graph (0 to n-1).
        edges: List of [u, v, w] where u -> v has weight w.
        
    Returns:
        n x n nested list of floats representing matrix A.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def construct_adj_matrix(n: int, edges: list[list[float]]) -> list[list[float]]:
    adj = [[0.0 for _ in range(n)] for _ in range(n)]
    for edge in edges:
        u = int(edge[0])
        v = int(edge[1])
        w = float(edge[2])
        adj[u][v] += w
    return adj
`,
    editorial: `### Algorithmic Approach

1. **Initialization:** Allocate an $n \\times n$ zero matrix represented as a list of lists of floats.
2. **Edge Accumulation:** Iterate through each triple \`[u, v, w]\`. Cast $u, v$ to integers and add $w$ to \`adj[u][v]\`. Using \`+=\` naturally handles duplicate edges between the same node pair by accumulating their weights.
3. **Complexity:** Initializing the $n \\times n$ matrix takes $O(n^2)$ time. Processing $|E|$ edges takes $O(|E|)$ time. Total time complexity is $O(n^2 + |E|)$, with $O(n^2)$ space for the matrix representation.`,
    hints: [
      'Initialize an n by n grid with 0.0 using list comprehension: [[0.0] * n for _ in range(n)].',
      'Remember to add (+=) the weight rather than overwrite (=), in case the same edge appears multiple times.',
      'Be careful with index ordering: A[u][v] represents an edge directed FROM u TO v.'
    ],
    testCases: [
      {
        inputs: [3, [[0, 1, 2.5], [1, 2, 1.0], [0, 2, 0.5]]],
        expected: [[0.0, 2.5, 0.5], [0.0, 0.0, 1.0], [0.0, 0.0, 0.0]]
      },
      {
        inputs: [2, [[0, 1, 1.5], [0, 1, 2.5], [1, 0, 3.0]]],
        expected: [[0.0, 4.0], [3.0, 0.0]]
      },
      {
        inputs: [1, [[0, 0, 5.0]]],
        expected: [[5.0]]
      },
      {
        inputs: [4, []],
        expected: [[0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0]],
        hidden: true
      },
      {
        inputs: [3, [[0, 1, 1.0], [1, 0, 2.0], [1, 2, 3.0], [2, 1, 4.0], [0, 2, 0.5]]],
        expected: [[0.0, 1.0, 0.5], [2.0, 0.0, 3.0], [0.0, 4.0, 0.0]],
        hidden: true
      }
    ],
    defaultCustomInput: '3, [[0, 1, 2.5], [1, 2, 1.0], [0, 2, 0.5]]',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm1-p2',
    moduleId: 'module-1',
    order: 2,
    title: 'Calculate Weighted In-Degree and Out-Degree',
    difficulty: 'Easy',
    tags: ['Graph Metrics', 'Matrix Operations', 'Degree Centrality'],
    funcName: 'calculate_degrees',
    description: `Given an $n \\times n$ weighted adjacency matrix $A$ of a directed graph, compute both the weighted out-degree and weighted in-degree for each node.

- The **weighted out-degree** of node $u$ is the sum of weights of all edges leaving $u$.
- The **weighted in-degree** of node $v$ is the sum of weights of all edges entering $v$.

Return a tuple \`(out_degrees, in_degrees)\`, where both are lists of floats of length $n$. Round each degree to 4 decimal places.`,
    mathematicalExplanation: `Given adjacency matrix $A \\in \\mathbb{R}^{n \\times n}$:
- The **weighted out-degree vector** $\\mathbf{d}_{out} \\in \\mathbb{R}^n$ corresponds to the **row sums**:
  $$(\\mathbf{d}_{out})_u = \\sum_{v=0}^{n-1} A_{uv} = (A \\mathbf{1})_u$$
- The **weighted in-degree vector** $\\mathbf{d}_{in} \\in \\mathbb{R}^n$ corresponds to the **column sums**:
  $$(\\mathbf{d}_{in})_v = \\sum_{u=0}^{n-1} A_{uv} = (A^T \\mathbf{1})_v$$`,
    chimeraContext: `In Chimera\'s Knowledge Graph, highly connected entities (high in-degree) often represent generic concepts or hubs (like "Machine Learning" or "Algorithm"), while entities with low in-degree may be highly specific technical artifacts. Degree discounting is used during seed entity weighting.`,
    examples: [
      {
        input: 'adj = [[0.0, 2.5, 0.5], [0.0, 0.0, 1.0], [0.0, 0.0, 0.0]]',
        output: '([3.0, 1.0, 0.0], [0.0, 2.5, 1.5])',
        explanation: 'Node 0 out-degree = 2.5 + 0.5 = 3.0. Node 1 in-degree = 2.5. Node 2 in-degree = 0.5 + 1.0 = 1.5.'
      }
    ],
    constraints: [
      '1 <= n <= 200',
      'len(adj) == n and len(adj[i]) == n for all i',
      '0.0 <= adj[i][j] <= 1000.0'
    ],
    expectedComplexity: {
      time: 'O(n^2)',
      space: 'O(n)'
    },
    starterCode: `def calculate_degrees(adj: list[list[float]]) -> tuple[list[float], list[float]]:
    """
    Computes weighted out-degrees (row sums) and in-degrees (column sums).
    
    Args:
        adj: n x n weighted adjacency matrix.
        
    Returns:
        (out_degrees, in_degrees) as a pair of lists of floats.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def calculate_degrees(adj: list[list[float]]) -> tuple[list[float], list[float]]:
    n = len(adj)
    out_degrees = [round(sum(adj[i]), 4) for i in range(n)]
    in_degrees = [round(sum(adj[i][j] for i in range(n)), 4) for j in range(n)]
    return out_degrees, in_degrees
`,
    editorial: `### Algorithmic Approach

1. **Row Sums (Out-degree):** For each row $i$, the sum of all elements in that row represents total weight emitted by node $i$. In Python, \`sum(adj[i])\` computes this in $O(n)$ time per row.
2. **Column Sums (In-degree):** For each column $j$, the sum of all elements across rows $i=0 \\dots n-1$ represents the incoming weight into node $j$.
3. **Linear Algebra Perspective:** If $\\mathbf{1}$ is the all-ones vector of length $n$, then:
   $$\\mathbf{d}_{out} = A \\mathbf{1}, \\quad \\mathbf{d}_{in} = A^T \\mathbf{1}$$`,
    hints: [
      'Out-degree of node i is simply the sum of row i.',
      'In-degree of node j is the sum of column j, i.e., sum(adj[i][j] for i in range(n)).',
      'Make sure you return a tuple of two lists: (out_degrees, in_degrees).'
    ],
    testCases: [
      {
        inputs: [[[0.0, 2.5, 0.5], [0.0, 0.0, 1.0], [0.0, 0.0, 0.0]]],
        expected: [[3.0, 1.0, 0.0], [0.0, 2.5, 1.5]]
      },
      {
        inputs: [[[1.0, 2.0], [3.0, 4.0]]],
        expected: [[3.0, 7.0], [4.0, 6.0]]
      },
      {
        inputs: [[[0.0, 0.0], [0.0, 0.0]]],
        expected: [[0.0, 0.0], [0.0, 0.0]]
      },
      {
        inputs: [[[0.5, 1.5, 0.0], [0.0, 0.5, 2.0], [1.0, 0.0, 0.5]]],
        expected: [[2.0, 2.5, 1.5], [1.5, 2.0, 2.5]],
        hidden: true
      }
    ],
    defaultCustomInput: '[[0.0, 2.5, 0.5], [0.0, 0.0, 1.0], [0.0, 0.0, 0.0]]',
    suggestedVisualizer: 'matrix-heatmap'
  },
  {
    id: 'm1-p3',
    moduleId: 'module-1',
    order: 3,
    title: 'Convert Adjacency Matrix to Row-Stochastic Matrix',
    difficulty: 'Easy',
    tags: ['Markov Matrix', 'Normalization', 'Probability'],
    funcName: 'to_row_stochastic',
    description: `A **row-stochastic matrix** (or right stochastic matrix) is a square matrix of non-negative real numbers where each row sums to $1.0$:
$$\\sum_{j=0}^{n-1} P_{ij} = 1.0 \\quad \\forall i$$

Given an $n \\times n$ non-negative weighted adjacency matrix $A$:
1. If node $i$ has an out-degree $d_{out}(i) > 0$, normalize its row: $P_{ij} = \\frac{A_{ij}}{d_{out}(i)}$.
2. If node $i$ has an out-degree $d_{out}(i) = 0$ (a **dangling node** or sink), leave its row as all zeros ($0.0$).

Return the resulting transition matrix $P$ as a list of lists of floats. Round values to 4 decimal places.`,
    mathematicalExplanation: `Let $D_{out} = \\text{diag}(\\mathbf{d}_{out})$. When $\\mathbf{d}_{out}(i) > 0$:
$$P = D_{out}^{-1} A$$
Element-wise:
$$P_{ij} = \\frac{A_{ij}}{\\sum_{k=0}^{n-1} A_{ik}}$$
Each entry $P_{ij}$ represents the conditional transition probability $P(X_{t+1} = j \\mid X_t = i)$ of a random surfer moving from state $i$ to state $j$.`,
    chimeraContext: `Before random walk propagation can occur in Chimera, entity-entity relation weights must be converted into valid transition probabilities. Row normalization guarantees that the probability mass is conserved at each step.`,
    examples: [
      {
        input: 'adj = [[0.0, 2.0, 2.0], [0.0, 0.0, 5.0], [0.0, 0.0, 0.0]]',
        output: '[[0.0, 0.5, 0.5], [0.0, 0.0, 1.0], [0.0, 0.0, 0.0]]',
        explanation: 'Row 0 sum is 4.0; dividing by 4 gives [0.0, 0.5, 0.5]. Row 1 sum is 5.0; dividing by 5 gives [0.0, 0.0, 1.0]. Row 2 sum is 0, so it remains all zeros.'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      'adj is n x n with non-negative entries'
    ],
    expectedComplexity: {
      time: 'O(n^2)',
      space: 'O(n^2)'
    },
    starterCode: `def to_row_stochastic(adj: list[list[float]]) -> list[list[float]]:
    """
    Converts an adjacency matrix into a row-stochastic transition matrix.
    Rows with out-degree 0 remain all zeros.
    
    Args:
        adj: n x n weighted adjacency matrix.
        
    Returns:
        n x n row-normalized matrix P.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def to_row_stochastic(adj: list[list[float]]) -> list[list[float]]:
    n = len(adj)
    P = []
    for i in range(n):
        row_sum = sum(adj[i])
        if row_sum > 0:
            P.append([round(val / row_sum, 4) for val in adj[i]])
        else:
            P.append([0.0 for _ in range(n)])
    return P
`,
    editorial: `### Algorithmic Approach

1. Iterate through each row $i \\in [0, n-1]$.
2. Calculate the row sum $S_i = \\sum_{j=0}^{n-1} A_{ij}$.
3. If $S_i > 0$, divide each element in row $i$ by $S_i$: $P_{ij} = A_{ij} / S_i$.
4. If $S_i == 0$, node $i$ has no outgoing edges (a dangling node). In this basic version, we output an all-zero row. (In subsequent problems, we will resolve dangling nodes via uniform teleportation).`,
    hints: [
      'Compute the sum of each row first.',
      'Check if row_sum > 0 before dividing to avoid ZeroDivisionError.',
      'Round each quotient to 4 decimal places using round(val / row_sum, 4).'
    ],
    testCases: [
      {
        inputs: [[[0.0, 2.0, 2.0], [0.0, 0.0, 5.0], [0.0, 0.0, 0.0]]],
        expected: [[0.0, 0.5, 0.5], [0.0, 0.0, 1.0], [0.0, 0.0, 0.0]]
      },
      {
        inputs: [[[1.0, 1.0], [2.0, 6.0]]],
        expected: [[0.5, 0.5], [0.25, 0.75]]
      },
      {
        inputs: [[[0.0, 0.0], [0.0, 0.0]]],
        expected: [[0.0, 0.0], [0.0, 0.0]]
      },
      {
        inputs: [[[10.0, 0.0, 0.0], [0.0, 0.0, 0.0], [2.0, 3.0, 5.0]]],
        expected: [[1.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.2, 0.3, 0.5]],
        hidden: true
      }
    ],
    defaultCustomInput: '[[0.0, 2.0, 2.0], [0.0, 0.0, 5.0], [0.0, 0.0, 0.0]]',
    suggestedVisualizer: 'matrix-heatmap'
  },
  {
    id: 'm1-p4',
    moduleId: 'module-1',
    order: 4,
    title: 'Handling Dangling Nodes in Row Normalization',
    difficulty: 'Medium',
    tags: ['Dangling Nodes', 'Stochastic Matrices', 'PageRank Foundation'],
    funcName: 'handle_dangling_nodes',
    description: `A **dangling node** (or absorbing state / dead end) is a node with out-degree zero. In a random walk, once a surfer reaches a dangling node, probability mass is leaked or trapped.

Given an $n \\times n$ weighted adjacency matrix $A$ and an optional non-negative personalization vector $v$ of length $n$ (where $\\sum v_i = 1.0$):
1. For any node $i$ with out-degree $d_{out}(i) > 0$, normalize its row: $P_{ij} = \\frac{A_{ij}}{d_{out}(i)}$.
2. For any dangling node $i$ with out-degree $d_{out}(i) = 0$:
   - If vector $v$ is provided, replace row $i$ with $v$: $P_{ij} = v_j$.
   - If vector $v$ is \`None\` or empty, replace row $i$ with a uniform teleportation distribution: $P_{ij} = \\frac{1}{n}$.

Return the resulting strictly row-stochastic matrix $P$ where every single row sums to $1.0$. Round values to 4 decimal places.`,
    mathematicalExplanation: `Let $\\mathbf{d} \\in \\{0, 1\\}^n$ be the dangling node indicator vector, where $d_i = 1$ if $\\sum_j A_{ij} = 0$, and $0$ otherwise.
The complete stochastic transition matrix $\\bar{P}$ is defined as:
$$\\bar{P} = P + \\mathbf{d} \\mathbf{v}^T$$
where $P$ has row-normalized entries for non-dangling nodes and 0 elsewhere, and $\\mathbf{v}$ is the teleportation vector (defaulting to $\\frac{1}{n} \\mathbf{1}$).
This ensures that $\\sum_{j=0}^{n-1} \\bar{P}_{ij} = 1.0$ for all $i$.`,
    chimeraContext: `In cross-modal knowledge graphs, entity leaves (such as image timestamp attributes or leaf scalar properties) frequently have no outgoing relationships. Handling dangling nodes ensures Personalized PageRank does not lose total probability mass during power iteration.`,
    examples: [
      {
        input: 'adj = [[0.0, 4.0], [0.0, 0.0]], v = None',
        output: '[[0.0, 1.0], [0.5, 0.5]]',
        explanation: 'Node 1 has out-degree 0. Since v is None, row 1 is replaced by uniform 1/2 = 0.5.'
      },
      {
        input: 'adj = [[0.0, 2.0, 2.0], [0.0, 0.0, 0.0], [1.0, 0.0, 0.0]], v = [0.8, 0.1, 0.1]',
        output: '[[0.0, 0.5, 0.5], [0.8, 0.1, 0.1], [1.0, 0.0, 0.0]]',
        explanation: 'Node 1 is dangling; its row is replaced with v = [0.8, 0.1, 0.1].'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      'adj is non-negative n x n',
      'v is either None or length n with sum(v) == 1.0'
    ],
    expectedComplexity: {
      time: 'O(n^2)',
      space: 'O(n^2)'
    },
    starterCode: `def handle_dangling_nodes(adj: list[list[float]], v: list[float] | None = None) -> list[list[float]]:
    """
    Constructs a strictly row-stochastic matrix by substituting dangling rows
    with teleportation distribution v (or uniform 1/n if v is None).
    
    Args:
        adj: n x n non-negative adjacency matrix.
        v: Optional teleportation vector of length n.
        
    Returns:
        n x n strictly row-stochastic matrix.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def handle_dangling_nodes(adj: list[list[float]], v: list[float] | None = None) -> list[list[float]]:
    n = len(adj)
    teleport = [round(x, 4) for x in v] if v is not None and len(v) == n else [round(1.0 / n, 4) for _ in range(n)]
    
    P = []
    for i in range(n):
        row_sum = sum(adj[i])
        if row_sum > 0:
            P.append([round(val / row_sum, 4) for val in adj[i]])
        else:
            P.append(list(teleport))
    return P
`,
    editorial: `### Mathematical Derivation

In standard Markov chain theory, a transition matrix must be row-stochastic (stochastic along rows): $\\forall i, \\sum_j P_{ij} = 1$.
When an entity in a knowledge graph has out-degree $0$, it acts as an absorbing dead end:
- If unhandled, repeatedly multiplying $p^{(t+1)} = p^{(t)} P$ causes $\\|p^{(t)}\\|_1 \\to 0$ (probability leakage).
- Google\'s original PageRank and Chimera resolve this by treating dangling nodes as teleporting uniformly to all nodes (or back to query seed entities $v$).`,
    hints: [
      'Compute the teleportation vector: if v is None, each element is 1.0 / n.',
      'For each row, if sum(row) == 0, replace the entire row with the teleportation vector.',
      'Ensure every row in the output sums to 1.0.'
    ],
    testCases: [
      {
        inputs: [[[0.0, 4.0], [0.0, 0.0]], null],
        expected: [[0.0, 1.0], [0.5, 0.5]]
      },
      {
        inputs: [[[0.0, 2.0, 2.0], [0.0, 0.0, 0.0], [1.0, 0.0, 0.0]], [0.8, 0.1, 0.1]],
        expected: [[0.0, 0.5, 0.5], [0.8, 0.1, 0.1], [1.0, 0.0, 0.0]]
      },
      {
        inputs: [[[0.0]], null],
        expected: [[1.0]]
      },
      {
        inputs: [[[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]], [0.2, 0.5, 0.3]],
        expected: [[0.2, 0.5, 0.3], [0.2, 0.5, 0.3], [0.2, 0.5, 0.3]],
        hidden: true
      }
    ],
    defaultCustomInput: '[[0.0, 4.0], [0.0, 0.0]], None',
    suggestedVisualizer: 'matrix-heatmap'
  },
  {
    id: 'm1-p5',
    moduleId: 'module-1',
    order: 5,
    title: 'Sparse Transition Matrix-Vector Multiplication',
    difficulty: 'Medium',
    tags: ['Sparse Matrix', 'CSR Format', 'Performance Optimization'],
    funcName: 'sparse_vector_mult',
    description: `Real knowledge graphs have millions of entities but each entity has only a few edges (sparsity $> 99.9\\%$). Storing dense matrices is infeasible.

One standard sparse format is **Compressed Sparse Row (CSR)**:
- \`values\`: list of non-zero transition probabilities.
- \`col_indices\`: column index corresponding to each value in \`values\`.
- \`row_ptr\`: list of length $n + 1$, where \`row_ptr[i]\` to \`row_ptr[i+1]\` defines the slice of \`values\` and \`col_indices\` belonging to row $i$.

Given a probability row vector $p$ of length $n$ and a transition matrix $P$ in CSR format, compute the next probability vector $p_{next} = p \\cdot P$.

Note: in Markov chain notation, $p$ is a row vector, so:
$$p_{next}[j] = \\sum_{i=0}^{n-1} p[i] \\cdot P[i][j]$$
Return $p_{next}$ as a list of floats, rounded to 4 decimal places.`,
    mathematicalExplanation: `For a row vector $p \\in \\mathbb{R}^{1 \\times n}$ and matrix $P \\in \\mathbb{R}^{n \\times n}$:
$$p_{next} = p P$$
In CSR format, row $i$ has non-zero entries at columns $c = \\text{col\\_indices}[k]$ with value $w = \\text{values}[k]$ for $k \\in [\\text{row\\_ptr}[i], \\text{row\\_ptr}[i+1])$.
Instead of accumulating by column, we iterate through each row $i$:
If $p[i] > 0$, for each non-zero entry $(c, w)$ in row $i$, we accumulate:
$$p_{next}[c] \\mathrel{+}= p[i] \\times w$$
This takes $O(\\text{nnz})$ time instead of $O(n^2)$.`,
    chimeraContext: `In Chimera, during Personalized PageRank on large enterprise knowledge graphs (100k+ nodes), dense matrix multiplication causes Out-Of-Memory (OOM) errors. CSR vector-matrix operations allow thousands of iterations in milliseconds.`,
    examples: [
      {
        input: 'p = [0.6, 0.4], values = [0.5, 0.5, 1.0], col_indices = [0, 1, 0], row_ptr = [0, 2, 3]',
        output: '[0.7, 0.3]',
        explanation: 'Row 0 has values P[0][0]=0.5, P[0][1]=0.5. Row 1 has P[1][0]=1.0. p * P = [0.6*0.5 + 0.4*1.0, 0.6*0.5 + 0.4*0.0] = [0.7, 0.3].'
      }
    ],
    constraints: [
      '1 <= n <= 1000',
      'len(row_ptr) == n + 1',
      'len(values) == len(col_indices) == row_ptr[-1]'
    ],
    expectedComplexity: {
      time: 'O(n + \\text{nnz})',
      space: 'O(n)'
    },
    starterCode: `def sparse_vector_mult(p: list[float], values: list[float], col_indices: list[int], row_ptr: list[int]) -> list[float]:
    """
    Computes p_next = p * P where P is stored in CSR format.
    
    Args:
        p: Current probability vector of length n.
        values: Non-zero values of transition matrix P.
        col_indices: Column index for each non-zero value.
        row_ptr: Row pointers of length n + 1.
        
    Returns:
        p_next as a list of floats of length n.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def sparse_vector_mult(p: list[float], values: list[float], col_indices: list[int], row_ptr: list[int]) -> list[float]:
    n = len(p)
    p_next = [0.0] * n
    for i in range(n):
        pi = p[i]
        if pi == 0.0:
            continue
        start = row_ptr[i]
        end = row_ptr[i+1]
        for k in range(start, end):
            col = col_indices[k]
            val = values[k]
            p_next[col] += pi * val
    return [round(x, 4) for x in p_next]
`,
    editorial: `### Algorithmic Approach

In vector-matrix multiplication $p_{next} = p \\cdot P$:
1. Initialize an accumulator \`p_next = [0.0] * n\`.
2. Iterate through each row $i \\in [0, n-1]$.
3. If $p[i] == 0.0$, skip the entire row immediately.
4. For $k$ from \`row_ptr[i]\` to \`row_ptr[i+1]\`:
   - \`col = col_indices[k]\`
   - \`val = values[k]\`
   - \`p_next[col] += p[i] * val\`
5. Round results to 4 decimal places. Time complexity is strictly $O(n + \\text{nnz})$ where $\\text{nnz}$ is the count of non-zero entries.`,
    hints: [
      'Iterate through rows i from 0 to n-1.',
      'Slice indices k from row_ptr[i] to row_ptr[i+1].',
      'Notice that p is on the LEFT of P: p_next = p * P, so p[i] scales row i and adds to columns.'
    ],
    testCases: [
      {
        inputs: [[0.6, 0.4], [0.5, 0.5, 1.0], [0, 1, 0], [0, 2, 3]],
        expected: [0.7, 0.3]
      },
      {
        inputs: [[1.0, 0.0, 0.0], [1.0, 0.5, 0.5], [1, 0, 2], [0, 1, 1, 3]],
        expected: [0.0, 1.0, 0.0]
      },
      {
        inputs: [[0.3333, 0.3333, 0.3334], [1.0, 1.0, 1.0], [1, 2, 0], [0, 1, 2, 3]],
        expected: [0.3334, 0.3333, 0.3333]
      },
      {
        inputs: [[0.5, 0.5], [], [], [0, 0, 0]],
        expected: [0.0, 0.0],
        hidden: true
      }
    ],
    defaultCustomInput: '[0.6, 0.4], [0.5, 0.5, 1.0], [0, 1, 0], [0, 2, 3]',
    suggestedVisualizer: 'matrix-heatmap'
  },
  {
    id: 'm1-p6',
    moduleId: 'module-1',
    order: 6,
    title: 'Directed Graph Reachability from Source',
    difficulty: 'Easy',
    tags: ['Graph Traversal', 'BFS/DFS', 'Reachability'],
    funcName: 'reachable_nodes',
    description: `Given the number of nodes $n$, a directed edge list \`edges\` where each element is \`[u, v]\` (directed edge from $u$ to $v$), and a start node $source$:

Find all nodes that can be reached from $source$ by following directed paths (including the $source$ node itself).

Return the list of reachable node IDs sorted in ascending numerical order.`,
    mathematicalExplanation: `In a directed graph $G = (V, E)$, node $v$ is reachable from $u$ ($u \\rightsquigarrow v$) if there exists a sequence of directed edges:
$$(u, x_1), (x_1, x_2), \\dots, (x_{k-1}, v) \\in E$$
The reachability set $\\text{Reach}(u) = \\{v \\in V \\mid u \\rightsquigarrow v\\}$ forms the forward transitive closure starting from $u$.`,
    chimeraContext: `Before running Personalized PageRank from a seed entity extracted from a user question, Chimera checks if candidate target entities are reachable in the directed KG. If the target is unreachable, reverse edges or global fallback must be engaged.`,
    examples: [
      {
        input: 'n = 4, edges = [[0, 1], [1, 2], [3, 0]], source = 0',
        output: '[0, 1, 2]',
        explanation: 'From 0, we can reach 1 and 2. Node 3 points to 0, but is not reachable FROM 0.'
      },
      {
        input: 'n = 3, edges = [[0, 1]], source = 2',
        output: '[2]',
        explanation: 'Node 2 has no edges, so only itself is reachable.'
      }
    ],
    constraints: [
      '1 <= n <= 500',
      '0 <= len(edges) <= 2000',
      '0 <= source < n'
    ],
    expectedComplexity: {
      time: 'O(|V| + |E|)',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def reachable_nodes(n: int, edges: list[list[int]], source: int) -> list[int]:
    """
    Finds all nodes reachable from source in a directed graph.
    
    Args:
        n: Number of nodes.
        edges: List of directed [u, v].
        source: Starting node ID.
        
    Returns:
        Sorted list of reachable node IDs.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def reachable_nodes(n: int, edges: list[list[int]], source: int) -> list[int]:
    from collections import deque
    adj = {i: [] for i in range(n)}
    for edge in edges:
        u, v = edge[0], edge[1]
        adj[u].append(v)
        
    visited = set([source])
    queue = deque([source])
    
    while queue:
        curr = queue.popleft()
        for neighbor in adj.get(curr, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                
    return sorted(list(visited))
`,
    editorial: `### Algorithmic Approach

1. Build an adjacency list mapping each node $u$ to a list of its outgoing neighbors $v$.
2. Initialize a BFS queue with \`source\` and a \`visited\` set containing \`source\`.
3. Pop nodes from the queue, traverse their outgoing edges, and enqueue any unvisited neighbors.
4. When the queue is empty, sort and return the visited set.
5. Time complexity is $O(|V| + |E|)$ and space complexity is $O(|V| + |E|)$.`,
    hints: [
      'Build an adjacency list first: adj = {i: [] for i in range(n)}.',
      'Use standard Breadth-First Search (BFS) with a queue or DFS with a stack.',
      'Include the source node in the visited set initially.'
    ],
    testCases: [
      {
        inputs: [4, [[0, 1], [1, 2], [3, 0]], 0],
        expected: [0, 1, 2]
      },
      {
        inputs: [3, [[0, 1]], 2],
        expected: [2]
      },
      {
        inputs: [4, [[0, 1], [1, 2], [2, 3], [3, 0]], 1],
        expected: [0, 1, 2, 3]
      },
      {
        inputs: [5, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]], 0],
        expected: [0, 1, 2, 3, 4],
        hidden: true
      }
    ],
    defaultCustomInput: '4, [[0, 1], [1, 2], [3, 0]], 0',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm1-p7',
    moduleId: 'module-1',
    order: 7,
    title: 'Find Strongly Connected Components',
    difficulty: 'Hard',
    tags: ['SCC', 'Tarjan\'s Algorithm', 'Irreducibility', 'Graph Theory'],
    funcName: 'find_sccs',
    description: `A **Strongly Connected Component (SCC)** of a directed graph is a maximal subgraph where every vertex is reachable from every other vertex in the subgraph.

Given $n$ vertices ($0$ to $n-1$) and a directed edge list \`edges\` with pairs \`[u, v]\`:

Find all Strongly Connected Components. Return a list of components, where:
- Each component is a list of node IDs sorted in ascending order.
- The overall list of components is sorted in ascending order by their smallest node ID.`,
    mathematicalExplanation: `In Markov chain theory, SCCs correspond to communication classes:
$$u \\sim v \\iff (u \\rightsquigarrow v \\land v \\rightsquigarrow u)$$
A Markov chain is **irreducible** if and only if the entire graph forms a single SCC ($|\\text{SCC}| = 1$).
Tarjan\'s algorithm finds all SCCs in a single DFS pass using two timestamps per node:
- $\\text{index}[u]$: discovery time.
- $\\text{lowlink}[u]$: smallest index reachable from $u$ through its DFS subtree and at most one back-edge.
When $\\text{lowlink}[u] == \\text{index}[u]$, node $u$ is the root of an SCC.`,
    chimeraContext: `In Chimera, analyzing SCCs reveals closed knowledge silos where information circulates internally without leaking to other subgraphs, directly informing whether restart probabilities in PPR must be elevated.`,
    examples: [
      {
        input: 'n = 5, edges = [[0, 2], [2, 1], [1, 0], [0, 3], [3, 4]]',
        output: '[[0, 1, 2], [3], [4]]',
        explanation: 'Nodes {0, 1, 2} form a directed cycle (SCC). Nodes 3 and 4 cannot reach back to 0, so they form individual single-node SCCs.'
      }
    ],
    constraints: [
      '1 <= n <= 500',
      '0 <= len(edges) <= 2000',
      '0 <= u, v < n'
    ],
    expectedComplexity: {
      time: 'O(|V| + |E|)',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def find_sccs(n: int, edges: list[list[int]]) -> list[list[int]]:
    """
    Finds all Strongly Connected Components in a directed graph.
    
    Args:
        n: Number of nodes.
        edges: List of directed [u, v].
        
    Returns:
        List of sorted components, sorted by their minimum element.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def find_sccs(n: int, edges: list[list[int]]) -> list[list[int]]:
    adj = {i: [] for i in range(n)}
    for edge in edges:
        adj[edge[0]].append(edge[1])
        
    indices = [-1] * n
    lowlinks = [-1] * n
    on_stack = [False] * n
    stack = []
    current_index = 0
    sccs = []
    
    def strongconnect(v):
        nonlocal current_index
        indices[v] = current_index
        lowlinks[v] = current_index
        current_index += 1
        stack.append(v)
        on_stack[v] = True
        
        for w in adj[v]:
            if indices[w] == -1:
                strongconnect(w)
                lowlinks[v] = min(lowlinks[v], lowlinks[w])
            elif on_stack[w]:
                lowlinks[v] = min(lowlinks[v], indices[w])
                
        if lowlinks[v] == indices[v]:
            component = []
            while True:
                w = stack.pop()
                on_stack[w] = False
                component.append(w)
                if w == v:
                    break
            sccs.append(sorted(component))
            
    for i in range(n):
        if indices[i] == -1:
            strongconnect(i)
            
    sccs.sort(key=lambda c: c[0])
    return sccs
`,
    editorial: `### Algorithmic Approach: Tarjan's SCC Algorithm

Tarjan\'s algorithm finds all SCCs in a single DFS pass:
1. Maintain two arrays: \`indices[v]\` (discovery order) and \`lowlinks[v]\` (lowest reachable index).
2. Push visited nodes onto an explicit stack \`stack\` and track their presence with \`on_stack\`.
3. For each unvisited neighbor $w$, recursively call \`strongconnect(w)\` and update $\\text{lowlink}[v] = \\min(\\text{lowlink}[v], \\text{lowlink}[w])$.
4. If $w$ is already on the stack, it indicates a back-edge to an ancestor in the current DFS tree: update $\\text{lowlink}[v] = \\min(\\text{lowlink}[v], \\text{indices}[w])$.
5. If $\\text{lowlink}[v] == \\text{indices}[v]$, then $v$ is the root of an SCC! Pop elements from the stack until $v$ is popped. That group forms one complete SCC.`,
    hints: [
      'Tarjan\'s algorithm uses depth-first search and a stack.',
      'Maintain an on_stack boolean array to distinguish back-edges from cross-edges.',
      'When lowlinks[v] == indices[v], pop all nodes up to v from the stack.'
    ],
    testCases: [
      {
        inputs: [5, [[0, 2], [2, 1], [1, 0], [0, 3], [3, 4]]],
        expected: [[0, 1, 2], [3], [4]]
      },
      {
        inputs: [3, [[0, 1], [1, 2], [2, 0]]],
        expected: [[0, 1, 2]]
      },
      {
        inputs: [4, [[0, 1], [2, 3]]],
        expected: [[0], [1], [2], [3]]
      },
      {
        inputs: [4, [[0, 1], [1, 0], [2, 3], [3, 2]]],
        expected: [[0, 1], [2, 3]],
        hidden: true
      }
    ],
    defaultCustomInput: '5, [[0, 2], [2, 1], [1, 0], [0, 3], [3, 4]]',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm1-p8',
    moduleId: 'module-1',
    order: 8,
    title: 'Directed vs Undirected Traversal Divergence',
    difficulty: 'Medium',
    tags: ['Graph Asymmetry', 'Reverse Edges', 'Reachability Matrix'],
    funcName: 'traversal_divergence',
    description: `Directed graphs often exhibit high asymmetry: node $u$ may easily reach node $v$, but node $v$ may never be able to reach node $u$.

Given $n$ nodes and directed edge list \`edges\`:
1. Compute the **Forward Reachability Matrix** $R_{fwd} \\in \\{0, 1\\}^{n \\times n}$, where $R_{fwd}[u][v] = 1$ if $u \\rightsquigarrow v$, else $0$.
2. Compute the **Backward Reachability Matrix** $R_{bwd} \\in \\{0, 1\\}^{n \\times n}$, where $R_{bwd}[u][v] = 1$ if $v \\rightsquigarrow u$, else $0$.
3. Compute the **Asymmetry Divergence Matrix** $\\Delta$:
   $$\\Delta[u][v] = |R_{fwd}[u][v] - R_{bwd}[u][v]|$$
4. Compute the **Overall Graph Asymmetry Ratio**:
   $$\\text{Ratio} = \\frac{\\sum_{u=0}^{n-1} \\sum_{v=0}^{n-1} \\Delta[u][v]}{n^2}$$

Return a tuple \`(asymmetry_matrix, round(ratio, 4))\`.`,
    mathematicalExplanation: `In undirected graphs, reachability is an equivalence relation ($u \\rightsquigarrow v \\iff v \\rightsquigarrow u$), meaning $\\Delta = 0$ everywhere and $\\text{Ratio} = 0.0$.
In directed knowledge graphs, $\\Delta[u][v] = 1$ whenever there is a one-way street between $u$ and $v$.
This directly quantifies why bidirectional reverse-edge augmentation with decay factor $\\beta$ is necessary in Chimera.`,
    chimeraContext: `When a user query mentions a tail entity (e.g. "Transformer Training") and asks for the tool used ("CUDA"), traversing only forward directed edges fails because the path points towards Transformer Training. Quantifying traversal asymmetry motivates adding weighted reverse edges.`,
    examples: [
      {
        input: 'n = 2, edges = [[0, 1]]',
        output: '([[0, 1], [1, 0]], 0.5)',
        explanation: '0 can reach 1, but 1 cannot reach 0. Delta[0][1]=1 and Delta[1][0]=1. Total sum = 2. 2 / (2^2) = 0.5.'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      '0 <= len(edges) <= 500'
    ],
    expectedComplexity: {
      time: 'O(n^3)',
      space: 'O(n^2)'
    },
    starterCode: `def traversal_divergence(n: int, edges: list[list[int]]) -> tuple[list[list[int]], float]:
    """
    Computes asymmetry divergence matrix between forward and backward reachability.
    
    Args:
        n: Number of nodes.
        edges: Directed edge list.
        
    Returns:
        (delta_matrix, asymmetry_ratio)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def traversal_divergence(n: int, edges: list[list[int]]) -> tuple[list[list[int]], float]:
    # Floyd-Warshall or BFS for reachability
    reach = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    for u, v in edges:
        reach[u][v] = 1
        
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if reach[i][k] and reach[k][j]:
                    reach[i][j] = 1
                    
    delta = [[0 for _ in range(n)] for _ in range(n)]
    total_diff = 0
    for i in range(n):
        for j in range(n):
            # forward: reach[i][j], backward: reach[j][i]
            diff = abs(reach[i][j] - reach[j][i])
            delta[i][j] = diff
            total_diff += diff
            
    ratio = round(total_diff / (n * n), 4)
    return delta, ratio
`,
    editorial: `### Algorithmic Approach

1. Construct the transitive closure (reachability matrix $R$) using Floyd-Warshall algorithm in $O(n^3)$ or running BFS from each vertex in $O(n(n + m))$.
2. Note that $R_{bwd}[i][j] = R_{fwd}[j][i]$.
3. Compute difference $\\Delta[i][j] = |R[i][j] - R[j][i]|$.
4. Average across all $n^2$ pairs to obtain the asymmetry ratio.`,
    hints: [
      'Compute reachability using Floyd-Warshall: if reach[i][k] and reach[k][j], then reach[i][j] = 1.',
      'Forward reachability from i to j is reach[i][j]; backward reachability from i to j is reach[j][i].',
      'The asymmetry difference is abs(reach[i][j] - reach[j][i]).'
    ],
    testCases: [
      {
        inputs: [2, [[0, 1]]],
        expected: [[[0, 1], [1, 0]], 0.5]
      },
      {
        inputs: [2, [[0, 1], [1, 0]]],
        expected: [[[0, 0], [0, 0]], 0.0]
      },
      {
        inputs: [3, [[0, 1], [1, 2]]],
        expected: [[[0, 1, 1], [1, 0, 1], [1, 1, 0]], 0.6667]
      },
      {
        inputs: [3, []],
        expected: [[[0, 0, 0], [0, 0, 0], [0, 0, 0]], 0.0],
        hidden: true
      }
    ],
    defaultCustomInput: '2, [[0, 1]]',
    suggestedVisualizer: 'graph-editor'
  }
];
