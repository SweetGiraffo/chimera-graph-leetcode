import { Problem } from '../../types/problem';

export const MODULE_3_PROBLEMS: Problem[] = [
  {
    id: 'm3-p1',
    moduleId: 'module-3',
    order: 1,
    title: 'Single PageRank Iteration',
    difficulty: 'Easy',
    tags: ['PageRank', 'Power Iteration', 'Linear Algebra'],
    funcName: 'pagerank_single_iteration',
    description: `Given:
- Current rank distribution vector $r^{(t)} \\in \\mathbb{R}^n$ (where $\\sum r^{(t)}_i = 1.0$).
- Row-stochastic transition matrix $P \\in \\mathbb{R}^{n \\times n}$.
- Damping factor $\\alpha \\in [0.0, 1.0]$ (typically 0.85).
- Teleportation / restart vector $v \\in \\mathbb{R}^n$ (where $\\sum v_i = 1.0$).

Compute the updated PageRank distribution vector $r^{(t+1)}$ after a **single iteration** of the PageRank equation:
$$r^{(t+1)} = \\alpha \\cdot r^{(t)} P + (1 - \\alpha) \\cdot v$$

Return $r^{(t+1)}$ as a list of floats of length $n$, rounded to 4 decimal places.`,
    mathematicalExplanation: `The PageRank update decomposes the surfer's behavior into two independent mechanisms:
1. **Link Traversal with probability $\\alpha$:** The surfer follows an outgoing link from their current location, represented by vector-matrix multiplication $r^{(t)} P$.
2. **Teleportation with probability $1 - \\alpha$:** The surfer abandons link following and teleports to a random state chosen according to distribution vector $v$.`,
    chimeraContext: `A single iteration of PageRank represents a one-hop probability expansion across the knowledge graph combined with anchoring back to the query vector.`,
    examples: [
      {
        input: 'r = [0.5, 0.5], P = [[0.0, 1.0], [1.0, 0.0]], alpha = 0.85, v = [0.5, 0.5]',
        output: '[0.5, 0.5]',
        explanation: 'r * P = [0.5, 0.5]. 0.85 * [0.5, 0.5] + 0.15 * [0.5, 0.5] = [0.5, 0.5].'
      },
      {
        input: 'r = [1.0, 0.0], P = [[0.0, 1.0], [0.5, 0.5]], alpha = 0.8, v = [0.5, 0.5]',
        output: '[0.1, 0.9]',
        explanation: 'r * P = [0.0, 1.0]. alpha * [0.0, 1.0] = [0.0, 0.8]. (1 - alpha) * v = [0.1, 0.1]. Total = [0.1, 0.9].'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      '0.0 <= alpha <= 1.0',
      'sum(r) == 1.0 and sum(v) == 1.0'
    ],
    expectedComplexity: {
      time: 'O(n^2)',
      space: 'O(n)'
    },
    starterCode: `def pagerank_single_iteration(r: list[float], P: list[list[float]], alpha: float, v: list[float]) -> list[float]:
    """
    Executes one iteration: r_next = alpha * r * P + (1 - alpha) * v.
    
    Args:
        r: Current PageRank vector of length n.
        P: n x n row-stochastic matrix.
        alpha: Damping factor (e.g. 0.85).
        v: Teleportation vector of length n.
        
    Returns:
        Updated PageRank vector of length n.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def pagerank_single_iteration(r: list[float], P: list[list[float]], alpha: float, v: list[float]) -> list[float]:
    n = len(r)
    # 1. Compute r * P
    r_P = [0.0] * n
    for i in range(n):
        ri = r[i]
        if ri == 0.0:
            continue
        for j in range(n):
            r_P[j] += ri * P[i][j]
            
    # 2. Combine with teleportation
    r_next = [alpha * r_P[j] + (1.0 - alpha) * v[j] for j in range(n)]
    return [round(x, 4) for x in r_next]
`,
    editorial: `### Algorithmic Approach

1. Compute the vector-matrix product $r P$:
   - \`r_P[j] = sum(r[i] * P[i][j] for i in range(n))\`.
2. Compute each entry $r_{next}[j] = \\alpha \\cdot r_P[j] + (1 - \\alpha) \\cdot v[j]$.
3. Round each entry to 4 decimal places. Time complexity is $O(n^2)$, space is $O(n)$.`,
    hints: [
      'Compute r * P first: for each column j, sum r[i] * P[i][j].',
      'Multiply the result by alpha.',
      'Add (1 - alpha) * v[j] to each element.'
    ],
    testCases: [
      {
        inputs: [[0.5, 0.5], [[0.0, 1.0], [1.0, 0.0]], 0.85, [0.5, 0.5]],
        expected: [0.5, 0.5]
      },
      {
        inputs: [[1.0, 0.0], [[0.0, 1.0], [0.5, 0.5]], 0.8, [0.5, 0.5]],
        expected: [0.1, 0.9]
      },
      {
        inputs: [[0.3333, 0.3333, 0.3334], [[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]], 0.85, [0.3333, 0.3333, 0.3334]],
        expected: [0.3334, 0.3333, 0.3333]
      }
    ],
    defaultCustomInput: '[1.0, 0.0], [[0.0, 1.0], [0.5, 0.5]], 0.8, [0.5, 0.5]',
    suggestedVisualizer: 'pagerank-visualizer'
  },
  {
    id: 'm3-p2',
    moduleId: 'module-3',
    order: 2,
    title: 'PageRank from Scratch with NumPy',
    difficulty: 'Easy',
    tags: ['PageRank', 'NumPy', 'Vectorization'],
    funcName: 'pagerank_numpy',
    description: `Implement the full **Power Iteration PageRank algorithm** using NumPy vectorization.

Given:
- $n \\times n$ weighted adjacency matrix $adj$.
- Damping factor $\\alpha$ (default $0.85$).
- Iteration count $\\text{max\\_iter} = 100$.
- Convergence tolerance $\\text{tol} = 10^{-6}$.

Steps:
1. Normalize $adj$ into a row-stochastic matrix $P$. For any dangling node (out-degree 0), set its row to uniform $\\frac{1}{n}$.
2. Initialize teleportation vector $v = [\\frac{1}{n}, \\dots, \\frac{1}{n}]$ and initial rank vector $r_0 = v$.
3. In each iteration:
   $$r^{(t+1)} = \\alpha r^{(t)} P + (1 - \\alpha) v$$
   Stop early if $\\|r^{(t+1)} - r^{(t)}\\|_1 < \\text{tol}$.
4. Return $r$ as a list of floats rounded to 4 decimal places.`,
    mathematicalExplanation: `The Google Matrix $G$ is defined as:
$$G = \\alpha \\bar{P} + (1 - \\alpha) \\mathbf{1} v^T$$
where $\\bar{P}$ is the transition matrix with dangling nodes replaced by $v^T$.
Power iteration computes the sequence $r^{(t+1)} = r^{(t)} G$. Because $G$ is strictly positive and primitive, the Banach Fixed Point Theorem ensures convergence to the unique stationary vector $r^*$.`,
    chimeraContext: `Serves as the baseline global centrality metric in Chimera, allowing the system to gauge whether an entity is inherently prominent across the entire document corpus.`,
    examples: [
      {
        input: 'adj = [[0, 1, 1], [0, 0, 1], [1, 0, 0]], alpha = 0.85',
        output: '[0.3878, 0.2148, 0.3974]',
        explanation: 'Node 2 receives links from 0 and 1, achieving highest PageRank score.'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      '0.0 < alpha < 1.0'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot n^2)',
      space: 'O(n^2)'
    },
    starterCode: `def pagerank_numpy(adj: list[list[float]], alpha: float = 0.85) -> list[float]:
    """
    Computes PageRank using NumPy power iteration.
    
    Args:
        adj: n x n weighted adjacency matrix.
        alpha: Damping factor.
        
    Returns:
        PageRank vector as list of floats rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def pagerank_numpy(adj: list[list[float]], alpha: float = 0.85) -> list[float]:
    import numpy as np
    A = np.array(adj, dtype=float)
    n = len(A)
    
    # 1. Row normalize
    row_sums = A.sum(axis=1)
    P = np.zeros((n, n), dtype=float)
    for i in range(n):
        if row_sums[i] > 0:
            P[i] = A[i] / row_sums[i]
        else:
            P[i] = np.ones(n) / n
            
    # 2. Power iteration
    v = np.ones(n, dtype=float) / n
    r = v.copy()
    
    for _ in range(100):
        r_next = alpha * np.dot(r, P) + (1.0 - alpha) * v
        if np.sum(np.abs(r_next - r)) < 1e-6:
            r = r_next
            break
        r = r_next
        
    return [round(float(x), 4) for x in r]
`,
    editorial: `### Algorithmic Approach

1. Convert \`adj\` to a NumPy array of shape $(n, n)$.
2. Calculate row sums using \`A.sum(axis=1)\`. For rows where sum $> 0$, divide by row sum. For rows where sum $== 0$ (dangling), assign \`np.ones(n) / n\`.
3. Set $v = \\text{np.ones}(n) / n$ and $r = v$.
4. Loop up to 100 times:
   - Compute \`r_next = alpha * np.dot(r, P) + (1 - alpha) * v\`.
   - If \`np.sum(np.abs(r_next - r)) < 1e-6\`, break.
   - Update \`r = r_next\`.
5. Return rounded float list.`,
    hints: [
      'Import numpy as np.',
      'Normalize rows using A[i] / row_sums[i] or np.ones(n)/n for dangling rows.',
      'Use np.dot(r, P) for fast vector-matrix multiplication.'
    ],
    testCases: [
      {
        inputs: [[[0, 1, 1], [0, 0, 1], [1, 0, 0]], 0.85],
        expected: [0.3878, 0.2148, 0.3974]
      },
      {
        inputs: [[[0, 1], [1, 0]], 0.85],
        expected: [0.5, 0.5]
      },
      {
        inputs: [[[0, 0], [0, 0]], 0.85],
        expected: [0.5, 0.5]
      }
    ],
    defaultCustomInput: '[[0, 1, 1], [0, 0, 1], [1, 0, 0]], 0.85',
    suggestedVisualizer: 'pagerank-visualizer'
  },
  {
    id: 'm3-p3',
    moduleId: 'module-3',
    order: 3,
    title: 'L1 Norm Convergence Detector',
    difficulty: 'Easy',
    tags: ['Convergence', 'Stopping Criteria', 'Numerical Analysis'],
    funcName: 'track_pagerank_convergence',
    description: `When running power iteration, stopping at the right iteration saves critical milliseconds in real-time retrieval.

Given an $n \\times n$ row-stochastic matrix $P$, damping factor $\\alpha = 0.85$, uniform teleportation vector $v = [1/n, \\dots, 1/n]$, and an $L_1$ threshold $\\epsilon$:

Track the convergence history:
At each iteration $t = 1, 2, \\dots$, compute:
$$\\delta_t = \\|r^{(t)} - r^{(t-1)}\\|_1 = \\sum_{i=0}^{n-1} |r^{(t)}_i - r^{(t-1)}_i|$$
Stop as soon as $\\delta_t < \\epsilon$.

Return a tuple \`(iterations: int, history_deltas: list[float])\`, where each $\\delta_t$ in \`history_deltas\` is rounded to 5 decimal places.`,
    mathematicalExplanation: `Because the second eigenvalue of the Google matrix satisfies $|\\lambda_2| \\le \\alpha$, the error between successive iterations contracts geometrically:
$$\\|r^{(t+1)} - r^{(t)}\\|_1 \\le \\alpha \\|r^{(t)} - r^{(t-1)}\\|_1$$
Therefore, the error at iteration $t$ satisfies:
$$\\|r^{(t)} - r^*\\|_1 \\le \\frac{\\alpha^t}{1 - \\alpha} \\|r^{(1)} - r^{(0)}\\|_1$$
This guarantees exponential convergence with convergence factor $\\alpha = 0.85$.`,
    chimeraContext: `Retrieval latency in Chimera is strictly bounded (e.g. $< 150\\text{ms}$). Measuring empirical $\\delta_t$ determines whether early stopping at $t=15$ introduces negligible ranking distortion compared to $t=50$.`,
    examples: [
      {
        input: 'P = [[0.0, 1.0], [1.0, 0.0]], epsilon = 0.01',
        output: '(1, [0.0])',
        explanation: 'Initial r0 = [0.5, 0.5]. r1 = 0.85 * [0.5, 0.5] + 0.15 * [0.5, 0.5] = [0.5, 0.5]. delta1 = 0.0 < 0.01. Stops in 1 iteration.'
      }
    ],
    constraints: [
      '2 <= n <= 50',
      '1e-6 <= epsilon <= 0.1'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot n^2)',
      space: 'O(T + n)'
    },
    starterCode: `def track_pagerank_convergence(P: list[list[float]], epsilon: float = 1e-4) -> tuple[int, list[float]]:
    """
    Tracks PageRank L1 error history until delta < epsilon.
    
    Args:
        P: n x n row-stochastic matrix.
        epsilon: L1 threshold.
        
    Returns:
        (iterations, [delta_1, delta_2, ...])
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def track_pagerank_convergence(P: list[list[float]], epsilon: float = 1e-4) -> tuple[int, list[float]]:
    n = len(P)
    alpha = 0.85
    v = [1.0 / n] * n
    r = list(v)
    deltas = []
    
    iteration = 0
    while True:
        iteration += 1
        # r_next = alpha * r * P + (1 - alpha) * v
        r_next = [0.0] * n
        for i in range(n):
            ri = r[i]
            if ri == 0.0:
                continue
            for j in range(n):
                r_next[j] += ri * P[i][j]
                
        r_next = [alpha * r_next[j] + (1.0 - alpha) * v[j] for j in range(n)]
        delta = sum(abs(r_next[j] - r[j]) for j in range(n))
        deltas.append(round(delta, 5))
        r = r_next
        if delta < epsilon or iteration >= 200:
            break
            
    return iteration, deltas
`,
    editorial: `### Algorithmic Approach

1. Initialize $r^{(0)} = v = [1/n, \\dots, 1/n]$ and empty list \`deltas\`.
2. In each iteration $t$:
   - Compute $r^{(t)} = \\alpha r^{(t-1)} P + (1 - \\alpha) v$.
   - Calculate $L_1$ delta: $\\delta_t = \\sum_{j=0}^{n-1} |r^{(t)}_j - r^{(t-1)}_j|$.
   - Append rounded $\\delta_t$ to \`deltas\`.
   - Update $r = r^{(t)}$.
   - If $\\delta_t < \\epsilon$, break.
3. Return \`(iteration, deltas)\`.`,
    hints: [
      'Initialize r = [1.0 / n] * n.',
      'Compute delta = sum(abs(r_next[j] - r[j]) for j in range(n)).',
      'Append round(delta, 5) to your history list.'
    ],
    testCases: [
      {
        inputs: [[[0.0, 1.0], [1.0, 0.0]], 0.01],
        expected: [1, [0.0]]
      },
      {
        inputs: [[[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]], 0.01],
        expected: [1, [0.0]]
      },
      {
        inputs: [[[0.1, 0.9], [0.5, 0.5]], 0.01],
        expected: [6, [0.17, 0.0578, 0.01965, 0.00668]]
      }
    ],
    defaultCustomInput: '[[0.1, 0.9], [0.5, 0.5]], 0.01',
    suggestedVisualizer: 'stationary-plot'
  },
  {
    id: 'm3-p4',
    moduleId: 'module-3',
    order: 4,
    title: 'Handling Dangling Nodes in PageRank',
    difficulty: 'Medium',
    tags: ['Dangling Nodes', 'Conservation of Mass', 'PageRank'],
    funcName: 'pagerank_with_dangling_handling',
    description: `When a graph contains dangling nodes (nodes with out-degree zero), standard matrix multiplication loses probability mass:
$$\\sum (r P)_j = 1.0 - \\sum_{i \\in \\mathcal{D}} r_i < 1.0$$
where $\\mathcal{D} = \\{i \\mid d_{out}(i) = 0\\}$ is the set of dangling nodes.

Instead of modifying the $n \\times n$ matrix $P$ directly, the standard scalable approach accumulates the leaked probability mass $s = \\sum_{i \\in \\mathcal{D}} r_i$ as a scalar, and redistributes it according to vector $v$:
$$r^{(t+1)} = \\alpha \\left( r^{(t)} P_{\\text{clean}} + \\left(\\sum_{i \\in \\mathcal{D}} r^{(t)}_i\\right) v \\right) + (1 - \\alpha) v$$
where $P_{\\text{clean}}$ has rows of 0 for dangling nodes.

Given $adj$, damping $\\alpha = 0.85$, and teleportation vector $v$:
Implement this memory-efficient dangling mass redistribution.
Return the converged PageRank vector rounded to 4 decimal places.`,
    mathematicalExplanation: `Let $\\mathbf{d} \\in \\{0, 1\\}^n$ be the indicator vector for dangling nodes.
The full Google step is:
$$r^{(t+1)} = r^{(t)} \\left( \\alpha (P_{\\text{clean}} + \\mathbf{d} v^T) + (1 - \\alpha) \\mathbf{1} v^T \\right)$$
$$= \\alpha r^{(t)} P_{\\text{clean}} + \\alpha (r^{(t)} \\mathbf{d}) v^T + (1 - \\alpha) v^T$$
$$= \\alpha r^{(t)} P_{\\text{clean}} + \\left( \\alpha \\sum_{i \\in \\mathcal{D}} r^{(t)}_i + (1 - \\alpha) \\right) v$$
Notice that $(r^{(t)} \\mathbf{d})$ is a scalar! Thus we avoid materializing the dense rank-1 outer product $\\mathbf{d} v^T$, preserving sparse graph complexity.`,
    chimeraContext: `In multi-modal knowledge graphs, entity leaves (e.g. raw image paths or embedding vector IDs) are pure sinks. Scaling to large KGs requires avoiding dense matrix allocation for dangling nodes.`,
    examples: [
      {
        input: 'adj = [[0, 1], [0, 0]], v = [0.5, 0.5]',
        output: '[0.3509, 0.6491]',
        explanation: 'Node 1 is dangling. Its probability mass is captured and teleported back, preserving sum(r) = 1.0.'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      'adj is non-negative'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot (|E| + n))',
      space: 'O(n^2)'
    },
    starterCode: `def pagerank_with_dangling_handling(adj: list[list[float]], v: list[float] | None = None) -> list[float]:
    """
    Computes PageRank with scalar dangling mass redistribution.
    
    Args:
        adj: n x n adjacency matrix.
        v: Optional teleportation vector.
        
    Returns:
        Converged PageRank vector rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def pagerank_with_dangling_handling(adj: list[list[float]], v: list[float] | None = None) -> list[float]:
    n = len(adj)
    alpha = 0.85
    if v is None:
        v = [1.0 / n] * n
        
    # Precompute row sums and identify dangling nodes
    row_sums = [sum(adj[i]) for i in range(n)]
    dangling_indices = [i for i in range(n) if row_sums[i] == 0]
    
    # Normalized P_clean (dangling rows remain 0)
    P_clean = [[adj[i][j] / row_sums[i] if row_sums[i] > 0 else 0.0 for j in range(n)] for i in range(n)]
    
    r = list(v)
    for _ in range(150):
        # 1. Sparse / regular transition
        r_P = [0.0] * n
        for i in range(n):
            if row_sums[i] > 0 and r[i] > 0:
                for j in range(n):
                    r_P[j] += r[i] * P_clean[i][j]
                    
        # 2. Dangling mass scalar
        dangling_sum = sum(r[i] for i in dangling_indices)
        
        # 3. Combined update
        teleport_weight = alpha * dangling_sum + (1.0 - alpha)
        r_next = [alpha * r_P[j] + teleport_weight * v[j] for j in range(n)]
        
        if sum(abs(r_next[j] - r[j]) for j in range(n)) < 1e-6:
            r = r_next
            break
        r = r_next
        
    return [round(x, 4) for x in r]
`,
    editorial: `### Algorithmic Approach

1. Compute row sums. Identify all dangling indices where \`row_sums[i] == 0\`.
2. Construct $P_{\\text{clean}}$ with zeros for dangling rows.
3. In each iteration:
   - Compute standard transition $r P_{\\text{clean}}$.
   - Compute scalar dangling mass: $s = \\sum_{i \\in \\mathcal{D}} r_i$.
   - The total teleportation scalar is $\\gamma = \\alpha s + (1 - \\alpha)$.
   - Update: $r_{next}[j] = \\alpha (r P_{\\text{clean}})[j] + \\gamma v[j]$.
   - Check $L_1$ convergence.
4. Total probability mass $\\sum r_i$ is strictly conserved at $1.0$.`,
    hints: [
      'Find all rows where sum(adj[i]) == 0.',
      'Sum the current rank of those dangling nodes: s = sum(r[i] for i in dangling_indices).',
      'The scalar coefficient multiplying v is alpha * s + (1.0 - alpha).'
    ],
    testCases: [
      {
        inputs: [[[0, 1], [0, 0]], [0.5, 0.5]],
        expected: [0.3509, 0.6491]
      },
      {
        inputs: [[[0, 1, 0], [0, 0, 1], [0, 0, 0]], [0.3333, 0.3333, 0.3334]],
        expected: [0.2227, 0.312, 0.4653]
      },
      {
        inputs: [[[0, 0], [0, 0]], null],
        expected: [0.5, 0.5]
      }
    ],
    defaultCustomInput: '[[0, 1], [0, 0]], [0.5, 0.5]',
    suggestedVisualizer: 'pagerank-visualizer'
  },
  {
    id: 'm3-p5',
    moduleId: 'module-3',
    order: 5,
    title: 'Weighted PageRank Implementation',
    difficulty: 'Medium',
    tags: ['Weighted PageRank', 'Edge Importance', 'Knowledge Graph'],
    funcName: 'weighted_pagerank',
    description: `In classical PageRank, all outgoing edges from a page are weighted equally ($1/d_{out}$). In a Knowledge Graph, edges have semantic weights representing confidence, frequency, or relation priority.

Given an $n \\times n$ weighted adjacency matrix $adj$, damping $\\alpha = 0.85$, and uniform $v$:
1. Compute the transition probability along edge $(i, j)$ proportional to its weight:
   $$P_{ij} = \\frac{adj[i][j]}{\\sum_{k=0}^{n-1} adj[i][k]}$$
2. Run PageRank power iteration until convergence (tolerance $10^{-6}$).
3. Rank the nodes from highest PageRank score to lowest.

Return a list of dictionaries sorted by score descending:
\`[{'node': int, 'score': float}, ...]\`
Round scores to 4 decimal places. If scores are tied, sort by node ID ascending.`,
    mathematicalExplanation: `Weighted PageRank biases the random walk towards high-confidence relationships:
$$P(X_{t+1} = j \\mid X_t = i) \\propto W(i, j)$$
A node with one high-weight edge ($W=10.0$) and three low-weight edges ($W=1.0$) directs $10 / 13 \\approx 76.9\\%$ of its transmitted importance along the first edge.`,
    chimeraContext: `In Chimera, edges derived from primary text receive higher weights ($1.0$) than edges extracted from noisy audio transcripts ($0.6$) or OCR from images ($0.7$). Weighted PageRank ensures high-confidence modalities dominate the ranking.`,
    examples: [
      {
        input: 'adj = [[0, 10, 1], [1, 0, 0], [1, 0, 0]]',
        output: "[{'node': 1, 'score': 0.4285}, {'node': 0, 'score': 0.4907}, {'node': 2, 'score': 0.0808}]",
        explanation: 'Node 0 passes 10x more weight to node 1 than to node 2, making node 1 vastly outrank node 2.'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      'adj is non-negative'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot n^2 + n \\log n)',
      space: 'O(n^2)'
    },
    starterCode: `def weighted_pagerank(adj: list[list[float]], alpha: float = 0.85) -> list[dict]:
    """
    Computes weighted PageRank and returns nodes sorted by score descending.
    
    Args:
        adj: n x n weighted adjacency matrix.
        alpha: Damping factor.
        
    Returns:
        List of {'node': int, 'score': float} sorted by score desc.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def weighted_pagerank(adj: list[list[float]], alpha: float = 0.85) -> list[dict]:
    n = len(adj)
    row_sums = [sum(adj[i]) for i in range(n)]
    P = []
    for i in range(n):
        if row_sums[i] > 0:
            P.append([adj[i][j] / row_sums[i] for j in range(n)])
        else:
            P.append([1.0 / n for _ in range(n)])
            
    v = [1.0 / n] * n
    r = list(v)
    
    for _ in range(150):
        r_next = [0.0] * n
        for i in range(n):
            ri = r[i]
            if ri == 0.0:
                continue
            for j in range(n):
                r_next[j] += ri * P[i][j]
        r_next = [alpha * r_next[j] + (1.0 - alpha) * v[j] for j in range(n)]
        if sum(abs(r_next[j] - r[j]) for j in range(n)) < 1e-6:
            r = r_next
            break
        r = r_next
        
    items = [{'node': i, 'score': round(r[i], 4)} for i in range(n)]
    # Sort by score descending, then by node ascending
    items.sort(key=lambda x: (-x['score'], x['node']))
    return items
`,
    editorial: `### Algorithmic Approach

1. Compute row-normalized matrix $P$: $P_{ij} = adj[i][j] / \\sum_k adj[i][k]$. Replace dangling rows with $1/n$.
2. Run standard power iteration: $r^{(t+1)} = \\alpha r^{(t)} P + (1 - \\alpha) v$.
3. Stop when $L_1$ difference $< 10^{-6}$.
4. Construct dictionary list and sort using \`key=lambda x: (-x['score'], x['node'])\`.`,
    hints: [
      'Normalize the adjacency matrix by row sums.',
      'Run power iteration until sum(abs(r_next - r)) < 1e-6.',
      'Sort using Python key: key=lambda x: (-x["score"], x["node"]).'
    ],
    testCases: [
      {
        inputs: [[[0, 10, 1], [1, 0, 0], [1, 0, 0]], 0.85],
        expected: [{'node': 0, 'score': 0.4907}, {'node': 1, 'score': 0.4285}, {'node': 2, 'score': 0.0808}]
      },
      {
        inputs: [[[0, 1], [1, 0]], 0.85],
        expected: [{'node': 0, 'score': 0.5}, {'node': 1, 'score': 0.5}]
      }
    ],
    defaultCustomInput: '[[0, 10, 1], [1, 0, 0], [1, 0, 0]], 0.85',
    suggestedVisualizer: 'pagerank-visualizer'
  },
  {
    id: 'm3-p6',
    moduleId: 'module-3',
    order: 6,
    title: 'Damping Factor Sensitivity Analysis',
    difficulty: 'Medium',
    tags: ['Damping Factor', 'Sensitivity Analysis', 'Ranking Metrics'],
    funcName: 'damping_factor_sensitivity',
    description: `The damping factor $\\alpha$ balances local link topology against global uniform teleportation.
- When $\\alpha \\to 0$, $r \\to v$ (pure uniform distribution, graph topology is ignored).
- When $\\alpha \\to 1$, $r$ approaches the pure stationary distribution of $P$, but convergence slows drastically and dead-ends absorb mass.

Given $adj$ and a list of damping values $\\text{alphas} = [\\alpha_1, \\alpha_2, \\dots, \\alpha_m]$:
For each $\\alpha$, compute the converged PageRank vector.

Return a dictionary mapping $\\alpha$ (as a float) to the list of node scores rounded to 4 decimal places:
\`{alpha: [score_0, score_1, ...], ...}\``,
    mathematicalExplanation: `The Neumann series expansion of PageRank reveals how $\\alpha$ weights path lengths:
$$r = (1 - \\alpha) v \\sum_{k=0}^\\infty (\\alpha P)^k = (1 - \\alpha) v \\left( I + \\alpha P + \\alpha^2 P^2 + \\alpha^3 P^3 + \\dots \\right)$$
Notice that paths of length $k$ are attenuated by $\\alpha^k$. A smaller $\\alpha = 0.5$ concentrates score heavily on 1-hop and 2-hop neighbors, whereas $\\alpha = 0.95$ propagates score deeply across long paths.`,
    chimeraContext: `In Chimera, setting $\\alpha = 0.70$ vs $0.85$ vs $0.90$ controls how far reasoning propagates across entity triples. Short queries prefer lower $\\alpha$ (local context), while multi-hop reasoning queries require higher $\\alpha$.`,
    examples: [
      {
        input: 'adj = [[0, 1], [0, 0]], alphas = [0.1, 0.85]',
        output: '{0.1: [0.4762, 0.5238], 0.85: [0.3509, 0.6491]}',
        explanation: 'At alpha=0.1, node 1 barely exceeds node 0 (0.52 vs 0.47). At alpha=0.85, link structure dominates (0.649 vs 0.351).'
      }
    ],
    constraints: [
      '1 <= n <= 50',
      '1 <= len(alphas) <= 10',
      '0.05 <= alpha <= 0.99'
    ],
    expectedComplexity: {
      time: 'O(|alphas| \\cdot T \\cdot n^2)',
      space: 'O(n^2)'
    },
    starterCode: `def damping_factor_sensitivity(adj: list[list[float]], alphas: list[float]) -> dict[float, list[float]]:
    """
    Computes PageRank distribution for multiple damping factors.
    
    Args:
        adj: n x n adjacency matrix.
        alphas: List of alpha values.
        
    Returns:
        Dict mapping alpha to converged PageRank vector.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def damping_factor_sensitivity(adj: list[list[float]], alphas: list[float]) -> dict[float, list[float]]:
    n = len(adj)
    row_sums = [sum(adj[i]) for i in range(n)]
    P = []
    for i in range(n):
        if row_sums[i] > 0:
            P.append([adj[i][j] / row_sums[i] for j in range(n)])
        else:
            P.append([1.0 / n for _ in range(n)])
            
    v = [1.0 / n] * n
    results = {}
    
    for alpha in alphas:
        r = list(v)
        for _ in range(200):
            r_next = [0.0] * n
            for i in range(n):
                ri = r[i]
                if ri == 0.0:
                    continue
                for j in range(n):
                    r_next[j] += ri * P[i][j]
            r_next = [alpha * r_next[j] + (1.0 - alpha) * v[j] for j in range(n)]
            if sum(abs(r_next[j] - r[j]) for j in range(n)) < 1e-6:
                r = r_next
                break
            r = r_next
        results[alpha] = [round(x, 4) for x in r]
        
    return results
`,
    editorial: `### Algorithmic Approach

1. Form stochastic transition matrix $P$, replacing dangling rows with $1/n$.
2. For each $\\alpha \\in \\text{alphas}$:
   - Run power iteration with damping $\\alpha$ until convergence.
   - Record the resulting distribution.
3. Return the mapped dictionary.`,
    hints: [
      'Normalize the transition matrix once before looping over alpha.',
      'For each alpha, initialize r = v = [1.0/n]*n and iterate until diff < 1e-6.',
      'Store results in a dictionary mapping alpha to the rounded list.'
    ],
    testCases: [
      {
        inputs: [[[0, 1], [0, 0]], [0.1, 0.85]],
        expected: {0.1: [0.4762, 0.5238], 0.85: [0.3509, 0.6491]}
      },
      {
        inputs: [[[0, 1], [1, 0]], [0.5, 0.9]],
        expected: {0.5: [0.5, 0.5], 0.9: [0.5, 0.5]}
      }
    ],
    defaultCustomInput: '[[0, 1], [0, 0]], [0.1, 0.85]',
    suggestedVisualizer: 'pagerank-visualizer'
  },
  {
    id: 'm3-p7',
    moduleId: 'module-3',
    order: 7,
    title: 'Power Iteration vs Direct Linear Algebra PageRank',
    difficulty: 'Medium',
    tags: ['Linear Systems', 'Closed-Form Solution', 'Matrix Inversion'],
    funcName: 'compare_power_and_direct_pagerank',
    description: `The PageRank fixed-point equation is:
$$r = \\alpha r P + (1 - \\alpha) v$$
Rearranging terms yields a direct linear system:
$$r - \\alpha r P = (1 - \\alpha) v \\iff r (I - \\alpha P) = (1 - \\alpha) v$$
Taking the transpose:
$$(I - \\alpha P)^T r^T = (1 - \\alpha) v^T$$
Since $\\alpha < 1$ and $P$ is row-stochastic, the spectral radius $\\rho(\\alpha P) = \\alpha < 1$. Thus, $(I - \\alpha P)$ is **strictly invertible**:
$$r = (1 - \\alpha) v (I - \\alpha P)^{-1}$$

Implement both:
1. Power Iteration solution $r_{\\text{power}}$ (converged to $10^{-7}$).
2. Direct Linear Algebra solution $r_{\\text{direct}}$ using \`numpy.linalg.solve\` or matrix inversion.

Return a tuple \`(r_power, r_direct, max_absolute_diff)\`, where distributions are rounded to 4 decimal places, and \`max_absolute_diff\` is a float rounded to 6 decimal places.`,
    mathematicalExplanation: `The matrix $(I - \\alpha P)$ is an **M-matrix**: its diagonal entries are positive ($1 - \\alpha P_{ii} > 0$) and off-diagonal entries are non-positive ($-\\alpha P_{ij} \\le 0$).
Because $\\alpha < 1$, it is strictly diagonally dominant if $P$ has no dead ends, guaranteeing that the solution exists, is unique, and is strictly non-negative.`,
    chimeraContext: `Direct inversion has $O(n^3)$ complexity, making it ideal for small local subgraphs in Chimera ($n < 500$). For full enterprise graphs ($n > 10^5$), power iteration is strictly superior due to $O(|E|)$ sparse operations.`,
    examples: [
      {
        input: 'P = [[0.0, 1.0], [1.0, 0.0]], alpha = 0.85',
        output: '([0.5, 0.5], [0.5, 0.5], 0.0)',
        explanation: 'Both iterative and direct linear algebra converge to identical symmetric scores.'
      }
    ],
    constraints: [
      '2 <= n <= 40',
      'P is row-stochastic',
      '0.1 <= alpha <= 0.95'
    ],
    expectedComplexity: {
      time: 'O(n^3)',
      space: 'O(n^2)'
    },
    starterCode: `def compare_power_and_direct_pagerank(P: list[list[float]], alpha: float = 0.85) -> tuple[list[float], list[float], float]:
    """
    Computes PageRank via power iteration and direct linear algebra, returning difference.
    
    Args:
        P: n x n row-stochastic matrix.
        alpha: Damping factor.
        
    Returns:
        (r_power, r_direct, max_abs_diff)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def compare_power_and_direct_pagerank(P: list[list[float]], alpha: float = 0.85) -> tuple[list[float], list[float], float]:
    import numpy as np
    n = len(P)
    P_mat = np.array(P, dtype=float)
    v = np.ones(n, dtype=float) / n
    
    # 1. Power Iteration
    r = v.copy()
    for _ in range(500):
        r_next = alpha * np.dot(r, P_mat) + (1.0 - alpha) * v
        if np.sum(np.abs(r_next - r)) < 1e-7:
            r = r_next
            break
        r = r_next
    r_power = r
    
    # 2. Direct Linear Algebra
    # (I - alpha * P)^T * r^T = (1 - alpha) * v^T
    A = np.eye(n) - alpha * P_mat.T
    b = (1.0 - alpha) * v
    r_direct = np.linalg.solve(A, b)
    
    diff = float(np.max(np.abs(r_power - r_direct)))
    return [round(float(x), 4) for x in r_power], [round(float(x), 4) for x in r_direct], round(diff, 6)
`,
    editorial: `### Algorithmic Approach

1. **Power Iteration:** Initialize $r = v = [1/n, \\dots, 1/n]$. Repeat $r \\leftarrow \\alpha r P + (1 - \\alpha) v$ until $\\|r_{next} - r\\|_1 < 10^{-7}$.
2. **Direct Linear Solve:** Set $A = I - \\alpha P^T$ and $b = (1 - \\alpha) v$. Solve $A r^T = b$ using \`numpy.linalg.solve(A, b)\`.
3. Compute maximum absolute difference $\\max_i |r_{\\text{power}}[i] - r_{\\text{direct}}[i]|$.
4. Return both vectors and difference.`,
    hints: [
      'Transpose P when setting up the linear system: A = np.eye(n) - alpha * np.array(P).T.',
      'Right-hand side is b = (1.0 - alpha) * v.',
      'Use np.linalg.solve(A, b).'
    ],
    testCases: [
      {
        inputs: [[[0.0, 1.0], [1.0, 0.0]], 0.85],
        expected: [[0.5, 0.5], [0.5, 0.5], 0.0]
      },
      {
        inputs: [[[0.5, 0.5], [0.2, 0.8]], 0.85],
        expected: [[0.3168, 0.6832], [0.3168, 0.6832], 0.0]
      }
    ],
    defaultCustomInput: '[[0.0, 1.0], [1.0, 0.0]], 0.85',
    suggestedVisualizer: 'pagerank-visualizer'
  },
  {
    id: 'm3-p8',
    moduleId: 'module-3',
    order: 8,
    title: 'Convergence Speed and Spectral Gap',
    difficulty: 'Hard',
    tags: ['Eigenvalues', 'Spectral Gap', 'Theoretical Bounds'],
    funcName: 'analyze_spectral_gap',
    description: `The convergence rate of PageRank is governed by the second largest eigenvalue of the Google Matrix $G$:
$$G = \\alpha P + (1 - \\alpha) \\mathbf{1} v^T$$
By the Perron-Frobenius theorem, the dominant eigenvalue is $\\lambda_1 = 1$. The second eigenvalue $\\lambda_2$ dictates how fast errors decay:
$$\\|r^{(t)} - r^*\\| \\le C \\cdot |\\lambda_2|^t$$
The **spectral gap** is defined as $\\gamma = 1 - |\\lambda_2|$. A larger spectral gap implies faster convergence. Furthermore, it is a theoretical theorem that $|\\lambda_2| \\le \\alpha$.

Given an $n \\times n$ row-stochastic matrix $P$ and damping $\\alpha$:
1. Construct the Google matrix $G = \\alpha P + (1 - \\alpha) \\mathbf{1} v^T$ where $v = [1/n, \\dots, 1/n]$.
2. Compute all eigenvalues of $G$ using NumPy.
3. Find $|\\lambda_2|$, the second largest absolute eigenvalue.
4. Compute the spectral gap: $\\text{gap} = 1.0 - |\\lambda_2|$.
5. Compute the theoretical bound on iterations needed to achieve error $< 10^{-6}$:
   $$T_{\\text{bound}} = \\left\\lceil \\frac{\\ln(10^{-6})}{\\ln(\\alpha)} \\right\\rceil$$

Return a tuple \`(round(abs_lambda2, 4), round(gap, 4), int(T_bound))\`.`,
    mathematicalExplanation: `Let $\\lambda_1, \\lambda_2, \\dots, \\lambda_n$ be eigenvalues of $P$ sorted by absolute value.
Because $\\mathbf{1} v^T$ is a rank-1 matrix with eigenvector $\\mathbf{1}$ (eigenvalue 1) and all other eigenvalues equal to 0, the eigenvalues of $G = \\alpha P + (1 - \\alpha) \\mathbf{1} v^T$ are simply:
$$\\lambda_1(G) = 1, \\quad \\lambda_k(G) = \\alpha \\lambda_k(P) \\quad \\text{for } k \\ge 2$$
Therefore, $|\\lambda_2(G)| = \\alpha |\\lambda_2(P)| \\le \\alpha$.`,
    chimeraContext: `Guarantees that no matter how complex or convoluted the knowledge graph topology is, PageRank convergence speed is strictly bounded by $\\alpha$. Choosing $\\alpha=0.85$ mathematically bounds maximum iterations to under 88 steps.`,
    examples: [
      {
        input: 'P = [[0.0, 1.0], [1.0, 0.0]], alpha = 0.85',
        output: '(0.85, 0.15, 86)',
        explanation: 'Eigenvalues of P are 1 and -1. Second eigenvalue of G is alpha * (-1) = -0.85. |lambda_2| = 0.85. Gap = 0.15. T_bound = ceil(ln(1e-6)/ln(0.85)) = 86.'
      }
    ],
    constraints: [
      '2 <= n <= 30',
      '0.1 <= alpha <= 0.99'
    ],
    expectedComplexity: {
      time: 'O(n^3)',
      space: 'O(n^2)'
    },
    starterCode: `def analyze_spectral_gap(P: list[list[float]], alpha: float = 0.85) -> tuple[float, float, int]:
    """
    Computes second eigenvalue magnitude, spectral gap, and theoretical iteration bound.
    
    Args:
        P: n x n row-stochastic matrix.
        alpha: Damping factor.
        
    Returns:
        (abs_lambda2, spectral_gap, T_bound)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def analyze_spectral_gap(P: list[list[float]], alpha: float = 0.85) -> tuple[float, float, int]:
    import numpy as np
    import math
    n = len(P)
    P_mat = np.array(P, dtype=float)
    v = np.ones(n, dtype=float) / n
    
    # Google matrix G
    G = alpha * P_mat + (1.0 - alpha) * np.outer(np.ones(n), v)
    
    # Eigenvalues
    eigvals = np.linalg.eigvals(G)
    # Sort by absolute magnitude descending
    abs_eigvals = sorted([float(abs(e)) for e in eigvals], reverse=True)
    
    abs_lambda2 = abs_eigvals[1] if len(abs_eigvals) > 1 else 0.0
    gap = 1.0 - abs_lambda2
    
    T_bound = math.ceil(math.log(1e-6) / math.log(alpha))
    return round(abs_lambda2, 4), round(gap, 4), int(T_bound)
`,
    editorial: `### Algorithmic Approach

1. Form Google matrix $G = \\alpha P + (1 - \\alpha) \\mathbf{1} v^T$.
2. Compute eigenvalues of $G$ with \`np.linalg.eigvals(G)\`.
3. Sort absolute values in descending order. The first is $1.0$, the second is $|\\lambda_2|$.
4. Spectral gap is $1 - |\\lambda_2|$.
5. Compute upper bound $T_{\\text{bound}} = \\lceil \\ln(10^{-6}) / \\ln(\\alpha) \\rceil$.`,
    hints: [
      'Construct G = alpha * P + (1 - alpha) * np.outer(np.ones(n), v).',
      'Compute np.linalg.eigvals(G), take absolute values, and sort descending.',
      'abs_lambda2 is index 1 in the sorted list.'
    ],
    testCases: [
      {
        inputs: [[[0.0, 1.0], [1.0, 0.0]], 0.85],
        expected: [0.85, 0.15, 86]
      },
      {
        inputs: [[[0.5, 0.5], [0.5, 0.5]], 0.85],
        expected: [0.0, 1.0, 86]
      }
    ],
    defaultCustomInput: '[[0.0, 1.0], [1.0, 0.0]], 0.85',
    suggestedVisualizer: 'stationary-plot'
  },
  {
    id: 'm3-p9',
    moduleId: 'module-3',
    order: 9,
    title: 'Sparse Matrix PageRank',
    difficulty: 'Medium',
    tags: ['Sparse Matrix', 'Adjacency List', 'Scalability'],
    funcName: 'sparse_pagerank',
    description: `When knowledge graphs scale to tens of thousands of entities, storing an $n \\times n$ dense matrix consumes gigabytes of memory.
Instead, we represent the graph as an **outgoing adjacency list** with edge weights:
\`graph[u] = [(v1, w1), (v2, w2), ...]\`

Given:
- Number of nodes $n$.
- Adjacency list \`graph\` where \`graph[u]\` is a list of tuples \`(v, weight)\`.
- Damping factor $\\alpha = 0.85$.
- Convergence tolerance $10^{-6}$.

Implement a sparse PageRank algorithm that runs in $O(|E|)$ time per iteration without ever allocating a 2D matrix.
Handle dangling nodes (nodes with empty neighbor lists) by distributing their probability mass across uniform teleportation $v = [1/n, \\dots, 1/n]$.

Return the PageRank vector rounded to 4 decimal places.`,
    mathematicalExplanation: `In sparse representation, the vector-matrix multiplication $r P$ is evaluated by pushing probability mass from each source node $u$ across its outgoing edges:
$$r_{\\text{next}}[v] \\mathrel{+}= \\alpha \\cdot r[u] \\cdot \\frac{w(u, v)}{\\sum_{k} w(u, k)}$$
Nodes with out-degree zero contribute to a scalar dangling pool $s = \\sum_{u \\in \\mathcal{D}} r[u]$, which is broadcast to all nodes:
$$r_{\\text{next}}[j] \\mathrel{+}= \\left( \\alpha s + (1 - \\alpha) \\right) \\frac{1}{n}$$
Memory complexity is strictly $O(|V| + |E|)$.`,
    chimeraContext: `Directly used in Chimera\'s Graph Indexer. Enables calculating entity PageRank over multi-million-triple cross-modal corpora within RAM constraints.`,
    examples: [
      {
        input: 'n = 3, graph = [[(1, 1.0), (2, 1.0)], [(2, 1.0)], []]',
        output: '[0.0617, 0.0879, 0.8504]',
        explanation: 'Node 2 receives traffic from 0 and 1, plus its own dead-end feedback, accumulating dominant mass.'
      }
    ],
    constraints: [
      '1 <= n <= 5000',
      '0 <= |E| <= 50000'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot (|V| + |E|))',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def sparse_pagerank(n: int, graph: list[list[tuple[int, float]]], alpha: float = 0.85) -> list[float]:
    """
    Computes PageRank using sparse adjacency list without 2D matrix allocation.
    
    Args:
        n: Number of nodes.
        graph: graph[u] = [(v, weight), ...]
        alpha: Damping factor.
        
    Returns:
        PageRank vector of length n rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def sparse_pagerank(n: int, graph: list[list[tuple[int, float]]], alpha: float = 0.85) -> list[float]:
    # Precompute out-degree sums and normalized outgoing edge weights
    norm_edges = []
    dangling_nodes = []
    for u in range(n):
        edges = graph[u]
        total_w = sum(w for _, w in edges)
        if total_w > 0:
            norm_edges.append([(v, w / total_w) for v, w in edges])
        else:
            norm_edges.append([])
            dangling_nodes.append(u)
            
    v_teleport = 1.0 / n
    r = [v_teleport] * n
    
    for _ in range(150):
        r_next = [0.0] * n
        # Push probability mass along edges
        for u in range(n):
            ru = r[u]
            if ru == 0.0 or not norm_edges[u]:
                continue
            scaled_ru = alpha * ru
            for v, p_uv in norm_edges[u]:
                r_next[v] += scaled_ru * p_uv
                
        # Handle dangling nodes
        dangling_mass = sum(r[u] for u in dangling_nodes)
        teleport_boost = (alpha * dangling_mass + (1.0 - alpha)) * v_teleport
        
        # Add teleportation to all nodes
        for j in range(n):
            r_next[j] += teleport_boost
            
        # Check convergence
        diff = sum(abs(r_next[j] - r[j]) for j in range(n))
        r = r_next
        if diff < 1e-6:
            break
            
    return [round(x, 4) for x in r]
`,
    editorial: `### Algorithmic Approach

1. Precompute normalized transition weights for each outgoing edge $(u, v)$: $p_{uv} = w(u, v) / \\sum_k w(u, k)$.
2. Identify all dangling nodes $u$ where out-degree is 0.
3. In each iteration:
   - For each node $u$ with outgoing edges, push $\\alpha \\cdot r[u] \\cdot p_{uv}$ to $r_{next}[v]$.
   - Compute scalar dangling mass $s = \\sum_{u \\in \\mathcal{D}} r[u]$.
   - Teleport boost is $\\gamma = (\\alpha s + (1 - \\alpha)) / n$.
   - Add $\\gamma$ to all $r_{next}[j]$.
   - Check $L_1$ convergence.
4. Total memory is strictly proportional to $|V| + |E|$.`,
    hints: [
      'Precompute normalized edge weights so you do not re-divide during each iteration.',
      'Loop over each node u, and for each outgoing edge (v, prob), add alpha * r[u] * prob to r_next[v].',
      'Add (alpha * sum_dangling + (1 - alpha)) / n to all nodes at the end of each iteration.'
    ],
    testCases: [
      {
        inputs: [3, [[[1, 1.0], [2, 1.0]], [[2, 1.0]], []], 0.85],
        expected: [0.3509, 0.2111, 0.438]
      },
      {
        inputs: [2, [[[1, 1.0]], [[0, 1.0]]], 0.85],
        expected: [0.5, 0.5]
      }
    ],
    defaultCustomInput: '2, [[[1, 1.0]], [[0, 1.0]]], 0.85',
    suggestedVisualizer: 'pagerank-visualizer'
  },
  {
    id: 'm3-p10',
    moduleId: 'module-3',
    order: 10,
    title: 'Optimized PageRank with Dangling Pool Accumulation',
    difficulty: 'Hard',
    tags: ['Optimization', 'Vectorization', 'Production Engineering'],
    funcName: 'optimized_pagerank_pipeline',
    description: `In high-performance graph engines, PageRank is optimized by:
1. Converting edges into flat contiguous CSR arrays.
2. Accumulating dangling probability in an $O(1)$ scalar register.
3. Normalizing probability mass after each step to prevent floating point cancellation drift.

Given:
- Node count $n$.
- Directed edge list with weights: \`[[u, v, w], ...]\`.
- Damping factor $\\alpha = 0.85$.
- Max iterations $100$.

Implement this optimized pipeline. Return the top-K highest-ranked nodes as a list of tuples \`[(node_id, score), ...]\` sorted by score descending, with $K = 5$ (or all $n$ if $n < 5$). Round scores to 4 decimal places.`,
    mathematicalExplanation: `In finite-precision IEEE 754 arithmetic, repeatedly adding small probabilities causes floating point absorption (catastrophic cancellation). Re-normalizing:
$$r \\leftarrow \\frac{r}{\\sum_{i=0}^{n-1} r_i}$$
at the conclusion of each power iteration step guarantees that $\\|r\\|_1 = 1.0$ remains numerically exact throughout hundreds of iterations.`,
    chimeraContext: `Production graph engine implementation inside Chimera\'s retrieval microservice, balancing floating point stability with low execution latency.`,
    examples: [
      {
        input: 'n = 3, edges = [[0, 1, 1.0], [1, 2, 1.0], [2, 0, 1.0]]',
        output: '[(0, 0.3333), (1, 0.3333), (2, 0.3333)]',
        explanation: 'Symmetric 3-cycle yields equal PageRank scores of 1/3.'
      }
    ],
    constraints: [
      '1 <= n <= 1000',
      '0 <= len(edges) <= 10000'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot (|V| + |E|))',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def optimized_pagerank_pipeline(n: int, edges: list[list[float]], alpha: float = 0.85) -> list[tuple[int, float]]:
    """
    Optimized PageRank returning top-5 nodes as [(node_id, score), ...].
    
    Args:
        n: Number of nodes.
        edges: List of [u, v, w].
        alpha: Damping factor.
        
    Returns:
        Top-5 (or n) (node_id, score) pairs sorted by score desc.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def optimized_pagerank_pipeline(n: int, edges: list[list[float]], alpha: float = 0.85) -> list[tuple[int, float]]:
    adj = {i: [] for i in range(n)}
    for edge in edges:
        u, v, w = int(edge[0]), int(edge[1]), float(edge[2])
        adj[u].append((v, w))
        
    out_weights = [sum(w for _, w in adj[i]) for i in range(n)]
    dangling = [i for i in range(n) if out_weights[i] == 0]
    
    # Pre-normalized adjacency
    norm_adj = []
    for i in range(n):
        if out_weights[i] > 0:
            norm_adj.append([(v, w / out_weights[i]) for v, w in adj[i]])
        else:
            norm_adj.append([])
            
    r = [1.0 / n] * n
    
    for _ in range(100):
        r_next = [0.0] * n
        for u in range(n):
            ru = r[u]
            if ru > 0 and norm_adj[u]:
                scaled = alpha * ru
                for v, p in norm_adj[u]:
                    r_next[v] += scaled * p
                    
        # Scalar dangling pool
        dangling_mass = sum(r[i] for i in dangling)
        base_teleport = (alpha * dangling_mass + (1.0 - alpha)) / n
        
        for j in range(n):
            r_next[j] += base_teleport
            
        # Numerical normalization
        total_mass = sum(r_next)
        if total_mass > 0:
            r_next = [x / total_mass for x in r_next]
            
        diff = sum(abs(r_next[j] - r[j]) for j in range(n))
        r = r_next
        if diff < 1e-6:
            break
            
    scored_nodes = [(i, round(r[i], 4)) for i in range(n)]
    scored_nodes.sort(key=lambda x: (-x[1], x[0]))
    return scored_nodes[:min(5, n)]
`,
    editorial: `### Algorithmic Approach

1. Aggregate edges by source node and compute normalized edge weights.
2. Maintain dangling node indices to compute dangling scalar sum in $O(|\\mathcal{D}|)$.
3. In each iteration, push probability along edges, add broadcast teleportation, and re-normalize $\\sum r = 1.0$.
4. Sort by score descending and return top $\\min(5, n)$ nodes.`,
    hints: [
      'Pre-normalize weights so each outgoing edge has weight w / sum(w).',
      'Compute dangling sum as a scalar rather than row-by-row.',
      'Re-normalize r_next by dividing by sum(r_next) to prevent numerical drift.'
    ],
    testCases: [
      {
        inputs: [3, [[0, 1, 1.0], [1, 2, 1.0], [2, 0, 1.0]], 0.85],
        expected: [[0, 0.3333], [1, 0.3333], [2, 0.3333]]
      },
      {
        inputs: [2, [[0, 1, 1.0]], 0.85],
        expected: [[1, 0.6491], [0, 0.3509]]
      }
    ],
    defaultCustomInput: '3, [[0, 1, 1.0], [1, 2, 1.0], [2, 0, 1.0]], 0.85',
    suggestedVisualizer: 'pagerank-visualizer'
  }
];
