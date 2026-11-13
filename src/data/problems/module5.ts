import { Problem } from '../../types/problem';

export const MODULE_5_PROBLEMS: Problem[] = [
  {
    id: 'm5-p1',
    moduleId: 'module-5',
    order: 1,
    title: 'Retrieve All Entities Within K Hops of a Seed Entity',
    difficulty: 'Easy',
    tags: ['K-Hop Expansion', 'Graph Traversal', 'Breadth-First Search'],
    funcName: 'k_hop_neighborhood',
    description: `Given a directed knowledge graph with $n$ nodes ($0$ to $n-1$), a directed edge list \`edges = [[u, v], ...]\`, a starting seed entity ID $s$, and a maximum hop distance $K$:

Retrieve all unique entities that can be reached from $s$ in at most $K$ hops (including $s$ at hop 0).

Return a dictionary mapping each hop distance $d \\in [0, K]$ to the sorted list of entities discovered at exactly distance $d$:
\`{0: [s], 1: [v1, v2], ..., K: [vk]}\`
Entities must only appear at their shortest hop distance from $s$.`,
    mathematicalExplanation: `The $K$-hop neighborhood of vertex $s$ is defined by the shortest path distance metric:
$$\\mathcal{N}_K(s) = \\{ v \\in V \\mid \\text{dist}(s, v) \\le K \\}$$
Breadth-First Search (BFS) computes this in $O(|V| + |E|)$ time by systematically exploring all vertices at depth $d$ before proceeding to depth $d+1$.`,
    chimeraContext: `In Chimera, initial candidate pruning often begins with a 2-hop or 3-hop neighborhood expansion from query seeds to restrict the search space before running fine-grained scoring.`,
    examples: [
      {
        input: 'n = 4, edges = [[0, 1], [1, 2], [0, 2], [2, 3]], s = 0, K = 2',
        output: '{0: [0], 1: [1, 2], 2: [3]}',
        explanation: 'Hop 0 is {0}. Hop 1 directly reaches {1, 2}. Hop 2 reaches {3} via 2->3. Node 2 is at hop 1 (direct 0->2), so not in hop 2.'
      }
    ],
    constraints: [
      '1 <= n <= 1000',
      '0 <= K <= 10',
      '0 <= s < n'
    ],
    expectedComplexity: {
      time: 'O(|V| + |E|)',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def k_hop_neighborhood(n: int, edges: list[list[int]], s: int, K: int) -> dict[int, list[int]]:
    """
    Computes entities at each hop distance from s up to K hops.
    
    Args:
        n: Number of nodes.
        edges: Directed edges [u, v].
        s: Seed node ID.
        K: Max hop distance.
        
    Returns:
        Dict mapping hop distance (0..K) to sorted list of node IDs.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def k_hop_neighborhood(n: int, edges: list[list[int]], s: int, K: int) -> dict[int, list[int]]:
    from collections import deque
    adj = {i: [] for i in range(n)}
    for u, v in edges:
        adj[u].append(v)
        
    dist = {}
    dist[s] = 0
    q = deque([s])
    
    while q:
        curr = q.popleft()
        d = dist[curr]
        if d >= K:
            continue
        for neighbor in adj[curr]:
            if neighbor not in dist:
                dist[neighbor] = d + 1
                q.append(neighbor)
                
    result = {hop: [] for hop in range(K + 1)}
    for node, d in dist.items():
        if d <= K:
            result[d].append(node)
            
    for hop in result:
        result[hop].sort()
        
    return result
`,
    editorial: `### Algorithmic Approach

1. Build an adjacency list from edges.
2. Maintain a distance map \`dist\` recording the shortest hop distance from $s$.
3. Run BFS: for each node at distance $d < K$, explore neighbors. If an unvisited neighbor is found, set \`dist[v] = d + 1\` and enqueue.
4. Bucket nodes into a dictionary by distance and sort each bucket.`,
    hints: [
      'Use BFS with a queue keeping track of node distance.',
      'Only enqueue neighbors if d < K.',
      'Sort each distance bucket ascending.'
    ],
    testCases: [
      {
        inputs: [4, [[0, 1], [1, 2], [0, 2], [2, 3]], 0, 2],
        expected: {0: [0], 1: [1, 2], 2: [3]}
      },
      {
        inputs: [3, [[0, 1]], 0, 2],
        expected: {0: [0], 1: [1], 2: []}
      }
    ],
    defaultCustomInput: '4, [[0, 1], [1, 2], [0, 2], [2, 3]], 0, 2',
    suggestedVisualizer: 'multi-hop-explorer'
  },
  {
    id: 'm5-p2',
    moduleId: 'module-5',
    order: 2,
    title: 'Shortest Relationship Path Between Two Entities',
    difficulty: 'Easy',
    tags: ['Shortest Path', 'Relationship Paths', 'Breadth-First Search'],
    funcName: 'find_shortest_relation_path',
    description: `In a knowledge graph, edges carry semantic relationship labels:
\`(head, relation, tail)\` (e.g. \`["NVIDIA", "MANUFACTURES", "H100"]\`).

Given a list of triples \`triples = [[head, relation, tail], ...]\`, a source entity \`start_entity\`, and a target entity \`end_entity\`:

Find the shortest directed path from \`start_entity\` to \`end_entity\`.

Return the path formatted as an alternating list of entities and relations:
\`[start_entity, relation_1, entity_1, relation_2, ..., end_entity]\`
If no path exists, return an empty list \`[]\`.
If multiple shortest paths have the same length, return any valid shortest path. If start equals end, return \`[start_entity]\`.`,
    mathematicalExplanation: `A path $\\mathcal{P}$ of length $L$ in a multi-relational graph is an alternating sequence:
$$\\mathcal{P} = (v_0, r_1, v_1, r_2, v_2, \\dots, r_L, v_L)$$
where each $(v_{i-1}, r_i, v_i) \\in E$. BFS computes the path with minimum edge count $L$ in $O(|V| + |E|)$ time.`,
    chimeraContext: `When Chimera presents an answer to the user, it provides the reasoning provenance by outputting this exact relation path (e.g. "Attention -> USED_BY -> Transformer -> DEVELOPED_BY -> Google").`,
    examples: [
      {
        input: 'triples = [["A", "rel1", "B"], ["B", "rel2", "C"], ["A", "rel3", "C"]], start_entity = "A", end_entity = "C"',
        output: '["A", "rel3", "C"]',
        explanation: 'Path A -> rel3 -> C has length 1, shorter than A -> B -> C of length 2.'
      }
    ],
    constraints: [
      '1 <= len(triples) <= 1000'
    ],
    expectedComplexity: {
      time: 'O(|V| + |E|)',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def find_shortest_relation_path(triples: list[list[str]], start_entity: str, end_entity: str) -> list[str]:
    """
    Finds the shortest alternating relationship path between start and end entities.
    
    Args:
        triples: List of [head, relation, tail].
        start_entity: Source entity name.
        end_entity: Target entity name.
        
    Returns:
        [head, rel1, node1, ..., tail] or [] if no path.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def find_shortest_relation_path(triples: list[list[str]], start_entity: str, end_entity: str) -> list[str]:
    if start_entity == end_entity:
        return [start_entity]
        
    from collections import deque
    adj = {}
    for h, r, t in triples:
        if h not in adj:
            adj[h] = []
        adj[h].append((r, t))
        
    # Queue stores (current_node, current_path)
    q = deque([(start_entity, [start_entity])])
    visited = set([start_entity])
    
    while q:
        curr, path = q.popleft()
        if curr == end_entity:
            return path
        for rel, nxt in adj.get(curr, []):
            if nxt not in visited:
                visited.add(nxt)
                q.append((nxt, path + [rel, nxt]))
                
    return []
`,
    editorial: `### Algorithmic Approach

1. If \`start_entity == end_entity\`, return \`[start_entity]\`.
2. Construct adjacency mapping \`adj[head] = [(relation, tail)]\`.
3. BFS queue stores \`(current_node, path_so_far)\`.
4. The first time \`end_entity\` is popped or reached, the path is guaranteed to be of minimal hop length.
5. Return the reconstructed alternating list.`,
    hints: [
      'Check if start == end first.',
      'Store the full alternating path in the queue alongside the current node.',
      'Use a visited set so you do not visit nodes multiple times.'
    ],
    testCases: [
      {
        inputs: [[["A", "rel1", "B"], ["B", "rel2", "C"], ["A", "rel3", "C"]], "A", "C"],
        expected: ["A", "rel3", "C"]
      },
      {
        inputs: [[["A", "rel1", "B"], ["B", "rel2", "C"]], "A", "C"],
        expected: ["A", "rel1", "B", "rel2", "C"]
      },
      {
        inputs: [[["A", "rel1", "B"]], "B", "A"],
        expected: []
      }
    ],
    defaultCustomInput: '[["A", "rel1", "B"], ["B", "rel2", "C"], ["A", "rel3", "C"]], "A", "C"',
    suggestedVisualizer: 'multi-hop-explorer'
  },
  {
    id: 'm5-p3',
    moduleId: 'module-5',
    order: 3,
    title: 'Extract Query-Specific Subgraph',
    difficulty: 'Medium',
    tags: ['Subgraph Extraction', 'Steiner Tree', 'Context Pruning'],
    funcName: 'extract_query_subgraph',
    description: `Feeding an entire knowledge graph to an LLM exceeds context limits. Instead, Chimera extracts an **induced query-specific subgraph** containing only the most informative nodes and interconnecting edges.

Given:
- Directed triples with weights: \`triples = [[head, relation, tail, weight], ...]\`.
- A dictionary of candidate entity scores: \`entity_scores = {entity: score, ...}\`.
- Minimum score threshold \`score_threshold\` (float).
- Maximum total nodes allowed \`max_nodes\` (int).

Steps:
1. Select candidate entities whose score $\\ge \\text{score\\_threshold}$.
2. If the number of candidates exceeds \`max_nodes\`, keep only the top \`max_nodes\` highest scoring entities (tie-break alphabetically).
3. Extract all directed edges from \`triples\` whose **both** head and tail belong to the selected candidate set.
4. Return a dictionary:
\`{ 'nodes': sorted_list_of_node_names, 'edges': [[head, relation, tail, weight], ...] }\`
Sort \`edges\` by weight descending, then head ascending.`,
    mathematicalExplanation: `Let $V_q = \\text{TopK}(\\{u \\in V \\mid r_u \\ge \\theta\\})$ be the filtered query entity set.
The induced subgraph $G[V_q] = (V_q, E_q)$ retains exactly the edges whose endpoints both fall within the selected semantic core:
$$E_q = \\{ (u, r, v, w) \\in E \\mid u, v \\in V_q \\}$$
This preserves relational coherence while eliminating peripheral clutter.`,
    chimeraContext: `This induced subgraph is serialized into GraphViz / Cypher notation and inserted into the prompt for LLM answer generation in Chimera.`,
    examples: [
      {
        input: 'triples = [["A", "r1", "B", 1.0], ["B", "r2", "C", 2.0], ["A", "r3", "D", 0.5]], entity_scores = {"A": 0.9, "B": 0.8, "C": 0.7, "D": 0.2}, score_threshold = 0.5, max_nodes = 3',
        output: '{"nodes": ["A", "B", "C"], "edges": [["B", "r2", "C", 2.0], ["A", "r1", "B", 1.0]]}',
        explanation: 'Nodes A, B, C pass threshold. D (0.2) is excluded. Edge A->D is excluded because D is absent.'
      }
    ],
    constraints: [
      '1 <= len(triples) <= 2000',
      'max_nodes >= 1'
    ],
    expectedComplexity: {
      time: 'O(|V| \\log |V| + |E|)',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def extract_query_subgraph(triples: list[list[any]], entity_scores: dict[str, float], score_threshold: float, max_nodes: int) -> dict:
    """
    Extracts an induced query-specific subgraph for prompt augmentation.
    
    Args:
        triples: [[head, relation, tail, weight], ...]
        entity_scores: {entity: score, ...}
        score_threshold: Minimum score required.
        max_nodes: Maximum nodes retained.
        
    Returns:
        {'nodes': list[str], 'edges': list[list]}
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def extract_query_subgraph(triples: list[list[any]], entity_scores: dict[str, float], score_threshold: float, max_nodes: int) -> dict:
    # 1. Filter by threshold
    candidates = [e for e, sc in entity_scores.items() if sc >= score_threshold]
    # 2. Sort by score desc, name asc
    candidates.sort(key=lambda e: (-entity_scores[e], e))
    selected_nodes = sorted(candidates[:max_nodes])
    node_set = set(selected_nodes)
    
    # 3. Filter edges
    subgraph_edges = []
    for edge in triples:
        h, r, t, w = edge[0], edge[1], edge[2], float(edge[3])
        if h in node_set and t in node_set:
            subgraph_edges.append([h, r, t, w])
            
    subgraph_edges.sort(key=lambda e: (-e[3], e[0], e[1]))
    return {
        'nodes': selected_nodes,
        'edges': subgraph_edges
    }
`,
    editorial: `### Algorithmic Approach

1. Filter entities with score $\\ge \\text{score\\_threshold}$.
2. Sort candidates by score descending and take the top \`max_nodes\`.
3. Construct a fast lookup set of selected node names.
4. Iterate through all triples: keep edges where both $head \\in \\text{node\\_set}$ and $tail \\in \\text{node\\_set}$.
5. Sort edges by weight descending and return dictionary.`,
    hints: [
      'Filter entity_scores where score >= score_threshold.',
      'Take up to max_nodes using key lambda e: (-scores[e], e).',
      'An edge is retained if and only if BOTH its head and tail are in the selected node set.'
    ],
    testCases: [
      {
        inputs: [
          [["A", "r1", "B", 1.0], ["B", "r2", "C", 2.0], ["A", "r3", "D", 0.5]],
          {"A": 0.9, "B": 0.8, "C": 0.7, "D": 0.2},
          0.5,
          3
        ],
        expected: {
          'nodes': ["A", "B", "C"],
          'edges': [["B", "r2", "C", 2.0], ["A", "r1", "B", 1.0]]
        }
      }
    ],
    defaultCustomInput: '[["A", "r1", "B", 1.0], ["B", "r2", "C", 2.0], ["A", "r3", "D", 0.5]], {"A": 0.9, "B": 0.8, "C": 0.7, "D": 0.2}, 0.5, 3',
    suggestedVisualizer: 'multi-hop-explorer'
  },
  {
    id: 'm5-p4',
    moduleId: 'module-5',
    order: 4,
    title: 'Rank Candidate Entities Using Graph Scores',
    difficulty: 'Easy',
    tags: ['Graph Scoring', 'Harmonic Centrality', 'Ranking'],
    funcName: 'rank_by_graph_centrality',
    description: `Given a graph with $n$ nodes and unweighted directed edges \`edges\`:

Compute the **Harmonic Centrality** for each node $u$:
$$H(u) = \\sum_{v \\neq u} \\frac{1}{\\text{dist}(v, u)}$$
where $\\text{dist}(v, u)$ is the shortest path distance from $v$ to $u$. If $u$ is unreachable from $v$, $\\frac{1}{\\infty} = 0$.

Return a list of tuples \`[(node_id, score), ...]\` sorted by score descending. Round scores to 4 decimal places.
If scores are tied, sort by node ID ascending.`,
    mathematicalExplanation: `Harmonic centrality handles disconnected graphs robustly: unlike Closeness Centrality $\\frac{n-1}{\\sum \\text{dist}(v, u)}$ which degenerates to 0 if even a single node is unreachable, Harmonic Centrality sums inverted distances $\\frac{1}{\\text{dist}}$, elegantly handling $\\infty$ as 0.`,
    chimeraContext: `Used in Chimera to detect central knowledge entities when the graph contains multiple disconnected island components.`,
    examples: [
      {
        input: 'n = 3, edges = [[0, 1], [1, 2]]',
        output: '[(1, 1.0), (2, 1.5), (0, 0.0)]',
        explanation: 'Node 2 has incoming paths: from 1 (dist 1 -> 1/1 = 1.0), from 0 (dist 2 -> 1/2 = 0.5). H(2) = 1.5. H(1) = 1.0. H(0) = 0.0.'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      '0 <= len(edges) <= 500'
    ],
    expectedComplexity: {
      time: 'O(n \\cdot (|V| + |E|))',
      space: 'O(n^2)'
    },
    starterCode: `def rank_by_graph_centrality(n: int, edges: list[list[int]]) -> list[tuple[int, float]]:
    """
    Computes harmonic centrality and ranks nodes descending.
    
    Args:
        n: Number of nodes.
        edges: Directed [u, v].
        
    Returns:
        List of (node_id, score) sorted desc.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def rank_by_graph_centrality(n: int, edges: list[list[int]]) -> list[tuple[int, float]]:
    from collections import deque
    adj = {i: [] for i in range(n)}
    for u, v in edges:
        adj[u].append(v)
        
    # dist_matrix[v][u] = distance from v to u
    dist_matrix = [[float('inf') for _ in range(n)] for _ in range(n)]
    for start in range(n):
        dist_matrix[start][start] = 0
        q = deque([start])
        while q:
            curr = q.popleft()
            d = dist_matrix[start][curr]
            for neighbor in adj[curr]:
                if dist_matrix[start][neighbor] == float('inf'):
                    dist_matrix[start][neighbor] = d + 1
                    q.append(neighbor)
                    
    harmonic = []
    for u in range(n):
        score = 0.0
        for v in range(n):
            if v != u and dist_matrix[v][u] < float('inf'):
                score += 1.0 / dist_matrix[v][u]
        harmonic.append((u, round(score, 4)))
        
    harmonic.sort(key=lambda x: (-x[1], x[0]))
    return harmonic
`,
    editorial: `### Algorithmic Approach

1. Compute all-pairs shortest paths using BFS from each node $v \\in [0, n-1]$.
2. For each target node $u$, sum $\\frac{1}{\\text{dist}(v, u)}$ across all $v \\neq u$.
3. Sort nodes by harmonic score descending and break ties by node ID ascending.`,
    hints: [
      'Run BFS from each node to compute shortest path distances.',
      'Harmonic score of u is sum(1.0 / dist(v, u) for v != u if reachable).',
      'Sort using (-score, node_id).'
    ],
    testCases: [
      {
        inputs: [3, [[0, 1], [1, 2]]],
        expected: [[2, 1.5], [1, 1.0], [0, 0.0]]
      },
      {
        inputs: [2, [[0, 1], [1, 0]]],
        expected: [[0, 1.0], [1, 1.0]]
      }
    ],
    defaultCustomInput: '3, [[0, 1], [1, 2]]',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm5-p5',
    moduleId: 'module-5',
    order: 5,
    title: 'Combine Node Relevance and Edge Weights',
    difficulty: 'Medium',
    tags: ['Relation Weighting', 'Path Propagation', 'Graph RAG'],
    funcName: 'propagate_with_relation_priors',
    description: `Not all relationships are equally relevant to a query. For instance, in a medical query about drug side effects:
- \`TREATS\` might have relevance weight $0.2$.
- \`CAUSES_ADVERSE_EVENT\` might have relevance weight $1.0$.

Given:
- Directed multi-relational edges: \`[[u, relation, v, base_weight], ...]\`.
- A dictionary of relation priority multipliers: \`relation_priors = {relation: multiplier, ...}\` (defaulting to 1.0 if not listed).
- Personalization vector $v$.
- Number of nodes $n$.

Workflow:
1. Scale each edge weight: $w_{\\text{effective}} = \\text{base\\_weight} \\times \\text{relation\\_priors}[\\text{relation}]$.
2. Sum effective weights for duplicate directed pairs $(u, v)$.
3. Row-normalize into transition matrix $P$ (handling dangling nodes with uniform $1/n$).
4. Run PPR with damping factor $\\alpha = 0.85$.

Return the converged PPR vector rounded to 4 decimal places.`,
    mathematicalExplanation: `Relation-aware transition matrices modulate edge probabilities according to query intent:
$$P_{ij} \\propto \\sum_{r \\in \\mathcal{R}(i, j)} w_{ij, r} \\cdot \\mu(r)$$
where $\\mu(r)$ is the prior relevance of relationship type $r$.`,
    chimeraContext: `In Chimera, user queries are classified into intent categories (e.g. Causality, Hierarchy, Attribution). Intent classifiers adjust relation priors $\\mu(r)$ to focus the graph traversal on causal edges.`,
    examples: [
      {
        input: 'n = 3, edges = [[0, "rel_low", 1, 10.0], [0, "rel_high", 2, 2.0]], relation_priors = {"rel_low": 0.1, "rel_high": 5.0}, v = [1.0, 0.0, 0.0]',
        output: '[0.15, 0.0773, 0.7727]',
        explanation: '0->1 has effective weight 10*0.1 = 1.0. 0->2 has 2*5.0 = 10.0. Node 2 receives 10/11 (~91%) of transmitted mass.'
      }
    ],
    constraints: [
      '2 <= n <= 100',
      '0 <= len(edges) <= 500'
    ],
    expectedComplexity: {
      time: 'O(|E| + T \\cdot n^2)',
      space: 'O(n^2)'
    },
    starterCode: `def propagate_with_relation_priors(n: int, edges: list[list[any]], relation_priors: dict[str, float], v: list[float]) -> list[float]:
    """
    Computes PPR with relation-modulated transition matrix.
    
    Args:
        n: Number of nodes.
        edges: [[u, relation, v, base_weight], ...]
        relation_priors: {relation: multiplier}
        v: Personalization vector.
        
    Returns:
        Converged PPR vector.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def propagate_with_relation_priors(n: int, edges: list[list[any]], relation_priors: dict[str, float], v: list[float]) -> list[float]:
    W = [[0.0 for _ in range(n)] for _ in range(n)]
    for edge in edges:
        u, rel, dest, w = int(edge[0]), str(edge[1]), int(edge[2]), float(edge[3])
        multiplier = relation_priors.get(rel, 1.0)
        W[u][dest] += w * multiplier
        
    row_sums = [sum(W[i]) for i in range(n)]
    P = []
    for i in range(n):
        if row_sums[i] > 0:
            P.append([W[i][j] / row_sums[i] for j in range(n)])
        else:
            P.append([1.0 / n for _ in range(n)])
            
    alpha = 0.85
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
        
    return [round(x, 4) for x in r]
`,
    editorial: `### Algorithmic Approach

1. Form matrix $W$ by multiplying edge base weights by their relation prior multiplier: $W[u][v] += w \\cdot \\text{prior}(r)$.
2. Normalize row sums to build transition matrix $P$.
3. Run power iteration with damping $\\alpha = 0.85$.
4. Return rounded result.`,
    hints: [
      'Scale each edge weight by relation_priors.get(rel, 1.0).',
      'Normalize the resulting weighted adjacency matrix.',
      'Run standard PageRank power iteration.'
    ],
    testCases: [
      {
        inputs: [
          3,
          [[0, "rel_low", 1, 10.0], [0, "rel_high", 2, 2.0]],
          {"rel_low": 0.1, "rel_high": 5.0},
          [1.0, 0.0, 0.0]
        ],
        expected: [0.15, 0.0773, 0.7727]
      }
    ],
    defaultCustomInput: '3, [[0, "rel_low", 1, 10.0], [0, "rel_high", 2, 2.0]], {"rel_low": 0.1, "rel_high": 5.0}, [1.0, 0.0, 0.0]',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm5-p6',
    moduleId: 'module-5',
    order: 6,
    title: 'Find the Most Relevant Evidence Path',
    difficulty: 'Medium',
    tags: ['Path Scoring', 'Dijkstra', 'Most Probable Path'],
    funcName: 'most_probable_path',
    description: `Given a directed weighted graph where edge weights represent transition probabilities $p(u, v) \\in (0.0, 1.0]$:

The **evidence score** of a multi-hop reasoning path $\\mathcal{P} = (v_0, v_1, \\dots, v_k)$ is the **product of transition probabilities** along the path:
$$\\text{Score}(\\mathcal{P}) = \\prod_{i=1}^k p(v_{i-1}, v_i)$$

Given $n$ nodes, edge list \`edges = [[u, v, prob], ...]\`, start node $s$, and end node $t$:
Find the path that **maximizes** the product of probabilities.

Return a tuple \`(path: list[int], round(max_prob, 4))\`.
If no path exists, return \`([], 0.0)\`.`,
    mathematicalExplanation: `Maximizing a product of probabilities $\\prod p_i$ is equivalent to minimizing the sum of negative logarithms:
$$\\arg\\max \\prod_{i=1}^k p_i = \\arg\\min \\sum_{i=1}^k -\\ln(p_i)$$
Because $p_i \\in (0, 1]$, $-\\ln(p_i) \\ge 0$. We can therefore run **Dijkstra\'s Algorithm** with transformed edge weights $w\' = -\\ln(p_i)$ to find the optimal path in $O(|E| + |V| \\log |V|)$ time.`,
    chimeraContext: `When generating an explanation chain for a retrieved fact, Chimera selects the most probable evidence path to present to the user as verifiable reasoning provenance.`,
    examples: [
      {
        input: 'n = 3, edges = [[0, 1, 0.8], [1, 2, 0.9], [0, 2, 0.5]], s = 0, t = 2',
        output: '([0, 1, 2], 0.72)',
        explanation: 'Path 0->1->2 has probability 0.8 * 0.9 = 0.72. Direct edge 0->2 has 0.5. 0.72 > 0.5, so 0->1->2 is optimal.'
      }
    ],
    constraints: [
      '2 <= n <= 500',
      '0.0 < prob <= 1.0'
    ],
    expectedComplexity: {
      time: 'O(|E| \\log |V|)',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def most_probable_path(n: int, edges: list[list[float]], s: int, t: int) -> tuple[list[int], float]:
    """
    Finds the path maximizing the product of transition probabilities using Dijkstra on -ln(p).
    
    Args:
        n: Number of nodes.
        edges: List of [u, v, prob].
        s: Source node ID.
        t: Target node ID.
        
    Returns:
        (path, max_prob)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def most_probable_path(n: int, edges: list[list[float]], s: int, t: int) -> tuple[list[int], float]:
    import heapq
    import math
    
    adj = {i: [] for i in range(n)}
    for edge in edges:
        u, v, p = int(edge[0]), int(edge[1]), float(edge[2])
        if p > 0:
            adj[u].append((v, p, -math.log(p)))
            
    # Priority queue: (cost, current_node, path)
    pq = [(0.0, s, [s])]
    best_cost = {s: 0.0}
    
    while pq:
        cost, curr, path = heapq.heappop(pq)
        if curr == t:
            prob = math.exp(-cost)
            return path, round(prob, 4)
            
        if cost > best_cost.get(curr, float('inf')):
            continue
            
        for nxt, p, edge_cost in adj[curr]:
            new_cost = cost + edge_cost
            if new_cost < best_cost.get(nxt, float('inf')):
                best_cost[nxt] = new_cost
                heapq.heappush(pq, (new_cost, nxt, path + [nxt]))
                
    return [], 0.0
`,
    editorial: `### Algorithmic Approach

1. Transform each probability $p$ into non-negative additive cost $c = -\\ln(p)$.
2. Use a min-heap priority queue storing \`(cumulative_cost, node, path)\`.
3. Pop the lowest cost entry. If target $t$ is reached, compute the true probability $\\exp(-\\text{cost})$ and return.
4. Total time complexity is $O(|E| \\log |V|)$.`,
    hints: [
      'Take negative logarithm of probabilities: -math.log(prob).',
      'Use Dijkstra with a min-priority queue (heapq).',
      'Reconvert cost back to probability using math.exp(-cost).'
    ],
    testCases: [
      {
        inputs: [3, [[0, 1, 0.8], [1, 2, 0.9], [0, 2, 0.5]], 0, 2],
        expected: [[0, 1, 2], 0.72]
      },
      {
        inputs: [3, [[0, 1, 0.5]], 0, 2],
        expected: [[], 0.0]
      }
    ],
    defaultCustomInput: '3, [[0, 1, 0.8], [1, 2, 0.9], [0, 2, 0.5]], 0, 2',
    suggestedVisualizer: 'multi-hop-explorer'
  },
  {
    id: 'm5-p7',
    moduleId: 'module-5',
    order: 7,
    title: 'Retrieve Entities with Relation Constraints',
    difficulty: 'Medium',
    tags: ['Relation Constraints', 'Multi-Hop Path', 'Knowledge Graph'],
    funcName: 'retrieve_by_relation_sequence',
    description: `Often a retrieval task requires following a specific semantic schema.
For example, find:
\`SeedEntity -> DEVELOPED_BY -> Company -> LOCATED_IN -> Country\`

Given:
- Directed labeled triples: \`triples = [[head, relation, tail], ...]\`.
- Start entity name \`start_entity\`.
- A sequence of required relation types: \`relation_sequence = ["rel1", "rel2", ...]\`.

Find all unique destination entities that can be reached starting from \`start_entity\` and traversing edges that strictly match the given \`relation_sequence\` in order.

Return the list of destination entity names sorted in alphabetical order.`,
    mathematicalExplanation: `This implements a **Regular Path Query (RPQ)** where the regular expression is a linear sequence of atomic relations:
$$q = r_1 \\circ r_2 \\circ \\dots \\circ r_L$$
The evaluation matches relational composition in relational algebra:
$$\\mathcal{S}_{k} = \\{ v \\mid \\exists u \\in \\mathcal{S}_{k-1} \\text{ s.t. } (u, r_k, v) \\in E \\}$$`,
    chimeraContext: `Schema-constrained traversal allows Chimera to execute structured semantic queries extracted from questions like "Where are the headquarters of the company that created PyTorch?".`,
    examples: [
      {
        input: 'triples = [["PyTorch", "CREATED_BY", "Meta"], ["Meta", "LOCATED_IN", "USA"], ["Meta", "LOCATED_IN", "California"]], start_entity = "PyTorch", relation_sequence = ["CREATED_BY", "LOCATED_IN"]',
        output: '["California", "USA"]',
        explanation: 'PyTorch -> CREATED_BY -> Meta -> LOCATED_IN -> {USA, California}.'
      }
    ],
    constraints: [
      '1 <= len(triples) <= 1000',
      '1 <= len(relation_sequence) <= 10'
    ],
    expectedComplexity: {
      time: 'O(|sequence| \\cdot |E|)',
      space: 'O(|V|)'
    },
    starterCode: `def retrieve_by_relation_sequence(triples: list[list[str]], start_entity: str, relation_sequence: list[str]) -> list[str]:
    """
    Finds entities reachable following a strict sequence of relations.
    
    Args:
        triples: [[head, relation, tail], ...]
        start_entity: Starting entity name.
        relation_sequence: List of relation names to follow in order.
        
    Returns:
        Sorted list of matching destination entity names.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def retrieve_by_relation_sequence(triples: list[list[str]], start_entity: str, relation_sequence: list[str]) -> list[str]:
    # Group triples: adj[rel][head] = [tail, ...]
    rel_adj = {}
    for h, r, t in triples:
        if r not in rel_adj:
            rel_adj[r] = {}
        if h not in rel_adj[r]:
            rel_adj[r][h] = []
        rel_adj[r][h].append(t)
        
    current_set = set([start_entity])
    for rel in relation_sequence:
        next_set = set()
        r_map = rel_adj.get(rel, {})
        for node in current_set:
            for neighbor in r_map.get(node, []):
                next_set.add(neighbor)
        current_set = next_set
        if not current_set:
            break
            
    return sorted(list(current_set))
`,
    editorial: `### Algorithmic Approach

1. Build index mapping each relation $r$ and head entity $h$ to its tails $t$: \`rel_adj[rel][head] = [tail, ...]\`.
2. Initialize current active entity set: \`current_set = {start_entity}\`.
3. Step through each relation in \`relation_sequence\`:
   - Replace \`current_set\` with all tails reachable from active nodes via that specific relation.
   - If \`current_set\` becomes empty, break early.
4. Return sorted unique entities in \`current_set\`.`,
    hints: [
      'Track a current set of active nodes, starting with {start_entity}.',
      'For each relation in the sequence, expand to all tails matching that relation.',
      'Return sorted list of the final set.'
    ],
    testCases: [
      {
        inputs: [
          [["PyTorch", "CREATED_BY", "Meta"], ["Meta", "LOCATED_IN", "USA"], ["Meta", "LOCATED_IN", "California"]],
          "PyTorch",
          ["CREATED_BY", "LOCATED_IN"]
        ],
        expected: ["California", "USA"]
      },
      {
        inputs: [
          [["A", "rel1", "B"]],
          "A",
          ["rel2"]
        ],
        expected: []
      }
    ],
    defaultCustomInput: '[["PyTorch", "CREATED_BY", "Meta"], ["Meta", "LOCATED_IN", "USA"]], "PyTorch", ["CREATED_BY", "LOCATED_IN"]',
    suggestedVisualizer: 'multi-hop-explorer'
  },
  {
    id: 'm5-p8',
    moduleId: 'module-5',
    order: 8,
    title: 'Compare BFS-Based Retrieval vs PPR-Based Retrieval',
    difficulty: 'Medium',
    tags: ['BFS vs PPR', 'Retrieval Comparison', 'Precision & Recall'],
    funcName: 'compare_bfs_and_ppr_retrieval',
    description: `A central question in Graph RAG: **Why use Personalized PageRank instead of simple Breadth-First Search (BFS)?**

Given:
- A knowledge graph with $n$ nodes and directed edges \`edges\`.
- Seed entity $s$.
- Set of ground-truth relevant entities \`ground_truth\`.
- Budget $K$ (number of candidates to retrieve).

1. **BFS Retrieval:** Run BFS from $s$ to collect the first $K$ non-seed entities encountered.
2. **PPR Retrieval:** Run PPR with restart at $s$ ($\alpha = 0.85$) and select the top $K$ non-seed entities with highest PPR score.
3. Compute Precision and Recall for both methods:
   $$\\text{Precision} = \\frac{|\\text{Retrieved} \\cap \\text{GroundTruth}|}{K}, \\quad \\text{Recall} = \\frac{|\\text{Retrieved} \\cap \\text{GroundTruth}|}{|\\text{GroundTruth}|}$$

Return a dictionary:
\`{ 'bfs_precision': float, 'bfs_recall': float, 'ppr_precision': float, 'ppr_recall': float }\`
Round all metrics to 4 decimal places.`,
    mathematicalExplanation: `BFS treats all edges uniformly and explores nodes in strict hop order without distinguishing between high-degree hubs and tightly-coupled semantic clusters.
PPR aggregates multi-path reinforceability: an entity reachable by ten distinct 3-hop paths will receive a far higher PPR score than an entity connected by a single noisy 1-hop link.`,
    chimeraContext: `Proves why Chimera chose PPR over BFS: PPR achieves significantly higher Precision@K by prioritizing path density over raw hop count.`,
    examples: [
      {
        input: 'n = 5, edges = [[0, 1], [0, 2], [1, 3], [2, 3], [0, 4]], s = 0, ground_truth = [3], K = 1',
        output: '{"bfs_precision": 0.0, "bfs_recall": 0.0, "ppr_precision": 1.0, "ppr_recall": 1.0}',
        explanation: 'BFS encounters 1-hop nodes [1, 2, 4] first and exhausts budget K=1 without reaching 3. PPR reinforces node 3 via two converging paths (0->1->3 and 0->2->3), ranking node 3 at rank 1.'
      }
    ],
    constraints: [
      '2 <= n <= 200',
      'ground_truth is non-empty subset of [0, n-1]'
    ],
    expectedComplexity: {
      time: 'O(|V| + |E| + T \\cdot n^2)',
      space: 'O(n^2)'
    },
    starterCode: `def compare_bfs_and_ppr_retrieval(n: int, edges: list[list[int]], s: int, ground_truth: list[int], K: int) -> dict[str, float]:
    """
    Compares Precision and Recall between BFS and PPR retrieval.
    
    Args:
        n: Number of nodes.
        edges: Directed [u, v].
        s: Seed node ID.
        ground_truth: Relevant node IDs.
        K: Retrieval budget.
        
    Returns:
        Dict with bfs_precision, bfs_recall, ppr_precision, ppr_recall.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def compare_bfs_and_ppr_retrieval(n: int, edges: list[list[int]], s: int, ground_truth: list[int], K: int) -> dict[str, float]:
    from collections import deque
    adj = {i: [] for i in range(n)}
    for u, v in edges:
        adj[u].append(v)
        
    gt_set = set(ground_truth)
    
    # 1. BFS retrieval (first K non-seed nodes)
    visited = set([s])
    q = deque([s])
    bfs_retrieved = []
    while q and len(bfs_retrieved) < K:
        curr = q.popleft()
        for neighbor in adj[curr]:
            if neighbor not in visited:
                visited.add(neighbor)
                bfs_retrieved.append(neighbor)
                q.append(neighbor)
                if len(bfs_retrieved) == K:
                    break
                    
    bfs_hits = len(set(bfs_retrieved) & gt_set)
    bfs_prec = round(bfs_hits / K, 4) if K > 0 else 0.0
    bfs_rec = round(bfs_hits / len(gt_set), 4) if gt_set else 0.0
    
    # 2. PPR retrieval
    row_sums = [len(adj[i]) for i in range(n)]
    P = []
    for i in range(n):
        if row_sums[i] > 0:
            P.append([1.0 / row_sums[i] if j in adj[i] else 0.0 for j in range(n)])
        else:
            P.append([1.0 / n for _ in range(n)])
            
    v = [1.0 if i == s else 0.0 for i in range(n)]
    r = list(v)
    alpha = 0.85
    for _ in range(150):
        r_next = [0.0] * n
        for i in range(n):
            if r[i] > 0:
                for j in range(n):
                    r_next[j] += r[i] * P[i][j]
        r_next = [alpha * r_next[j] + (1.0 - alpha) * v[j] for j in range(n)]
        if sum(abs(r_next[j] - r[j]) for j in range(n)) < 1e-6:
            r = r_next
            break
        r = r_next
        
    ppr_candidates = [(i, r[i]) for i in range(n) if i != s]
    ppr_candidates.sort(key=lambda x: (-x[1], x[0]))
    ppr_retrieved = [node for node, _ in ppr_candidates[:K]]
    
    ppr_hits = len(set(ppr_retrieved) & gt_set)
    ppr_prec = round(ppr_hits / K, 4) if K > 0 else 0.0
    ppr_rec = round(ppr_hits / len(gt_set), 4) if gt_set else 0.0
    
    return {
        'bfs_precision': bfs_prec,
        'bfs_recall': bfs_rec,
        'ppr_precision': ppr_prec,
        'ppr_recall': ppr_rec
    }
`,
    editorial: `### Algorithmic Approach

1. Run BFS from seed $s$ collecting the first $K$ non-seed nodes.
2. Build stochastic transition matrix $P$ and run PPR with restart at $s$.
3. Sort non-seed nodes by PPR score descending and take the top $K$.
4. Compute $\\text{Hits} = |\\text{Retrieved} \\cap \\text{GT}|$.
5. Compute Precision = $\\text{Hits} / K$ and Recall = $\\text{Hits} / |\\text{GT}|$.`,
    hints: [
      'In BFS, collect up to K nodes excluding seed s.',
      'In PPR, rank all nodes i != s by score descending and take top K.',
      'Precision is hits / K, Recall is hits / len(ground_truth).'
    ],
    testCases: [
      {
        inputs: [5, [[0, 1], [0, 2], [1, 3], [2, 3], [0, 4]], 0, [3], 1],
        expected: {
          'bfs_precision': 0.0,
          'bfs_recall': 0.0,
          'ppr_precision': 1.0,
          'ppr_recall': 1.0
        }
      }
    ],
    defaultCustomInput: '5, [[0, 1], [0, 2], [1, 3], [2, 3], [0, 4]], 0, [3], 1',
    suggestedVisualizer: 'multi-hop-explorer'
  }
];
