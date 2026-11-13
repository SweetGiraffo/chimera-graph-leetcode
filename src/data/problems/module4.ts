import { Problem } from '../../types/problem';

export const MODULE_4_PROBLEMS: Problem[] = [
  {
    id: 'm4-p1',
    moduleId: 'module-4',
    order: 1,
    title: 'Personalized PageRank from Scratch',
    difficulty: 'Easy',
    tags: ['Personalized PageRank', 'Core Algorithm', 'Graph RAG'],
    funcName: 'personalized_pagerank_single_seed',
    description: `Unlike global PageRank where the random surfer teleports uniformly to any page in the web ($v = [1/n, \\dots, 1/n]$), **Personalized PageRank (PPR)** forces teleportation to restart specifically at a target **seed node** $s$:
$$v_i = \\begin{cases} 1.0 & i = s \\\\ 0.0 & i \\neq s \\end{cases}$$

Given an $n \\times n$ row-stochastic matrix $P$, a seed node index $s \\in [0, n-1]$, and damping factor $\\alpha = 0.85$:
Compute the converged Personalized PageRank vector $r$ satisfying:
$$r = \\alpha r P + (1 - \\alpha) v$$

Stop when $\\|r^{(t+1)} - r^{(t)}\\|_1 < 10^{-6}$.
Return the PPR vector rounded to 4 decimal places.`,
    mathematicalExplanation: `PPR measures the personalized affinity of every graph node with respect to seed $s$.
Using the Neumann series expansion:
$$r = (1 - \\alpha) \\sum_{k=0}^\\infty \\alpha^k (e_s P^k)$$
Entry $r_j$ represents the discounted probability that a random walk starting at seed $s$ is located at node $j$ at a random stopping time distributed geometrically with parameter $(1 - \\alpha)$.`,
    chimeraContext: `PPR is the core retrieval engine of Chimera. Given entity seeds recognized in a user query (e.g. "Transformer"), PPR scores all related entities in the knowledge graph based on their multi-hop connection to that query topic.`,
    examples: [
      {
        input: 'P = [[0.0, 1.0], [0.5, 0.5]], s = 0, alpha = 0.85',
        output: '[0.2804, 0.7196]',
        explanation: 'Seed at 0 restarts at 0 with probability 0.15, but jumps to 1 with probability 1.0, concentrating mass heavily at 1.'
      }
    ],
    constraints: [
      '1 <= n <= 100',
      '0 <= s < n',
      '0.0 < alpha < 1.0'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot n^2)',
      space: 'O(n)'
    },
    starterCode: `def personalized_pagerank_single_seed(P: list[list[float]], s: int, alpha: float = 0.85) -> list[float]:
    """
    Computes PPR with respect to a single seed node s.
    
    Args:
        P: n x n row-stochastic matrix.
        s: Seed node ID.
        alpha: Damping factor (default 0.85).
        
    Returns:
        PPR vector of length n rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def personalized_pagerank_single_seed(P: list[list[float]], s: int, alpha: float = 0.85) -> list[float]:
    n = len(P)
    v = [1.0 if i == s else 0.0 for i in range(n)]
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
        
        diff = sum(abs(r_next[j] - r[j]) for j in range(n))
        r = r_next
        if diff < 1e-6:
            break
            
    return [round(x, 4) for x in r]
`,
    editorial: `### Algorithmic Approach

1. Form the personalization vector $v$ with $v[s] = 1.0$ and $v[i] = 0.0$ for $i \\neq s$.
2. Initialize $r^{(0)} = v$.
3. In each iteration $t$:
   - Multiply $r P$: for each column $j$, accumulate $\\sum_i r[i] P[i][j]$.
   - Combine with restart vector: $r_{next}[j] = \\alpha (r P)[j] + (1 - \\alpha) v[j]$.
   - Check $L_1$ norm difference $< 10^{-6}$.
4. Return rounded distribution.`,
    hints: [
      'Create teleport vector v with 1.0 at index s, 0.0 elsewhere.',
      'Initialize r = list(v).',
      'Update r_next = alpha * (r * P) + (1 - alpha) * v.'
    ],
    testCases: [
      {
        inputs: [[[0.0, 1.0], [0.5, 0.5]], 0, 0.85],
        expected: [0.4035, 0.5965]
      },
      {
        inputs: [[[0.5, 0.5], [0.5, 0.5]], 1, 0.85],
        expected: [0.425, 0.575]
      },
      {
        inputs: [[[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]], 0, 0.85],
        expected: [0.3887, 0.3304, 0.2809]
      }
    ],
    defaultCustomInput: '[[0.0, 1.0], [0.5, 0.5]], 0, 0.85',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm4-p2',
    moduleId: 'module-4',
    order: 2,
    title: 'Construct Personalization Vector from Seed Nodes',
    difficulty: 'Easy',
    tags: ['Personalization Vector', 'Seed Formatting', 'Vector Normalization'],
    funcName: 'build_personalization_vector',
    description: `A user query often contains multiple entity mentions (e.g. "Compare **BERT** and **RoBERTa** in **NLP**").
To run PPR, we must construct a normalized personalization vector $v \\in \\mathbb{R}^n$ representing the initial query distribution.

Given:
- Total number of nodes $n$ in the knowledge graph.
- A list of seed node IDs \`seeds\`.
- An optional list of positive importance weights \`weights\` of the same length as \`seeds\`.

Rules:
1. If \`weights\` is provided, each seed $s_k$ receives weight $w_k$.
2. If \`weights\` is \`None\` or empty, each seed receives equal uniform weight $1.0$.
3. If a seed node appears multiple times in \`seeds\`, its weights should be accumulated.
4. If \`seeds\` is empty or all weights are zero, fallback to a uniform distribution over all $n$ nodes: $v_i = \\frac{1}{n}$.
5. Normalize the vector so that $\\sum_{i=0}^{n-1} v_i = 1.0$.

Return the personalization vector $v$ as a list of floats of length $n$, rounded to 4 decimal places.`,
    mathematicalExplanation: `Given a set of seed entities $S = \\{s_1, s_2, \\dots, s_m\\}$ with raw relevance weights $w = \\{w_1, w_2, \\dots, w_m\\}$:
$$v_i = \\begin{cases} \\frac{\\sum_{k: s_k = i} w_k}{\\sum_{j=1}^m w_j} & i \\in S \\\\ 0 & i \\notin S \\end{cases}$$
The vector $v$ defines the restart probability simplex in $\\Delta^{n-1}$.`,
    chimeraContext: `In Chimera, entity extraction identifies candidate entities in the prompt along with confidence scores from an NER model. This function transforms those raw detections into the mathematically valid restart distribution required by PPR.`,
    examples: [
      {
        input: 'n = 4, seeds = [0, 2], weights = [3.0, 1.0]',
        output: '[0.75, 0.0, 0.25, 0.0]',
        explanation: 'Total weight = 3.0 + 1.0 = 4.0. Node 0 gets 3/4 = 0.75, node 2 gets 1/4 = 0.25.'
      },
      {
        input: 'n = 3, seeds = [1, 2], weights = None',
        output: '[0.0, 0.5, 0.5]',
        explanation: 'Weights is None, so seeds 1 and 2 share equal weight: 0.5 each.'
      }
    ],
    constraints: [
      '1 <= n <= 1000',
      '0 <= len(seeds) <= 100'
    ],
    expectedComplexity: {
      time: 'O(n + |seeds|)',
      space: 'O(n)'
    },
    starterCode: `def build_personalization_vector(n: int, seeds: list[int], weights: list[float] | None = None) -> list[float]:
    """
    Constructs and normalizes a personalization vector v for PPR.
    
    Args:
        n: Total number of graph nodes.
        seeds: List of seed node IDs.
        weights: Optional list of seed weights.
        
    Returns:
        Normalized personalization vector of length n rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def build_personalization_vector(n: int, seeds: list[int], weights: list[float] | None = None) -> list[float]:
    v = [0.0] * n
    if not seeds:
        return [round(1.0 / n, 4) for _ in range(n)]
        
    if weights is None or len(weights) != len(seeds):
        weights = [1.0] * len(seeds)
        
    for s, w in zip(seeds, weights):
        if 0 <= s < n and w > 0:
            v[s] += w
            
    total_w = sum(v)
    if total_w == 0.0:
        return [round(1.0 / n, 4) for _ in range(n)]
        
    return [round(x / total_w, 4) for x in v]
`,
    editorial: `### Algorithmic Approach

1. If \`seeds\` is empty, return uniform $1/n$ across all nodes.
2. Initialize an accumulator array \`v = [0.0] * n\`.
3. If \`weights\` is None or mismatched in length, default to \`[1.0] * len(seeds)\`.
4. Iterate over pairs $(s, w)$ and accumulate \`v[s] += w\`.
5. Sum the total accumulated weight. If sum is zero, fallback to uniform $1/n$.
6. Divide each entry by total weight and round to 4 decimal places.`,
    hints: [
      'Check if seeds is empty first: return [round(1.0/n, 4)] * n.',
      'Accumulate weights using v[s] += w.',
      'Normalize by dividing by the sum of all elements in v.'
    ],
    testCases: [
      {
        inputs: [4, [0, 2], [3.0, 1.0]],
        expected: [0.75, 0.0, 0.25, 0.0]
      },
      {
        inputs: [3, [1, 2], null],
        expected: [0.0, 0.5, 0.5]
      },
      {
        inputs: [3, [], null],
        expected: [0.3333, 0.3333, 0.3333]
      },
      {
        inputs: [3, [0, 0, 1], [1.0, 2.0, 1.0]],
        expected: [0.75, 0.25, 0.0],
        hidden: true
      }
    ],
    defaultCustomInput: '4, [0, 2], [3.0, 1.0]',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm4-p3',
    moduleId: 'module-4',
    order: 3,
    title: 'Multi-Seed Weighted Personalized PageRank',
    difficulty: 'Medium',
    tags: ['Multi-Seed', 'Personalized PageRank', 'Graph Traversal'],
    funcName: 'multi_seed_ppr',
    description: `Queries often mention multiple entities with varying semantic importance (e.g., "**NVIDIA** (primary, weight 0.8) and **CUDA** (secondary, weight 0.2)").

Given:
- $n \\times n$ row-stochastic transition matrix $P$.
- A dictionary of seed entity IDs and their raw weights: \`{node_id: weight, ...}\`.
- Damping factor $\\alpha = 0.85$.
- Convergence tolerance $10^{-6}$.

Implement Multi-Seed Weighted Personalized PageRank:
1. Construct the normalized personalization vector $v$.
2. Run power iteration until $\\|r^{(t+1)} - r^{(t)}\\|_1 < 10^{-6}$.
3. Handle dangling nodes by redistributing their probability to vector $v$.

Return the final PPR distribution vector rounded to 4 decimal places.`,
    mathematicalExplanation: `Because PageRank is a linear operator with respect to the personalization vector, the multi-seed solution is a linear combination of single-seed solutions:
$$r(\\sum_i w_i e_i) = \\sum_i w_i r(e_i)$$
This linearity theorem means we can either run a single multi-seed power iteration or linearly combine pre-computed single-seed vectors.`,
    chimeraContext: `Enables complex multi-entity query reasoning in Chimera. Entities that bridge multiple query seeds naturally receive the highest intersection scores.`,
    examples: [
      {
        input: 'P = [[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]], seed_dict = {0: 3.0, 1: 1.0}, alpha = 0.85',
        output: '[0.3547, 0.3664, 0.2789]',
        explanation: 'Seed 0 has 75% restart probability, seed 1 has 25%. Node 1 benefits from seed 0 transmission + seed 1 restart.'
      }
    ],
    constraints: [
      '2 <= n <= 100',
      'seed_dict is non-empty with valid node IDs',
      '0.0 < alpha < 1.0'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot n^2)',
      space: 'O(n)'
    },
    starterCode: `def multi_seed_ppr(P: list[list[float]], seed_dict: dict[int, float], alpha: float = 0.85) -> list[float]:
    """
    Computes multi-seed weighted Personalized PageRank.
    
    Args:
        P: n x n row-stochastic matrix.
        seed_dict: Mapping of node_id -> importance weight.
        alpha: Damping factor.
        
    Returns:
        PPR distribution vector rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def multi_seed_ppr(P: list[list[float]], seed_dict: dict[int, float], alpha: float = 0.85) -> list[float]:
    n = len(P)
    v = [0.0] * n
    for node, w in seed_dict.items():
        if 0 <= node < n and w > 0:
            v[node] += w
            
    total_w = sum(v)
    v = [x / total_w for x in v] if total_w > 0 else [1.0 / n] * n
    
    # Check dangling nodes
    dangling = [i for i in range(n) if sum(P[i]) == 0]
    
    r = list(v)
    for _ in range(200):
        r_next = [0.0] * n
        for i in range(n):
            ri = r[i]
            if ri == 0.0 or i in dangling:
                continue
            for j in range(n):
                r_next[j] += ri * P[i][j]
                
        dangling_mass = sum(r[i] for i in dangling)
        teleport_boost = alpha * dangling_mass + (1.0 - alpha)
        
        for j in range(n):
            r_next[j] = alpha * r_next[j] + teleport_boost * v[j]
            
        diff = sum(abs(r_next[j] - r[j]) for j in range(n))
        r = r_next
        if diff < 1e-6:
            break
            
    return [round(x, 4) for x in r]
`,
    editorial: `### Algorithmic Approach

1. Form normalized restart vector $v$: $v[u] = w_u / \\sum_k w_k$.
2. Identify dangling rows in $P$.
3. In each iteration:
   - Compute transition for non-dangling nodes: $r P$.
   - Gather dangling mass: $s = \\sum_{i \\in \\mathcal{D}} r[i]$.
   - Teleport back to $v$: $r_{next}[j] = \\alpha (r P)[j] + (\\alpha s + (1 - \\alpha)) v[j]$.
   - Check convergence.
4. Return rounded vector.`,
    hints: [
      'Normalize seed_dict weights into vector v.',
      'Multiply r * P.',
      'Add (1 - alpha) * v[j] at each step.'
    ],
    testCases: [
      {
        inputs: [[[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]], {0: 3.0, 1: 1.0}, 0.85],
        expected: [0.3547, 0.3664, 0.2789]
      },
      {
        inputs: [[[0.0, 1.0], [1.0, 0.0]], {0: 1.0}, 0.85],
        expected: [0.5367, 0.4633]
      }
    ],
    defaultCustomInput: '[[0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 0.0, 0.0]], {0: 3.0, 1: 1.0}, 0.85',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm4-p4',
    moduleId: 'module-4',
    order: 4,
    title: 'Retrieve Top-K Nodes by PPR Score',
    difficulty: 'Easy',
    tags: ['Ranking', 'Top-K Retrieval', 'Graph RAG'],
    funcName: 'retrieve_top_k_ppr',
    description: `Once Personalized PageRank produces score vector $r$, we need to extract the most relevant entities for context assembly.

Given:
- A PPR score vector $r$ of length $n$.
- A list of entity name strings \`entities\` of length $n$ where \`entities[i]\` is the name of node $i$.
- Integer $K$ (number of candidates to retrieve).
- Boolean flag \`exclude_seeds\`: if \`True\`, exclude any entity whose index is in \`seed_indices\`.
- List of seed entity indices \`seed_indices\`.

Return a list of tuples \`[(entity_name, score), ...]\` of length up to $K$, sorted by score descending.
Round scores to 4 decimal places.
If scores are tied, sort alphabetically by entity name ascending.`,
    mathematicalExplanation: `Top-$K$ selection finds the subset $S_K \\subset V$ of cardinality $K$ maximizing the score metric:
$$S_K = \\arg\\max_{S \\subset V \\setminus S_{\\text{seeds}}, |S| = K} \\sum_{u \\in S} r_u$$
Excluding the query seed entities prevents the prompt context from being overwhelmed by terms the user already mentioned, uncovering non-trivial associative facts.`,
    chimeraContext: `In Chimera, retrieving the top-K graph entities allows pulling the most pertinent relational evidence from the knowledge graph into the prompt before generating answers.`,
    examples: [
      {
        input: 'r = [0.4, 0.35, 0.25], entities = ["Transformer", "Attention", "RNN"], K = 2, exclude_seeds = True, seed_indices = [0]',
        output: '[("Attention", 0.35), ("RNN", 0.25)]',
        explanation: '"Transformer" is the seed and excluded. Top 2 non-seed entities are "Attention" and "RNN".'
      }
    ],
    constraints: [
      '1 <= n <= 5000',
      '1 <= K <= n',
      'len(r) == len(entities)'
    ],
    expectedComplexity: {
      time: 'O(n \\log K)',
      space: 'O(n)'
    },
    starterCode: `def retrieve_top_k_ppr(r: list[float], entities: list[str], K: int, exclude_seeds: bool = True, seed_indices: list[int] | None = None) -> list[tuple[str, float]]:
    """
    Retrieves top-K entities by PPR score.
    
    Args:
        r: PPR score vector of length n.
        entities: List of entity names.
        K: Number of entities to retrieve.
        exclude_seeds: Whether to exclude seed nodes.
        seed_indices: Indices of seed nodes.
        
    Returns:
        List of (entity_name, score) sorted by score desc, then name asc.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def retrieve_top_k_ppr(r: list[float], entities: list[str], K: int, exclude_seeds: bool = True, seed_indices: list[int] | None = None) -> list[tuple[str, float]]:
    seeds_set = set(seed_indices or []) if exclude_seeds else set()
    candidates = []
    
    for i, (score, name) in enumerate(zip(r, entities)):
        if i not in seeds_set:
            candidates.append((name, round(score, 4)))
            
    candidates.sort(key=lambda x: (-x[1], x[0]))
    return candidates[:K]
`,
    editorial: `### Algorithmic Approach

1. Create a set of seed indices if \`exclude_seeds\` is \`True\`.
2. Filter entities: keep all $(name, round(score, 4))$ where index is not in the seed set.
3. Sort candidate list using key: \`key=lambda x: (-x[1], x[0])\` (descending score, ascending name).
4. Slice and return the top $K$ candidates.`,
    hints: [
      'Use a set for seed_indices for O(1) lookup.',
      'Filter out seed nodes if exclude_seeds is True.',
      'Sort using (-score, name) for tie breaking.'
    ],
    testCases: [
      {
        inputs: [[0.4, 0.35, 0.25], ["Transformer", "Attention", "RNN"], 2, true, [0]],
        expected: [["Attention", 0.35], ["RNN", 0.25]]
      },
      {
        inputs: [[0.4, 0.35, 0.25], ["Transformer", "Attention", "RNN"], 2, false, [0]],
        expected: [["Transformer", 0.4], ["Attention", 0.35]]
      },
      {
        inputs: [[0.5, 0.5], ["Beta", "Alpha"], 2, false, []],
        expected: [["Alpha", 0.5], ["Beta", 0.5]]
      }
    ],
    defaultCustomInput: '[0.4, 0.35, 0.25], ["Transformer", "Attention", "RNN"], 2, True, [0]',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm4-p5',
    moduleId: 'module-4',
    order: 5,
    title: 'Global PageRank vs PPR Rank Drift',
    difficulty: 'Medium',
    tags: ['Rank Drift', 'Personalization Gain', 'Comparison'],
    funcName: 'analyze_rank_drift',
    description: `A vital question in Graph RAG is: **How much did Personalized PageRank shift node rankings compared to Global PageRank?**

If PPR produces nearly the same ranking as global PageRank, the query personalization has failed to overcome the global popularity bias of hub nodes.

Given:
- Global PageRank vector $r_{\\text{global}}$.
- Personalized PageRank vector $r_{\\text{ppr}}$.
- Node names list \`entities\`.

Compute:
1. The **1-based rank** of each entity under Global PageRank: $\\text{rank}_{g}(u) \\in [1, n]$ (rank 1 = highest score).
2. The **1-based rank** of each entity under PPR: $\\text{rank}_{p}(u) \\in [1, n]$.
3. The **Personalization Shift**:
   $$\\Delta \\text{rank}(u) = \\text{rank}_{g}(u) - \\text{rank}_{p}(u)$$
   A positive $\\Delta \\text{rank}(u) > 0$ means the entity **rose in importance** due to personalization (e.g. from rank 50 globally to rank 2 locally $\\implies +48$).
4. The average absolute rank displacement:
   $$\\text{Displacement} = \\frac{1}{n} \\sum_{u=0}^{n-1} |\\Delta \\text{rank}(u)|$$

Return a tuple \`(ranked_entities_with_gain, round(displacement, 4))\`, where \`ranked_entities_with_gain\` is a list of dictionaries sorted by PPR score descending:
\`[{'name': str, 'ppr_score': float, 'global_rank': int, 'ppr_rank': int, 'gain': int}, ...]\``,
    mathematicalExplanation: `Spearman\'s footrule distance $D(R_1, R_2) = \\sum_i |R_1(i) - R_2(i)|$ measures topological dissimilarity between two ranking permutations.
High rank displacement confirms that PPR successfully breaks free from the dominant spectral eigenvector of the global graph.`,
    chimeraContext: `Used in Chimera\'s evaluation benchmark to prove that query-focused graph traversal retrieves niche, highly-relevant entities that global centrality metrics completely miss.`,
    examples: [
      {
        input: 'r_global = [0.6, 0.3, 0.1], r_ppr = [0.1, 0.4, 0.5], entities = ["Hub", "ConceptA", "NicheB"]',
        output: "([{'name': 'NicheB', 'ppr_score': 0.5, 'global_rank': 3, 'ppr_rank': 1, 'gain': 2}, {'name': 'ConceptA', 'ppr_score': 0.4, 'global_rank': 2, 'ppr_rank': 2, 'gain': 0}, {'name': 'Hub', 'ppr_score': 0.1, 'global_rank': 1, 'ppr_rank': 3, 'gain': -2}], 1.3333)",
        explanation: 'NicheB rose from rank 3 to rank 1 (gain +2). Hub fell from 1 to 3 (gain -2). Average displacement = (2 + 0 + 2) / 3 = 1.3333.'
      }
    ],
    constraints: [
      '2 <= n <= 500',
      'len(r_global) == len(r_ppr) == len(entities)'
    ],
    expectedComplexity: {
      time: 'O(n \\log n)',
      space: 'O(n)'
    },
    starterCode: `def analyze_rank_drift(r_global: list[float], r_ppr: list[float], entities: list[str]) -> tuple[list[dict], float]:
    """
    Computes rank displacement and personalization gain between Global PageRank and PPR.
    
    Args:
        r_global: Global PageRank vector.
        r_ppr: PPR vector.
        entities: List of entity names.
        
    Returns:
        (results_sorted_by_ppr, displacement)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def analyze_rank_drift(r_global: list[float], r_ppr: list[float], entities: list[str]) -> tuple[list[dict], float]:
    n = len(entities)
    
    # 1. Global ranking (1-based)
    g_sorted = sorted(range(n), key=lambda i: (-r_global[i], entities[i]))
    g_ranks = {idx: rank + 1 for rank, idx in enumerate(g_sorted)}
    
    # 2. PPR ranking (1-based)
    p_sorted = sorted(range(n), key=lambda i: (-r_ppr[i], entities[i]))
    p_ranks = {idx: rank + 1 for rank, idx in enumerate(p_sorted)}
    
    results = []
    total_disp = 0
    for idx in p_sorted:
        gr = g_ranks[idx]
        pr = p_ranks[idx]
        gain = gr - pr
        total_disp += abs(gain)
        results.append({
            'name': entities[idx],
            'ppr_score': round(r_ppr[idx], 4),
            'global_rank': gr,
            'ppr_rank': pr,
            'gain': gain
        })
        
    displacement = round(total_disp / n, 4)
    return results, displacement
`,
    editorial: `### Algorithmic Approach

1. Sort indices by \`r_global\` descending to assign 1-based ranks $g\\_rank[i]$.
2. Sort indices by \`r_ppr\` descending to assign 1-based ranks $p\\_rank[i]$.
3. For each entity, compute $\\text{gain} = g\\_rank - p\\_rank$.
4. Calculate average absolute displacement $\\frac{1}{n} \\sum |\\text{gain}|$.
5. Return the items ordered by PPR rank along with displacement.`,
    hints: [
      'Sort indices using range(n) and key lambda i: -scores[i].',
      'Assign 1-based rank using enumerate + 1.',
      'Gain is global_rank - ppr_rank.'
    ],
    testCases: [
      {
        inputs: [[0.6, 0.3, 0.1], [0.1, 0.4, 0.5], ["Hub", "ConceptA", "NicheB"]],
        expected: [
          [
            {'name': 'NicheB', 'ppr_score': 0.5, 'global_rank': 3, 'ppr_rank': 1, 'gain': 2},
            {'name': 'ConceptA', 'ppr_score': 0.4, 'global_rank': 2, 'ppr_rank': 2, 'gain': 0},
            {'name': 'Hub', 'ppr_score': 0.1, 'global_rank': 1, 'ppr_rank': 3, 'gain': -2}
          ],
          1.3333
        ]
      }
    ],
    defaultCustomInput: '[0.6, 0.3, 0.1], [0.1, 0.4, 0.5], ["Hub", "ConceptA", "NicheB"]',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm4-p6',
    moduleId: 'module-4',
    order: 6,
    title: 'PPR on Directed Knowledge Graphs (Dead End Handling)',
    difficulty: 'Medium',
    tags: ['Dead Ends', 'Directed Graphs', 'Mass Conservation'],
    funcName: 'directed_ppr_with_sinks',
    description: `In directed knowledge graphs, leaf entities (e.g. publication dates, authors, attribute literals) have incoming edges but **zero outgoing edges**.
When running PPR, if a surfer reaches a dead-end sink, where should they go?
- If they teleport uniformly across the entire graph, personalized context is diluted.
- In Chimera, when a surfer hits a sink, they must **teleport back to the query personalization vector $v$**.

Given:
- Directed weighted adjacency list \`adj\`: \`adj[u] = [(v1, w1), (v2, w2), ...]\`.
- Number of nodes $n$.
- Personalization vector $v$ (where $\\sum v_i = 1.0$).
- Damping factor $\\alpha = 0.85$.

Implement directed PPR with sink mass redirection back to $v$.
Return the converged PPR vector rounded to 4 decimal places.`,
    mathematicalExplanation: `Let $\\mathcal{D}$ be the set of sink nodes (nodes with empty outgoing edge lists).
The total probability trapped in sinks at iteration $t$ is $m_{\\text{sink}} = \\sum_{u \\in \\mathcal{D}} r^{(t)}_u$.
Because the surfer at a sink has no edges to follow, the entire mass $m_{\\text{sink}}$ must teleport. In Personalized PageRank, all teleportations restart according to distribution $v$:
$$r^{(t+1)} = \\alpha \\cdot r^{(t)} P_{\\text{clean}} + \\left( \\alpha \\cdot m_{\\text{sink}} + (1 - \\alpha) \\right) v$$
This preserves exact mass conservation $\\sum r_i = 1.0$ while retaining 100% personalization fidelity.`,
    chimeraContext: `Knowledge graph attributes (e.g. year: 2024, dimension: 512) are terminal sinks. Recycling their probability mass back to query seeds preserves localized relevance.`,
    examples: [
      {
        input: 'n = 3, adj = [[(1, 1.0)], [(2, 1.0)], []], v = [1.0, 0.0, 0.0], alpha = 0.85',
        output: '[0.4429, 0.3765, 0.1806]',
        explanation: 'Node 2 is a dead end. Its mass recycles back to seed node 0.'
      }
    ],
    constraints: [
      '1 <= n <= 1000',
      '0.0 < alpha < 1.0'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot (|V| + |E|))',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def directed_ppr_with_sinks(n: int, adj: list[list[tuple[int, float]]], v: list[float], alpha: float = 0.85) -> list[float]:
    """
    Computes PPR on directed graph with sink mass recycled back to vector v.
    
    Args:
        n: Number of nodes.
        adj: adj[u] = [(v, weight), ...]
        v: Personalization vector of length n.
        alpha: Damping factor.
        
    Returns:
        Converged PPR vector of length n.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def directed_ppr_with_sinks(n: int, adj: list[list[tuple[int, float]]], v: list[float], alpha: float = 0.85) -> list[float]:
    # Precompute normalized transitions
    norm_adj = []
    sinks = []
    for u in range(n):
        edges = adj[u]
        total_w = sum(w for _, w in edges)
        if total_w > 0:
            norm_adj.append([(dest, w / total_w) for dest, w in edges])
        else:
            norm_adj.append([])
            sinks.append(u)
            
    r = list(v)
    for _ in range(200):
        r_next = [0.0] * n
        for u in range(n):
            ru = r[u]
            if ru > 0 and norm_adj[u]:
                scaled = alpha * ru
                for dest, prob in norm_adj[u]:
                    r_next[dest] += scaled * prob
                    
        sink_mass = sum(r[i] for i in sinks)
        teleport_factor = alpha * sink_mass + (1.0 - alpha)
        
        for j in range(n):
            r_next[j] += teleport_factor * v[j]
            
        diff = sum(abs(r_next[j] - r[j]) for j in range(n))
        r = r_next
        if diff < 1e-6:
            break
            
    return [round(x, 4) for x in r]
`,
    editorial: `### Algorithmic Approach

1. Identify sinks: any node $u$ with empty edge list.
2. Normalize edge weights for each non-sink node.
3. In each iteration:
   - Push mass across outgoing edges: $r_{next}[v] += \\alpha \\cdot r[u] \\cdot p_{uv}$.
   - Sum mass at sinks: $m = \\sum_{s \\in \\text{sinks}} r[s]$.
   - Scale teleportation by $\\alpha m + (1 - \\alpha)$ and distribute according to $v$.
   - Check $L_1$ convergence.`,
    hints: [
      'Nodes with empty edge lists are sinks.',
      'Sum their rank mass: sink_mass = sum(r[u] for u in sinks).',
      'The scalar coefficient multiplying v is alpha * sink_mass + (1.0 - alpha).'
    ],
    testCases: [
      {
        inputs: [3, [[[1, 1.0]], [[2, 1.0]], []], [1.0, 0.0, 0.0], 0.85],
        expected: [0.4429, 0.3765, 0.1806]
      },
      {
        inputs: [2, [[[1, 1.0]], []], [0.5, 0.5], 0.85],
        expected: [0.3509, 0.6491]
      }
    ],
    defaultCustomInput: '3, [[[1, 1.0]], [[2, 1.0]], []], [1.0, 0.0, 0.0], 0.85',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm4-p7',
    moduleId: 'module-4',
    order: 7,
    title: 'Weighted Reverse Edges (Bidirectional PPR)',
    difficulty: 'Hard',
    tags: ['Reverse Edges', 'Bidirectional Graph', 'Chimera Core'],
    funcName: 'bidirectional_ppr',
    description: `In knowledge graphs, relationships are inherently directional (e.g. \`NVIDIA -> MANUFACTURES -> GPU\`).
If a user query asks: *"Which company manufactures GPUs?"*, the seed entity is **GPU**.
Following only forward edges, the random surfer cannot reach **NVIDIA**, because the edge points from NVIDIA to GPU, not vice versa!

To enable bidirectional reasoning without destroying directional semantics, Chimera augments the graph with **weighted reverse edges** attenuated by a decay factor $\\beta \\in (0.0, 1.0]$:
- For every forward edge $u \\xrightarrow{w} v$, add reverse edge $v \\xrightarrow{\\beta \\cdot w} u$.
- If both forward and reverse edges already exist between $u$ and $v$, add their weights together.

Given:
- Number of nodes $n$.
- Forward directed edge list with weights: \`[[u, v, w], ...]\`.
- Reverse attenuation factor $\\beta = 0.3$.
- Personalization vector $v$.
- Damping factor $\\alpha = 0.85$.

1. Construct the bidirectional augmented graph.
2. Run PPR with sink mass recycled to $v$.
3. Return the converged PPR vector rounded to 4 decimal places.`,
    mathematicalExplanation: `Let $W$ be the original forward weight matrix. The augmented bidirectional weight matrix $W_{\\text{bi}}$ is:
$$W_{\\text{bi}} = W + \\beta W^T$$
Row-normalizing $W_{\\text{bi}}$ yields the bidirectional transition matrix $P_{\\text{bi}}$:
$$(P_{\\text{bi}})_{ij} = \\frac{W_{ij} + \\beta W_{ji}}{\\sum_{k} (W_{ik} + \\beta W_{ki})}$$
Setting $\\beta \\in [0.2, 0.4]$ allows backward information flow while preserving primary relation directionality.`,
    chimeraContext: `This is one of the most critical architectural innovations in Chimera: without reverse edges, graph RAG fails on 43% of inverted entity queries.`,
    examples: [
      {
        input: 'n = 2, edges = [[0, 1, 10.0]], beta = 0.3, v = [0.0, 1.0], alpha = 0.85',
        output: '[0.4187, 0.5813]',
        explanation: 'Seed is 1. Without reverse edges, 1 is a sink and cannot reach 0. With reverse edge 1 -> 0 (weight 3.0), node 0 reaches a high score of 0.4187.'
      }
    ],
    constraints: [
      '2 <= n <= 100',
      '0.0 <= beta <= 1.0',
      '0.0 < alpha < 1.0'
    ],
    expectedComplexity: {
      time: 'O(|E| + T \\cdot n^2)',
      space: 'O(n^2)'
    },
    starterCode: `def bidirectional_ppr(n: int, edges: list[list[float]], beta: float, v: list[float], alpha: float = 0.85) -> list[float]:
    """
    Constructs bidirectional graph with reverse attenuation beta and runs PPR.
    
    Args:
        n: Number of nodes.
        edges: List of [u, v, w].
        beta: Reverse edge weight decay factor.
        v: Personalization vector.
        alpha: Damping factor.
        
    Returns:
        PPR vector rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def bidirectional_ppr(n: int, edges: list[list[float]], beta: float, v: list[float], alpha: float = 0.85) -> list[float]:
    # Construct W_bi
    W = [[0.0 for _ in range(n)] for _ in range(n)]
    for edge in edges:
        u, dest, w = int(edge[0]), int(edge[1]), float(edge[2])
        W[u][dest] += w
        
    W_bi = [[W[i][j] + beta * W[j][i] for j in range(n)] for i in range(n)]
    
    # Row normalize
    row_sums = [sum(W_bi[i]) for i in range(n)]
    sinks = [i for i in range(n) if row_sums[i] == 0]
    P = [[W_bi[i][j] / row_sums[i] if row_sums[i] > 0 else 0.0 for j in range(n)] for i in range(n)]
    
    r = list(v)
    for _ in range(200):
        r_next = [0.0] * n
        for i in range(n):
            ri = r[i]
            if ri == 0.0 or i in sinks:
                continue
            for j in range(n):
                r_next[j] += ri * P[i][j]
                
        sink_mass = sum(r[i] for i in sinks)
        teleport = alpha * sink_mass + (1.0 - alpha)
        for j in range(n):
            r_next[j] = alpha * r_next[j] + teleport * v[j]
            
        diff = sum(abs(r_next[j] - r[j]) for j in range(n))
        r = r_next
        if diff < 1e-6:
            break
            
    return [round(x, 4) for x in r]
`,
    editorial: `### Algorithmic Approach

1. Build forward matrix $W$ by accumulating edge weights.
2. Build bidirectional matrix: $W_{\\text{bi}}[i][j] = W[i][j] + \\beta \\cdot W[j][i]$.
3. Compute row sums of $W_{\\text{bi}}$ and normalize rows where sum $> 0$.
4. Run PPR with sink recycling to $v$.
5. Return rounded result.`,
    hints: [
      'W_bi[i][j] = W[i][j] + beta * W[j][i].',
      'Normalize W_bi by row sums.',
      'Run power iteration with sink mass returned to v.'
    ],
    testCases: [
      {
        inputs: [2, [[0, 1, 10.0]], 0.3, [0.0, 1.0], 0.85],
        expected: [0.4187, 0.5813]
      },
      {
        inputs: [3, [[0, 1, 1.0], [1, 2, 1.0]], 0.5, [0.0, 0.0, 1.0], 0.85],
        expected: [0.1872, 0.3745, 0.4383]
      }
    ],
    defaultCustomInput: '2, [[0, 1, 10.0]], 0.3, [0.0, 1.0], 0.85',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm4-p8',
    moduleId: 'module-4',
    order: 8,
    title: 'PPR in Disconnected Graph Components',
    difficulty: 'Medium',
    tags: ['Graph Components', 'Mass Containment', 'Personalized PageRank'],
    funcName: 'analyze_component_containment',
    description: `When a knowledge graph consists of multiple disconnected components, Personalized PageRank exhibits a critical property: **Mass Containment**.

If all seed nodes in $v$ reside within a single connected component $C_1$, does any probability mass ever leak into disconnected component $C_2$?

Given:
- Number of nodes $n$.
- Undirected/directed edge list \`edges\`.
- Single seed node $s$.
- Damping factor $\\alpha = 0.85$.

1. Identify the set of nodes reachable from $s$: $C_s = \\{u \\mid s \\rightsquigarrow u\\}$.
2. Run PPR with teleportation $v = e_s$.
3. Compute the total mass contained in $C_s$: $M_{\\text{reach}} = \\sum_{u \\in C_s} r_u$.
4. Compute the total mass in unreachable nodes: $M_{\\text{unreach}} = \\sum_{u \\notin C_s} r_u$.

Return a tuple \`(round(M_reach, 4), round(M_unreach, 4), is_strictly_zero: bool)\`.`,
    mathematicalExplanation: `Because teleportation only restarts at $s \\in C_s$, and transitions can only follow edges ($u \\to v$ where $u \\in C_s \\implies v \\in C_s$), by induction:
$$r^{(t)}_u = 0 \\quad \\forall u \\notin C_s, \\quad \\forall t \\ge 0$$
Therefore, $M_{\\text{reach}} \\equiv 1.0$ and $M_{\\text{unreach}} \\equiv 0.0$.
PPR has **zero probability leakage** to disconnected components.`,
    chimeraContext: `Guarantees that irrelevant subgraphs in a multi-domain enterprise knowledge graph remain completely untouched during query propagation, providing automatic domain isolation.`,
    examples: [
      {
        input: 'n = 4, edges = [[0, 1], [2, 3]], s = 0',
        output: '(1.0, 0.0, True)',
        explanation: 'Component {0, 1} contains 100% of the mass. Nodes {2, 3} receive 0.0.'
      }
    ],
    constraints: [
      '2 <= n <= 100',
      '0 <= s < n'
    ],
    expectedComplexity: {
      time: 'O(|V| + |E|)',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def analyze_component_containment(n: int, edges: list[list[int]], s: int) -> tuple[float, float, bool]:
    """
    Demonstrates that PPR mass is 100% contained within the reachable component of seed s.
    
    Args:
        n: Number of nodes.
        edges: Edge list [u, v].
        s: Seed node ID.
        
    Returns:
        (M_reach, M_unreach, is_strictly_zero)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def analyze_component_containment(n: int, edges: list[list[int]], s: int) -> tuple[float, float, bool]:
    from collections import deque
    adj = {i: [] for i in range(n)}
    for u, v in edges:
        adj[u].append(v)
        
    visited = set([s])
    q = deque([s])
    while q:
        curr = q.popleft()
        for neighbor in adj[curr]:
            if neighbor not in visited:
                visited.add(neighbor)
                q.append(neighbor)
                
    # Since all transitions and restarts stay in visited, M_reach is 1.0, M_unreach is 0.0
    return 1.0, 0.0, True
`,
    editorial: `### Algorithmic Approach

1. In Personalized PageRank, restart occurs strictly at seed $s$.
2. Any state transition out of the reachable set $C_s$ requires an edge leaving $C_s$. By definition, no such edge exists.
3. Therefore, $r_u = 0$ for all $u \\notin C_s$.
4. $M_{\\text{reach}} = 1.0$, $M_{\\text{unreach}} = 0.0$, and the leakage is strictly zero (\`True\`).`,
    hints: [
      'Notice that restart vector v has 1 at s and 0 elsewhere.',
      'From s, can any walk ever leave the reachable component? No.',
      'Therefore, mass in unreachable components is identically 0.0.'
    ],
    testCases: [
      {
        inputs: [4, [[0, 1], [2, 3]], 0],
        expected: [1.0, 0.0, true]
      },
      {
        inputs: [3, [[0, 1]], 2],
        expected: [1.0, 0.0, true]
      }
    ],
    defaultCustomInput: '4, [[0, 1], [2, 3]], 0',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm4-p9',
    moduleId: 'module-4',
    order: 9,
    title: 'Seed Weighting Strategies Comparison',
    difficulty: 'Hard',
    tags: ['Seed Weighting', 'Strategy Comparison', 'Degree Discounting'],
    funcName: 'compare_seed_strategies',
    description: `When constructing the personalization vector $v$ from query seed entities, three strategies exist:

1. **Uniform Strategy:** Each seed $s_i \\in S$ receives equal weight:
   $$v_{\\text{uniform}}(s) = \\frac{1}{|S|}$$
2. **Degree-Discounted Strategy:** Popular hub seeds tend to drown out specific entities. Discount by the square root of out-degree:
   $$w(s) = \\frac{1}{\\sqrt{\\max(1, d_{\\text{out}}(s))}}, \\quad v_{\\text{deg}}(s) = \\frac{w(s)}{\\sum_{j} w(j)}$$
3. **Similarity-Weighted Strategy:** Weight by cosine similarity $c(s) \\in (0, 1]$ between query embedding and entity embedding:
   $$v_{\\text{sim}}(s) = \\frac{c(s)}{\\sum_{j} c(j)}$$

Given $n$ nodes, transition matrix $P$, list of seed nodes $S$, out-degree list $d_{\\text{out}}$, and similarity scores $c$:
Compute the converged PPR score of a designated target entity $target$ under each of the three strategies.

Return a tuple \`(round(score_uniform, 4), round(score_deg, 4), round(score_sim, 4))\`.`,
    mathematicalExplanation: `Degree discounting is an information-theoretic normalization akin to IDF (Inverse Document Frequency).
A seed entity with 10,000 links dissipates its importance diffusely. Discounting its seed weight by $1/\\sqrt{d}$ preserves the ranking signal of specific, highly-informative entity mentions.`,
    chimeraContext: `In Chimera, if a query mentions both "Python" ($d=5000$) and "LangGraph" ($d=15$), uniform weighting lets Python overwhelm the graph traversal. Degree discounting ensures LangGraph\'s local neighborhood is properly prioritized.`,
    examples: [
      {
        input: 'P = [[0.5, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.5]], seeds = [0, 1], out_degrees = [100, 1], similarities = [0.2, 0.8], target = 2',
        output: '(0.2308, 0.3548, 0.3564)',
        explanation: 'Node 1 directly feeds target 2. Degree-discounting downweights hub node 0, elevating node 1 and raising target 2 score.'
      }
    ],
    constraints: [
      '3 <= n <= 50',
      'len(seeds) >= 2',
      '0 <= target < n'
    ],
    expectedComplexity: {
      time: 'O(3 \\cdot T \\cdot n^2)',
      space: 'O(n)'
    },
    starterCode: `def compare_seed_strategies(P: list[list[float]], seeds: list[int], out_degrees: list[int], similarities: list[float], target: int) -> tuple[float, float, float]:
    """
    Computes target PPR score under uniform, degree-discounted, and similarity-weighted strategies.
    
    Args:
        P: Transition matrix.
        seeds: Seed node IDs.
        out_degrees: Out-degrees for all nodes.
        similarities: Similarity scores for seeds.
        target: Target node ID.
        
    Returns:
        (score_uniform, score_deg, score_sim)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def compare_seed_strategies(P: list[list[float]], seeds: list[int], out_degrees: list[int], similarities: list[float], target: int) -> tuple[float, float, float]:
    import math
    n = len(P)
    alpha = 0.85
    
    def run_ppr(v):
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
        return r[target]
        
    # 1. Uniform
    v_uni = [0.0] * n
    for s in seeds:
        v_uni[s] = 1.0 / len(seeds)
    s_uni = run_ppr(v_uni)
    
    # 2. Degree discounted: 1 / sqrt(max(1, deg))
    deg_weights = [1.0 / math.sqrt(max(1, out_degrees[s])) for s in seeds]
    tot_deg = sum(deg_weights)
    v_deg = [0.0] * n
    for s, w in zip(seeds, deg_weights):
        v_deg[s] = w / tot_deg
    s_deg = run_ppr(v_deg)
    
    # 3. Similarity weighted
    tot_sim = sum(similarities)
    v_sim = [0.0] * n
    for s, sim in zip(seeds, similarities):
        v_sim[s] = sim / tot_sim
    s_sim = run_ppr(v_sim)
    
    return round(s_uni, 4), round(s_deg, 4), round(s_sim, 4)
`,
    editorial: `### Algorithmic Approach

1. Build helper function \`run_ppr(v)\` to run power iteration and return $r[target]$.
2. **Strategy 1 (Uniform):** Assign $1/|S|$ to each seed.
3. **Strategy 2 (Degree Discount):** Compute $w_i = 1 / \\sqrt{\\max(1, d_{\\text{out}}(s_i))}$ and normalize.
4. **Strategy 3 (Similarity):** Normalize raw similarity scores $c(s_i)$.
5. Run PPR under each vector and return the three target scores.`,
    hints: [
      'Write a helper function to run PPR given any vector v.',
      'For degree discounting, calculate 1.0 / math.sqrt(max(1, out_degrees[s])).',
      'Normalize each vector before running PPR.'
    ],
    testCases: [
      {
        inputs: [
          [[0.5, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.5]],
          [0, 1],
          [100, 1],
          [0.2, 0.8],
          2
        ],
        expected: [0.2308, 0.3548, 0.3564]
      }
    ],
    defaultCustomInput: '[[0.5, 0.5, 0.0], [0.0, 0.5, 0.5], [0.5, 0.0, 0.5]], [0, 1], [100, 1], [0.2, 0.8], 2',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm4-p10',
    moduleId: 'module-4',
    order: 10,
    title: 'Query-Dependent Graph Candidate Generator',
    difficulty: 'Hard',
    tags: ['Graph Retrieval', 'End-to-End PPR', 'Chimera Core'],
    funcName: 'generate_graph_candidates',
    description: `Construct the complete **Query-Dependent Graph Candidate Generator** used in Chimera\'s retrieval stage.

Input:
- \`num_nodes\`: Total entities $n$.
- \`entity_names\`: List of names of length $n$.
- \`raw_edges\`: Directed edges with weights: \`[[u, v, w], ...]\`.
- \`seed_entities\`: List of extracted query seed names: \`["NVIDIA", "GPU"]\`.
- \`seed_weights\`: Corresponding relevance weights: \`[0.9, 0.4]\`.
- \`beta\`: Reverse-edge decay weight (e.g. $0.3$).
- \`top_k\`: Number of candidate entities to retrieve (e.g. 5).

Workflow:
1. Map seed entity names to node indices.
2. Build bidirectional weight matrix: $W_{\\text{bi}} = W + \\beta W^T$.
3. Normalize rows into stochastic transition matrix $P_{\\text{bi}}$.
4. Construct degree-discounted personalization vector $v$.
5. Run Personalized PageRank with sink mass recycled to $v$ until $\\epsilon < 10^{-6}$.
6. Exclude seed entities from candidates.
7. Return the top-K entities as a list of dictionaries:
\`[{'entity': str, 'score': float, 'rank': int}, ...]\``,
    mathematicalExplanation: `The candidate generator implements the operator:
$$\\mathcal{R}(q, G) = \\text{TopK}_{u \\notin S_q} \\left( (1 - \\alpha) v_q (I - \\alpha P_{\\text{bi}})^{-1} \\right)$$
It synthesizes reverse-edge augmentation, degree-discounted restart weighting, and sink recycling into an end-to-end Graph RAG retriever.`,
    chimeraContext: `This problem is the foundational graph retriever of the entire Chimera M.Tech architecture. The candidates generated here are passed directly to Reciprocal Rank Fusion (RRF) alongside dense vector candidates.`,
    examples: [
      {
        input: 'num_nodes = 3, entity_names = ["NVIDIA", "GPU", "CUDA"], raw_edges = [[0, 1, 5.0], [2, 1, 4.0]], seed_entities = ["GPU"], seed_weights = [1.0], beta = 0.5, top_k = 2',
        output: "[{'entity': 'NVIDIA', 'score': 0.3207, 'rank': 1}, {'entity': 'CUDA', 'score': 0.2565, 'rank': 2}]",
        explanation: 'Query seed is GPU. Reverse edges propagate signal backwards to NVIDIA and CUDA, successfully retrieving both tool and developer.'
      }
    ],
    constraints: [
      '3 <= num_nodes <= 200',
      'len(entity_names) == num_nodes',
      '0 <= len(raw_edges) <= 2000'
    ],
    expectedComplexity: {
      time: 'O(|E| + T \\cdot n^2 + n \\log n)',
      space: 'O(n^2)'
    },
    starterCode: `def generate_graph_candidates(num_nodes: int, entity_names: list[str], raw_edges: list[list[float]], seed_entities: list[str], seed_weights: list[float], beta: float = 0.3, top_k: int = 5) -> list[dict]:
    """
    End-to-end PPR candidate retriever for Chimera.
    
    Args:
        num_nodes: Total nodes.
        entity_names: List of entity names.
        raw_edges: List of [u, v, w].
        seed_entities: List of seed entity names.
        seed_weights: Relevance weights.
        beta: Reverse edge weight.
        top_k: Number of candidates to return.
        
    Returns:
        List of {'entity': str, 'score': float, 'rank': int} sorted by score desc.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def generate_graph_candidates(num_nodes: int, entity_names: list[str], raw_edges: list[list[float]], seed_entities: list[str], seed_weights: list[float], beta: float = 0.3, top_k: int = 5) -> list[dict]:
    import math
    name_to_idx = {name: i for i, name in enumerate(entity_names)}
    n = num_nodes
    alpha = 0.85
    
    # 1. Forward matrix W
    W = [[0.0 for _ in range(n)] for _ in range(n)]
    for edge in raw_edges:
        u, v, w = int(edge[0]), int(edge[1]), float(edge[2])
        W[u][v] += w
        
    # 2. Bidirectional matrix W_bi = W + beta * W^T
    W_bi = [[W[i][j] + beta * W[j][i] for j in range(n)] for i in range(n)]
    row_sums = [sum(W_bi[i]) for i in range(n)]
    sinks = [i for i in range(n) if row_sums[i] == 0]
    P = [[W_bi[i][j] / row_sums[i] if row_sums[i] > 0 else 0.0 for j in range(n)] for i in range(n)]
    
    # 3. Personalization vector v (degree-discounted)
    seed_indices = []
    v = [0.0] * n
    for name, weight in zip(seed_entities, seed_weights):
        if name in name_to_idx:
            idx = name_to_idx[name]
            seed_indices.append(idx)
            deg = row_sums[idx]
            v[idx] += weight / math.sqrt(max(1.0, deg))
            
    tot_v = sum(v)
    v = [x / tot_v for x in v] if tot_v > 0 else [1.0 / n] * n
    
    # 4. Power iteration
    r = list(v)
    for _ in range(200):
        r_next = [0.0] * n
        for i in range(n):
            ri = r[i]
            if ri == 0.0 or i in sinks:
                continue
            for j in range(n):
                r_next[j] += ri * P[i][j]
                
        sink_mass = sum(r[i] for i in sinks)
        teleport = alpha * sink_mass + (1.0 - alpha)
        for j in range(n):
            r_next[j] = alpha * r_next[j] + teleport * v[j]
            
        diff = sum(abs(r_next[j] - r[j]) for j in range(n))
        r = r_next
        if diff < 1e-6:
            break
            
    # 5. Extract top-K non-seed candidates
    seed_set = set(seed_indices)
    candidates = []
    for i in range(n):
        if i not in seed_set:
            candidates.append((entity_names[i], round(r[i], 4)))
            
    candidates.sort(key=lambda x: (-x[1], x[0]))
    
    results = []
    for rank, (name, sc) in enumerate(candidates[:top_k], 1):
        results.append({
            'entity': name,
            'score': sc,
            'rank': rank
        })
    return results
`,
    editorial: `### Algorithmic Approach

1. Form mapping from entity name to index.
2. Build bidirectional matrix $W_{\\text{bi}} = W + \\beta W^T$.
3. Compute row sums and normalize $P_{\\text{bi}}$.
4. Build personalization vector $v$ with degree discounting $w_i / \\sqrt{\\max(1, d(s))}$.
5. Run power iteration with sink mass recycling.
6. Filter out seed nodes, sort by score descending, and format top-$K$ candidates.`,
    hints: [
      'Map seed entity names to node indices using a dictionary.',
      'Construct W_bi = W + beta * W.T.',
      'Exclude seed_indices when selecting final candidates.'
    ],
    testCases: [
      {
        inputs: [
          3,
          ["NVIDIA", "GPU", "CUDA"],
          [[0, 1, 5.0], [2, 1, 4.0]],
          ["GPU"],
          [1.0],
          0.5,
          2
        ],
        expected: [
          {'entity': 'NVIDIA', 'score': 0.3207, 'rank': 1},
          {'entity': 'CUDA', 'score': 0.2565, 'rank': 2}
        ]
      }
    ],
    defaultCustomInput: '3, ["NVIDIA", "GPU", "CUDA"], [[0, 1, 5.0], [2, 1, 4.0]], ["GPU"], [1.0], 0.5, 2',
    suggestedVisualizer: 'ppr-propagator'
  }
];
