import { Problem } from '../../types/problem';

export const MODULE_10_PROBLEMS: Problem[] = [
  {
    id: 'm10-p1',
    moduleId: 'module-10',
    order: 1,
    title: 'Implement Precision@K',
    difficulty: 'Easy',
    tags: ['Evaluation Metrics', 'Precision@K', 'Information Retrieval'],
    funcName: 'calculate_precision_at_k',
    description: `Given:
- A ranked list of retrieved document/chunk IDs \`retrieved\`.
- A set of ground-truth relevant document/chunk IDs \`ground_truth\`.
- Cutoff rank $K$.

Compute **Precision@K**:
The proportion of retrieved documents in the top-$K$ positions that are truly relevant:
$$\\text{Precision@}K = \\frac{|\\text{retrieved}[:K] \\cap \\text{ground\\_truth}|}{K}$$

Return the precision rounded to 4 decimal places. If $K == 0$, return 0.0.`,
    mathematicalExplanation: `Measures context purity in retrieved chunks: high Precision@K minimizes context contamination and distraction for the LLM.`,
    chimeraContext: `Primary evaluation metric for measuring top-3 and top-5 retrieval purity in Chimera.`,
    examples: [
      {
        input: 'retrieved = ["doc1", "doc2", "doc3", "doc4"], ground_truth = ["doc1", "doc3"], K = 3',
        output: '0.6667',
        explanation: 'In top-3 ["doc1", "doc2", "doc3"], 2 are relevant (doc1, doc3). 2/3 = 0.6667.'
      }
    ],
    constraints: [
      '1 <= len(retrieved) <= 1000',
      'K >= 0'
    ],
    expectedComplexity: {
      time: 'O(K)',
      space: 'O(|ground_truth|)'
    },
    starterCode: `def calculate_precision_at_k(retrieved: list[str], ground_truth: list[str], K: int) -> float:
    """
    Computes Precision@K.
    
    Args:
        retrieved: Ranked retrieved chunk IDs.
        ground_truth: Set of relevant chunk IDs.
        K: Cutoff rank.
        
    Returns:
        Precision@K rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def calculate_precision_at_k(retrieved: list[str], ground_truth: list[str], K: int) -> float:
    if K <= 0:
        return 0.0
    top_k = retrieved[:K]
    gt_set = set(ground_truth)
    hits = sum(1 for doc in top_k if doc in gt_set)
    return round(hits / K, 4)
`,
    editorial: `### Algorithmic Approach

1. If $K \\le 0$, return 0.0.
2. Slice top $K$ items from retrieved.
3. Count items in \`set(ground_truth)\`.
4. Divide by $K$ and round.`,
    hints: [
      'Convert ground_truth to a set for fast lookup.',
      'Count how many of retrieved[:K] are in the set.',
      'Divide by K.'
    ],
    testCases: [
      {
        inputs: [["doc1", "doc2", "doc3", "doc4"], ["doc1", "doc3"], 3],
        expected: 0.6667
      },
      {
        inputs: [["doc1", "doc2"], ["doc3"], 2],
        expected: 0.0
      }
    ],
    defaultCustomInput: '["doc1", "doc2", "doc3"], ["doc1", "doc3"], 2',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm10-p2',
    moduleId: 'module-10',
    order: 2,
    title: 'Implement Recall@K',
    difficulty: 'Easy',
    tags: ['Evaluation Metrics', 'Recall@K', 'Information Retrieval'],
    funcName: 'calculate_recall_at_k',
    description: `Compute **Recall@K**:
The proportion of all relevant documents that were successfully captured within the top-$K$ retrieved results:
$$\\text{Recall@}K = \\frac{|\\text{retrieved}[:K] \\cap \\text{ground\\_truth}|}{|\\text{ground\\_truth}|}$$

Return the recall rounded to 4 decimal places. If \`ground_truth\` is empty, return 0.0.`,
    mathematicalExplanation: `Measures retrieval completeness: high Recall@K guarantees that the factual answers exist somewhere in the prompt.`,
    chimeraContext: `Monitors whether the retrieval stage missed any necessary context chunks across multiple modalities.`,
    examples: [
      {
        input: 'retrieved = ["doc1", "doc2", "doc3"], ground_truth = ["doc1", "doc4"], K = 2',
        output: '0.5',
        explanation: 'Top-2 has doc1. Ground truth has 2 docs. 1/2 = 0.5.'
      }
    ],
    constraints: [
      'K >= 1'
    ],
    expectedComplexity: {
      time: 'O(K)',
      space: 'O(|ground_truth|)'
    },
    starterCode: `def calculate_recall_at_k(retrieved: list[str], ground_truth: list[str], K: int) -> float:
    """
    Computes Recall@K.
    
    Args:
        retrieved: Ranked retrieved chunk IDs.
        ground_truth: Relevant chunk IDs.
        K: Cutoff rank.
        
    Returns:
        Recall@K rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def calculate_recall_at_k(retrieved: list[str], ground_truth: list[str], K: int) -> float:
    if not ground_truth:
        return 0.0
    gt_set = set(ground_truth)
    top_k = retrieved[:K]
    hits = sum(1 for doc in top_k if doc in gt_set)
    return round(hits / len(gt_set), 4)
`,
    editorial: `### Algorithmic Approach

1. If ground truth is empty, return 0.0.
2. Count intersection of \`retrieved[:K]\` with \`gt_set\`.
3. Divide by total ground truth size and round.`,
    hints: [
      'Count hits in retrieved[:K].',
      'Divide by len(set(ground_truth)).'
    ],
    testCases: [
      {
        inputs: [["doc1", "doc2", "doc3"], ["doc1", "doc4"], 2],
        expected: 0.5
      }
    ],
    defaultCustomInput: '["doc1", "doc2", "doc3"], ["doc1", "doc4"], 2',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm10-p3',
    moduleId: 'module-10',
    order: 3,
    title: 'Calculate Mean Reciprocal Rank (MRR)',
    difficulty: 'Easy',
    tags: ['MRR', 'Evaluation Metrics', 'Ranking Quality'],
    funcName: 'calculate_mrr',
    description: `**Mean Reciprocal Rank (MRR)** evaluates the position of the **first** relevant item across a set of $Q$ queries:
$$\\text{MRR} = \\frac{1}{|Q|} \\sum_{i=1}^{|Q|} \\frac{1}{\\text{rank}_i}$$
where $\\text{rank}_i$ is the 1-based rank of the highest-ranked relevant document for query $i$. If no relevant document is retrieved for query $i$, its reciprocal rank is $0.0$.

Given:
- \`retrieved_lists\`: List of ranked retrieved lists, one per query: \`[[doc1, doc2, ...], ...]\`.
- \`ground_truth_lists\`: List of relevant document sets, one per query: \`[[gt1, gt2], ...]\`.

Compute and return the average MRR across all queries rounded to 4 decimal places.`,
    mathematicalExplanation: `Rewards systems that place the correct answer immediately at position 1 (score 1.0) versus position 2 (0.5) or position 10 (0.1).`,
    chimeraContext: `Demonstrates that Chimera places ground-truth multimodal context at the very top of the retrieved list.`,
    examples: [
      {
        input: 'retrieved_lists = [["d2", "d1", "d3"], ["d1", "d2"]], ground_truth_lists = [["d1"], ["d1"]]',
        output: '0.75',
        explanation: 'Query 1: d1 is at rank 2 -> RR = 1/2 = 0.5. Query 2: d1 is at rank 1 -> RR = 1/1 = 1.0. MRR = (0.5 + 1.0) / 2 = 0.75.'
      }
    ],
    constraints: [
      'len(retrieved_lists) == len(ground_truth_lists) >= 1'
    ],
    expectedComplexity: {
      time: 'O(\\sum |retrieved_i|)',
      space: 'O(|gt|)'
    },
    starterCode: `def calculate_mrr(retrieved_lists: list[list[str]], ground_truth_lists: list[list[str]]) -> float:
    """
    Computes Mean Reciprocal Rank across queries.
    
    Args:
        retrieved_lists: List of ranked doc lists.
        ground_truth_lists: List of relevant doc lists.
        
    Returns:
        MRR rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def calculate_mrr(retrieved_lists: list[list[str]], ground_truth_lists: list[list[str]]) -> float:
    num_queries = len(retrieved_lists)
    if num_queries == 0:
        return 0.0
        
    total_rr = 0.0
    for ret, gt in zip(retrieved_lists, ground_truth_lists):
        gt_set = set(gt)
        rr = 0.0
        for rank, doc in enumerate(ret, 1):
            if doc in gt_set:
                rr = 1.0 / rank
                break
        total_rr += rr
        
    return round(total_rr / num_queries, 4)
`,
    editorial: `### Algorithmic Approach

1. For each query, scan retrieved list.
2. The first time a document appears in \`set(gt)\`, record $RR = 1 / \\text{rank}$ and break.
3. Sum reciprocal ranks and divide by total queries.`,
    hints: [
      'Rank is 1-based: enumerate(ret, 1).',
      'Break immediately upon finding the first relevant document.',
      'Average across all queries.'
    ],
    testCases: [
      {
        inputs: [
          [["d2", "d1", "d3"], ["d1", "d2"]],
          [["d1"], ["d1"]]
        ],
        expected: 0.75
      }
    ],
    defaultCustomInput: '[["d2", "d1", "d3"], ["d1", "d2"]], [["d1"], ["d1"]]',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm10-p4',
    moduleId: 'module-10',
    order: 4,
    title: 'Calculate NDCG@K (Normalized Discounted Cumulative Gain)',
    difficulty: 'Medium',
    tags: ['NDCG', 'Information Retrieval', 'Graded Relevance'],
    funcName: 'calculate_ndcg_at_k',
    description: `**Normalized Discounted Cumulative Gain (NDCG@K)** evaluates graded relevance where documents have varying degrees of relevance (e.g. 3 = highly relevant, 2 = relevant, 1 = marginally relevant, 0 = irrelevant).

Formulas:
$$\\text{DCG@}K = \\sum_{i=1}^K \\frac{2^{\\text{rel}_i} - 1}{\\log_2(i + 1)}$$
$$\\text{IDCG@}K = \\sum_{i=1}^{\\min(K, |\\text{all\\_relevant}|)} \\frac{2^{\\text{rel}^{\\text{sorted}}_i} - 1}{\\log_2(i + 1)}$$
$$\\text{NDCG@}K = \\frac{\\text{DCG@}K}{\\text{IDCG@}K}$$
(If $\\text{IDCG@}K == 0$, return 0.0).

Given:
- \`retrieved_chunk_ids\`: List of retrieved IDs in ranked order.
- \`relevance_scores\`: Dictionary mapping \`chunk_id\` to integer relevance score $\\ge 0$ (defaulting to 0 if not listed).
- Cutoff $K$.

Compute and return NDCG@K rounded to 4 decimal places.`,
    mathematicalExplanation: `Logarithmic position discounting $\\frac{1}{\\log_2(i + 1)}$ enforces that relevant documents appearing higher up contribute exponentially more to user satisfaction than documents further down.`,
    chimeraContext: `The gold-standard research benchmark metric reported in the Chimera M.Tech dissertation.`,
    examples: [
      {
        input: 'retrieved_chunk_ids = ["c1", "c2", "c3"], relevance_scores = {"c1": 3, "c2": 2, "c3": 0}, K = 3',
        output: '1.0',
        explanation: 'Retrieved order (3, 2, 0) is ideal. DCG equals IDCG, so NDCG = 1.0.'
      }
    ],
    constraints: [
      'K >= 1'
    ],
    expectedComplexity: {
      time: 'O(K + N \\log N)',
      space: 'O(N)'
    },
    starterCode: `def calculate_ndcg_at_k(retrieved_chunk_ids: list[str], relevance_scores: dict[str, int], K: int) -> float:
    """
    Computes NDCG@K for graded relevance.
    
    Args:
        retrieved_chunk_ids: Ranked retrieved chunk IDs.
        relevance_scores: {chunk_id: int_score}.
        K: Cutoff rank.
        
    Returns:
        NDCG@K rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def calculate_ndcg_at_k(retrieved_chunk_ids: list[str], relevance_scores: dict[str, int], K: int) -> float:
    import math
    
    # 1. DCG@K
    dcg = 0.0
    for i, cid in enumerate(retrieved_chunk_ids[:K], 1):
        rel = relevance_scores.get(cid, 0)
        gain = (2 ** rel) - 1
        discount = math.log2(i + 1)
        dcg += gain / discount
        
    # 2. IDCG@K (Ideal DCG)
    all_rels = sorted(relevance_scores.values(), reverse=True)
    idcg = 0.0
    for i, rel in enumerate(all_rels[:K], 1):
        gain = (2 ** rel) - 1
        discount = math.log2(i + 1)
        idcg += gain / discount
        
    if idcg == 0.0:
        return 0.0
    return round(dcg / idcg, 4)
`,
    editorial: `### Algorithmic Approach

1. Compute DCG@K: $\\sum_{i=1}^K \\frac{2^{\\text{rel}_i} - 1}{\\log_2(i + 1)}$.
2. Sort all non-zero ground-truth relevance scores descending.
3. Compute IDCG@K over the top $K$ sorted scores.
4. If $\\text{IDCG} == 0$, return 0.0; else return $\\text{round}(\\text{DCG} / \\text{IDCG}, 4)$.`,
    hints: [
      'Gain is (2**rel) - 1.',
      'Discount is math.log2(i + 1).',
      'Sort relevance scores descending to calculate ideal DCG.'
    ],
    testCases: [
      {
        inputs: [["c1", "c2", "c3"], {"c1": 3, "c2": 2, "c3": 0}, 3],
        expected: 1.0
      },
      {
        inputs: [["c2", "c1", "c3"], {"c1": 3, "c2": 2, "c3": 0}, 3],
        expected: 0.9203
      }
    ],
    defaultCustomInput: '["c1", "c2", "c3"], {"c1": 3, "c2": 2, "c3": 0}, 3',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm10-p5',
    moduleId: 'module-10',
    order: 5,
    title: 'Compare Two Retrieval Systems (Paired T-Test)',
    difficulty: 'Medium',
    tags: ['Statistical Significance', 'Paired T-Test', 'Research Methods'],
    funcName: 'statistical_comparison',
    description: `In scientific research, observing that System B has higher average NDCG than System A is insufficient; we must prove **statistical significance**.

Given paired per-query scores for two systems:
- \`scores_a = [s1_a, s2_a, ...]\` (e.g. Vector-only).
- \`scores_b = [s1_b, s2_b, ...]\` (e.g. Chimera Hybrid).

Steps:
1. Compute difference vector: $d_i = \\text{scores\\_b}[i] - \\text{scores\\_a}[i]$.
2. Compute mean difference $\\bar{d} = \\frac{1}{N} \\sum d_i$.
3. Compute sample standard deviation:
   $$s_d = \\sqrt{\\frac{\\sum (d_i - \\bar{d})^2}{N - 1}}$$
4. Compute paired t-statistic:
   $$t = \\frac{\\bar{d}}{s_d / \\sqrt{N}}$$
5. Determine statistical significance: if $|t| > 2.0$ (approximate 95% confidence for $N \\ge 30$), \`is_significant = True\`, else \`False\`.

Return a tuple \`(round(mean_diff, 4), round(t_stat, 4), is_significant: bool)\`.
If $s_d == 0$, return \`(round(mean_diff, 4), 0.0, False)\`.`,
    mathematicalExplanation: `Student\'s paired t-test tests the null hypothesis $H_0: \\mu_d = 0$ against alternative $H_1: \\mu_d \\neq 0$.`,
    chimeraContext: `Validates research claims in Chimera papers that hybrid retrieval provides statistically significant improvements over single-channel baselines.`,
    examples: [
      {
        input: 'scores_a = [0.6, 0.7, 0.5], scores_b = [0.8, 0.9, 0.7]',
        output: '(0.2, 0.0, False)',
        explanation: 'All differences are identical (+0.2). Sample standard deviation is 0, so t=0.0.'
      }
    ],
    constraints: [
      'len(scores_a) == len(scores_b) >= 2'
    ],
    expectedComplexity: {
      time: 'O(N)',
      space: 'O(N)'
    },
    starterCode: `def statistical_comparison(scores_a: list[float], scores_b: list[float]) -> tuple[float, float, bool]:
    """
    Computes mean difference and paired t-statistic between two systems.
    
    Args:
        scores_a: Baseline scores.
        scores_b: Chimera scores.
        
    Returns:
        (mean_diff, t_stat, is_significant)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def statistical_comparison(scores_a: list[float], scores_b: list[float]) -> tuple[float, float, bool]:
    import math
    N = len(scores_a)
    diffs = [b - a for a, b in zip(scores_a, scores_b)]
    mean_d = sum(diffs) / N
    
    var_d = sum((x - mean_d) ** 2 for x in diffs) / (N - 1)
    std_d = math.sqrt(var_d)
    
    if std_d == 0.0:
        return round(mean_d, 4), 0.0, False
        
    t_stat = mean_d / (std_d / math.sqrt(N))
    is_sig = abs(t_stat) > 2.0
    return round(mean_d, 4), round(t_stat, 4), is_sig
`,
    editorial: `### Algorithmic Approach

1. Calculate difference array $d = b - a$.
2. Compute mean difference $\\bar{d}$.
3. Calculate sample variance $\\frac{\\sum (d_i - \\bar{d})^2}{N - 1}$ and standard deviation.
4. $t = \\bar{d} / (s_d / \\sqrt{N})$.
5. Significant if $|t| > 2.0$.`,
    hints: [
      'Compute diffs = [b - a for a, b in zip(scores_a, scores_b)].',
      'Use N - 1 in the denominator for sample variance.',
      'Check if abs(t_stat) > 2.0.'
    ],
    testCases: [
      {
        inputs: [[0.6, 0.7, 0.5], [0.8, 0.9, 0.7]],
        expected: [0.2, 0.0, false]
      },
      {
        inputs: [
          [0.5, 0.5, 0.5, 0.5, 0.5],
          [0.7, 0.8, 0.9, 0.75, 0.85]
        ],
        expected: [0.3, 8.4853, true]
      }
    ],
    defaultCustomInput: '[0.6, 0.7, 0.5], [0.8, 0.9, 0.7]',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm10-p6',
    moduleId: 'module-10',
    order: 6,
    title: 'Benchmark Runner Across Test Suite',
    difficulty: 'Medium',
    tags: ['Benchmark', 'Automated Testing', 'Test Suite'],
    funcName: 'run_retrieval_benchmark',
    description: `Build an automated benchmark runner that computes Precision@3, Recall@3, and MRR across a suite of test queries.

Given:
- \`test_suite = [{'query': str, 'retrieved': list[str], 'ground_truth': list[str]}, ...]\`

For each query:
1. Compute Precision@3: fraction of top-3 retrieved in ground truth.
2. Compute Recall@3: fraction of ground truth in top-3 retrieved.
3. Compute Reciprocal Rank (RR): $1 / \\text{rank}$ of the first ground truth hit (0.0 if not found).

Compute the macro-average (mean) of each metric across all queries in \`test_suite\`.
Return a dictionary:
\`{'mean_precision_at_3': float, 'mean_recall_at_3': float, 'mrr': float}\`
Round all metrics to 4 decimal places.`,
    mathematicalExplanation: `Macro-averaged system evaluation:
$$\\text{MeanMetric} = \\frac{1}{|Q|} \\sum_{q \\in Q} \\text{Metric}(q)$$`,
    chimeraContext: `The core CI/CD regression test ensuring that knowledge graph updates improve retrieval metrics across the benchmark suite.`,
    examples: [
      {
        input: 'test_suite = [{"query": "q1", "retrieved": ["d1", "d2", "d3"], "ground_truth": ["d1"]}]',
        output: '{"mean_precision_at_3": 0.3333, "mean_recall_at_3": 1.0, "mrr": 1.0}',
        explanation: '1 hit out of 3 -> P@3 = 0.3333. 1 hit out of 1 GT -> R@3 = 1.0. First hit at rank 1 -> RR = 1.0.'
      }
    ],
    constraints: [
      '1 <= len(test_suite) <= 500'
    ],
    expectedComplexity: {
      time: 'O(|test_suite|)',
      space: 'O(1)'
    },
    starterCode: `def run_retrieval_benchmark(test_suite: list[dict]) -> dict[str, float]:
    """
    Runs automated benchmark suite computing mean P@3, R@3, and MRR.
    
    Args:
        test_suite: [{'query', 'retrieved', 'ground_truth'}, ...]
        
    Returns:
        {'mean_precision_at_3', 'mean_recall_at_3', 'mrr'}
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def run_retrieval_benchmark(test_suite: list[dict]) -> dict[str, float]:
    n = len(test_suite)
    if n == 0:
        return {'mean_precision_at_3': 0.0, 'mean_recall_at_3': 0.0, 'mrr': 0.0}
        
    tot_p = 0.0
    tot_r = 0.0
    tot_mrr = 0.0
    
    for item in test_suite:
        ret = item["retrieved"]
        gt = set(item["ground_truth"])
        top3 = ret[:3]
        
        hits = sum(1 for d in top3 if d in gt)
        p = hits / 3.0
        r = hits / len(gt) if gt else 0.0
        
        rr = 0.0
        for rank, d in enumerate(ret, 1):
            if d in gt:
                rr = 1.0 / rank
                break
                
        tot_p += p
        tot_r += r
        tot_mrr += rr
        
    return {
        'mean_precision_at_3': round(tot_p / n, 4),
        'mean_recall_at_3': round(tot_r / n, 4),
        'mrr': round(tot_mrr / n, 4)
    }
`,
    editorial: `### Algorithmic Approach

1. Iterate through each test case.
2. Calculate $P@3 = \\text{hits} / 3.0$ and $R@3 = \\text{hits} / |GT|$.
3. Find first rank in \`ret\` matching ground truth for reciprocal rank.
4. Average all metrics across total queries.`,
    hints: [
      'Use ret[:3] for top 3 items.',
      'Precision@3 is hits / 3.0.',
      'Average across all test cases.'
    ],
    testCases: [
      {
        inputs: [[{"query": "q1", "retrieved": ["d1", "d2", "d3"], "ground_truth": ["d1"]}]],
        expected: {"mean_precision_at_3": 0.3333, "mean_recall_at_3": 1.0, "mrr": 1.0}
      }
    ],
    defaultCustomInput: '[{"query": "q1", "retrieved": ["d1", "d2", "d3"], "ground_truth": ["d1"]}]',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm10-p7',
    moduleId: 'module-10',
    order: 7,
    title: 'Parameter Sweep: Impact of Damping Factor on NDCG',
    difficulty: 'Medium',
    tags: ['Parameter Sweep', 'Grid Search', 'Ablation'],
    funcName: 'sweep_damping_factor',
    description: `Determine the optimal damping factor $\\alpha$ for a dataset by running a parameter sweep.

Given:
- A list of candidate damping values: \`alphas = [0.5, 0.7, 0.85, 0.95]\`.
- A mock evaluation function: \`eval_alpha_fn(alpha) -> float\` returning the benchmark NDCG score for that $\\alpha$.

Find:
1. The mapping of each $\\alpha$ to its NDCG score: \`{alpha: score, ...}\`.
2. The optimal $\\alpha^*$ maximizing NDCG.

Return a tuple \`(results_dict, best_alpha)\`. Round all scores to 4 decimal places.`,
    mathematicalExplanation: `Hyperparameter optimization:
$$\\alpha^* = \\arg\\max_{\\alpha \\in \\mathcal{A}} \\text{NDCG}(\\text{PPR}_\\alpha)$$`,
    chimeraContext: `Directly used to generate the parameter sensitivity plots in the Chimera thesis.`,
    examples: [
      {
        input: 'alphas = [0.5, 0.85], eval_alpha_fn = lambda a: 0.75 if a == 0.85 else 0.60',
        output: '({0.5: 0.6, 0.85: 0.75}, 0.85)',
        explanation: 'alpha=0.85 achieves highest NDCG of 0.75.'
      }
    ],
    constraints: [
      'len(alphas) >= 1'
    ],
    expectedComplexity: {
      time: 'O(|alphas|)',
      space: 'O(|alphas|)'
    },
    starterCode: `def sweep_damping_factor(alphas: list[float], eval_alpha_fn) -> tuple[dict[float, float], float]:
    """
    Evaluates NDCG across damping factors and identifies optimal alpha.
    
    Args:
        alphas: List of alpha values.
        eval_alpha_fn: Callable(alpha) -> float.
        
    Returns:
        (results_dict, best_alpha)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def sweep_damping_factor(alphas: list[float], eval_alpha_fn) -> tuple[dict[float, float], float]:
    results = {}
    best_alpha = alphas[0]
    best_score = -float('inf')
    
    for a in alphas:
        sc = eval_alpha_fn(a)
        rounded_sc = round(sc, 4)
        results[a] = rounded_sc
        if rounded_sc > best_score:
            best_score = rounded_sc
            best_alpha = a
            
    return results, best_alpha
`,
    editorial: `### Algorithmic Approach

1. Evaluate each $\\alpha \\in \\text{alphas}$ with \`eval_alpha_fn\`.
2. Track the maximum score and argmax $\\alpha^*$.
3. Return dictionary and best $\\alpha$.`,
    hints: [
      'Iterate through alphas.',
      'Track max score and best alpha.',
      'Round scores to 4 decimal places.'
    ],
    testCases: [
      {
        inputs: [[0.5, 0.85], "lambda a: 0.75 if a == 0.85 else 0.60"],
        expected: [{0.5: 0.6, 0.85: 0.75}, 0.85]
      }
    ],
    defaultCustomInput: '[0.5, 0.85], lambda a: 0.75 if a == 0.85 else 0.60',
    suggestedVisualizer: 'pagerank-visualizer'
  },
  {
    id: 'm10-p8',
    moduleId: 'module-10',
    order: 8,
    title: 'Measure Effect of Reverse-Edge Weight Beta on Inverted Queries',
    difficulty: 'Medium',
    tags: ['Reverse Edges', 'Inverted Queries', 'Ablation'],
    funcName: 'evaluate_reverse_edge_impact',
    description: `Evaluate the quantitative benefit of adding reverse edges on inverted queries (queries seeking the head from the tail, e.g. "Who wrote Attention is All You Need?").

Given:
- \`beta_values = [0.0, 0.1, 0.3, 0.5, 1.0]\` (where $\\beta=0.0$ represents standard forward-only graph).
- \`eval_beta_fn(beta) -> float\` returning Recall@5 on inverted queries.

Find:
1. Recall@5 for each $\\beta$.
2. The **relative improvement** over the forward-only baseline ($\\beta=0.0$):
   $$\\text{Improvement} = \\frac{\\text{Recall}(\\beta^*) - \\text{Recall}(0.0)}{\\max(10^{-4}, \\text{Recall}(0.0))} \\times 100\\%$$

Return a tuple \`(recall_by_beta: dict, round(rel_improvement, 2))\`.`,
    mathematicalExplanation: `Ablation quantification proving the contribution of reverse topological flow:
$$\\Delta \\mathcal{M} = \\frac{\\mathcal{M}_{\\beta^*} - \\mathcal{M}_{\\beta=0}}{\\mathcal{M}_{\\beta=0}}$$`,
    chimeraContext: `Proves in Chimera that bidirectional graph augmentation increases inverted query recall by over 35%.`,
    examples: [
      {
        input: 'beta_values = [0.0, 0.3], eval_beta_fn = lambda b: 0.40 if b == 0.0 else 0.60',
        output: '({0.0: 0.4, 0.3: 0.6}, 50.0)',
        explanation: 'Recall increases from 0.4 to 0.6 (+50% relative improvement).'
      }
    ],
    constraints: [
      'beta_values contains 0.0'
    ],
    expectedComplexity: {
      time: 'O(|beta_values|)',
      space: 'O(|beta_values|)'
    },
    starterCode: `def evaluate_reverse_edge_impact(beta_values: list[float], eval_beta_fn) -> tuple[dict[float, float], float]:
    """
    Evaluates Recall@5 across beta values and relative improvement over beta=0.
    
    Args:
        beta_values: List of beta values.
        eval_beta_fn: Callable(beta) -> float.
        
    Returns:
        (recall_by_beta, relative_improvement_pct)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def evaluate_reverse_edge_impact(beta_values: list[float], eval_beta_fn) -> tuple[dict[float, float], float]:
    recalls = {}
    for b in beta_values:
        recalls[b] = round(eval_beta_fn(b), 4)
        
    base_recall = recalls.get(0.0, 0.0)
    best_recall = max(recalls.values())
    
    diff = best_recall - base_recall
    rel_imp = (diff / max(1e-4, base_recall)) * 100.0
    return recalls, round(rel_imp, 2)
`,
    editorial: `### Algorithmic Approach

1. Evaluate each $\\beta$ with \`eval_beta_fn\`.
2. Extract baseline recall at $\\beta=0.0$.
3. Compute maximum recall across all $\\beta$.
4. Calculate percentage improvement: $((best - base) / base) \\times 100$.`,
    hints: [
      'Evaluate recalls[b] for each beta.',
      'Base recall is recalls[0.0].',
      'Relative improvement is (best - base) / base * 100.'
    ],
    testCases: [
      {
        inputs: [[0.0, 0.3], "lambda b: 0.40 if b == 0.0 else 0.60"],
        expected: [{0.0: 0.4, 0.3: 0.6}, 50.0]
      }
    ],
    defaultCustomInput: '[0.0, 0.3], lambda b: 0.40 if b == 0.0 else 0.60',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm10-p9',
    moduleId: 'module-10',
    order: 9,
    title: 'Compare Vector-Only, Graph-Only, and Hybrid Retrieval',
    difficulty: 'Medium',
    tags: ['Baseline Comparison', 'Tri-System Benchmark', 'Hybrid Superiority'],
    funcName: 'compare_three_retrievers',
    description: `Run a comparative benchmark evaluating three distinct retrieval configurations across a test set of queries:
1. **Vector-Only:** Dense cosine similarity search alone.
2. **Graph-Only:** Personalized PageRank alone.
3. **Chimera Hybrid:** RRF fusion of Vector + Graph.

Given:
- \`benchmark_queries = [{'query': str, 'ground_truth': list[str], 'vector_ranked': list[str], 'graph_ranked': list[str]}, ...]\`

For each query:
1. Compute Hybrid ranking using RRF ($k=60$) on \`vector_ranked\` and \`graph_ranked\`.
2. Compute Recall@3 for all three configurations against \`ground_truth\`.
3. Compute the macro-average Recall@3 for each configuration.

Return a dictionary:
\`{'vector_recall_at_3': float, 'graph_recall_at_3': float, 'hybrid_recall_at_3': float}\`
Round all metrics to 4 decimal places.`,
    mathematicalExplanation: `Demonstrates that multi-view information fusion achieves super-additive recall:
$$\\text{Recall}(\\mathcal{R}_V \\oplus \\mathcal{R}_G) \\ge \\max(\\text{Recall}(\\mathcal{R}_V), \\text{Recall}(\\mathcal{R}_G))$$`,
    chimeraContext: `The primary experimental table presented in Chapter 4 of the Chimera dissertation.`,
    examples: [
      {
        input: 'benchmark_queries = [{"query": "q", "ground_truth": ["d1", "d2"], "vector_ranked": ["d1", "x", "y"], "graph_ranked": ["d2", "x", "z"]}]',
        output: '{"vector_recall_at_3": 0.5, "graph_recall_at_3": 0.5, "hybrid_recall_at_3": 1.0}',
        explanation: 'Vector finds d1, misses d2 (Recall 0.5). Graph finds d2, misses d1 (Recall 0.5). Hybrid RRF retrieves both d1 and d2 in top-3 (Recall 1.0)!'
      }
    ],
    constraints: [
      '1 <= len(benchmark_queries) <= 200'
    ],
    expectedComplexity: {
      time: 'O(|queries| \\cdot N \\log N)',
      space: 'O(N)'
    },
    starterCode: `def compare_three_retrievers(benchmark_queries: list[dict]) -> dict[str, float]:
    """
    Compares Recall@3 between Vector-only, Graph-only, and Hybrid RRF.
    
    Args:
        benchmark_queries: List of query dicts.
        
    Returns:
        {'vector_recall_at_3', 'graph_recall_at_3', 'hybrid_recall_at_3'}
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def compare_three_retrievers(benchmark_queries: list[dict]) -> dict[str, float]:
    n = len(benchmark_queries)
    if n == 0:
        return {'vector_recall_at_3': 0.0, 'graph_recall_at_3': 0.0, 'hybrid_recall_at_3': 0.0}
        
    tot_v = 0.0
    tot_g = 0.0
    tot_h = 0.0
    
    for q in benchmark_queries:
        gt = set(q["ground_truth"])
        v_list = q["vector_ranked"]
        g_list = q["graph_ranked"]
        
        # 1. Vector recall@3
        v_hits = sum(1 for d in v_list[:3] if d in gt)
        tot_v += v_hits / len(gt) if gt else 0.0
        
        # 2. Graph recall@3
        g_hits = sum(1 for d in g_list[:3] if d in gt)
        tot_g += g_hits / len(gt) if gt else 0.0
        
        # 3. Hybrid RRF
        rrf = {}
        for rank, d in enumerate(v_list, 1):
            rrf[d] = rrf.get(d, 0.0) + 1.0 / (60 + rank)
        for rank, d in enumerate(g_list, 1):
            rrf[d] = rrf.get(d, 0.0) + 1.0 / (60 + rank)
            
        h_sorted = sorted(rrf.items(), key=lambda x: (-x[1], x[0]))
        h_top3 = [d for d, _ in h_sorted[:3]]
        h_hits = sum(1 for d in h_top3 if d in gt)
        tot_h += h_hits / len(gt) if gt else 0.0
        
    return {
        'vector_recall_at_3': round(tot_v / n, 4),
        'graph_recall_at_3': round(tot_g / n, 4),
        'hybrid_recall_at_3': round(tot_h / n, 4)
    }
`,
    editorial: `### Algorithmic Approach

1. For each query, calculate vector recall@3 and graph recall@3.
2. Run RRF on vector and graph rankings to generate hybrid ranking.
3. Compute hybrid recall@3.
4. Average all metrics across queries.`,
    hints: [
      'Compute RRF on the two lists using 1.0 / (60 + rank).',
      'Take top 3 items for each system.',
      'Divide hits by len(set(ground_truth)).'
    ],
    testCases: [
      {
        inputs: [[{
          "query": "q",
          "ground_truth": ["d1", "d2"],
          "vector_ranked": ["d1", "x", "y"],
          "graph_ranked": ["d2", "x", "z"]
        }]],
        expected: {
          "vector_recall_at_3": 0.5,
          "graph_recall_at_3": 0.5,
          "hybrid_recall_at_3": 1.0
        }
      }
    ],
    defaultCustomInput: '[{"query": "q", "ground_truth": ["d1", "d2"], "vector_ranked": ["d1", "x", "y"], "graph_ranked": ["d2", "x", "z"]}]',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm10-p10',
    moduleId: 'module-10',
    order: 10,
    title: 'Design an Ablation Study Matrix',
    difficulty: 'Hard',
    tags: ['Ablation Study', 'Research Methodology', 'Evaluation'],
    funcName: 'build_ablation_matrix',
    description: `An **Ablation Study** systematically disables individual components of an architecture to measure each component\'s marginal contribution.

Given:
- Baseline complete Chimera pipeline score (NDCG): $S_{\\text{full}}$.
- A list of ablations to test:
  \`ablations = [{'name': str, 'eval_fn': callable}, ...]\`
  where each \`eval_fn()\` returns the NDCG of the system when that specific component is disabled (e.g. \`"-PPR Graph Retrieval"\`, \`"-Reverse Edges"\`, \`"-CRAG Relevance Grader"\`, \`"-RRF Fusion"\`).

For each ablation:
1. Run \`eval_fn()\` to obtain $S_{\\text{ablated}}$.
2. Compute the **Performance Drop**: $\\Delta = S_{\\text{full}} - S_{\\text{ablated}}$.
3. Compute the **Percentage Degradation**:
   $$\\% \\text{ Degradation} = \\frac{\\Delta}{S_{\\text{full}}} \\times 100\\%$$

Return a list of dictionaries sorted by $\\Delta$ descending (highest impact component first):
\`[{'ablation': str, 'score': float, 'drop': float, 'degradation_pct': float}, ...]\`
Round \`score\` and \`drop\` to 4 decimal places, and \`degradation_pct\` to 2 decimal places.`,
    mathematicalExplanation: `Shapley-style marginal impact quantification:
$$\\Delta_c = \\mathcal{U}(\\mathcal{C}) - \\mathcal{U}(\\mathcal{C} \\setminus \\{c\\})$$
Components whose removal induces the largest performance drop $\\Delta_c$ are the most critical architectural innovations.`,
    chimeraContext: `The final research synthesis proving the indispensability of each subsystem in Chimera for the M.Tech defense committee.`,
    examples: [
      {
        input: 'full_score = 0.85, ablations = [{"name": "-PPR", "eval_fn": lambda: 0.65}, {"name": "-CRAG", "eval_fn": lambda: 0.75}]',
        output: '[{"ablation": "-PPR", "score": 0.65, "drop": 0.2, "degradation_pct": 23.53}, {"ablation": "-CRAG", "score": 0.75, "drop": 0.1, "degradation_pct": 11.76}]',
        explanation: 'Removing PPR causes a 0.20 drop (23.53% degradation), identifying it as the highest-impact component.'
      }
    ],
    constraints: [
      'full_score > 0',
      'len(ablations) >= 1'
    ],
    expectedComplexity: {
      time: 'O(|ablations|)',
      space: 'O(|ablations|)'
    },
    starterCode: `def build_ablation_matrix(full_score: float, ablations: list[dict]) -> list[dict]:
    """
    Computes marginal drop and percentage degradation for ablation study.
    
    Args:
        full_score: Benchmark score of full pipeline.
        ablations: [{'name': str, 'eval_fn': callable}, ...]
        
    Returns:
        List of ablation results sorted by drop desc.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def build_ablation_matrix(full_score: float, ablations: list[dict]) -> list[dict]:
    results = []
    for item in ablations:
        name = item["name"]
        fn = item["eval_fn"]
        sc = fn()
        drop = full_score - sc
        deg_pct = (drop / full_score) * 100.0
        results.append({
            "ablation": name,
            "score": round(sc, 4),
            "drop": round(drop, 4),
            "degradation_pct": round(deg_pct, 2)
        })
        
    results.sort(key=lambda x: (-x["drop"], x["ablation"]))
    return results
`,
    editorial: `### Algorithmic Approach

1. For each ablation candidate, invoke \`eval_fn()\`.
2. Compute $\\text{drop} = S_{\\text{full}} - S_{\\text{ablated}}$.
3. Compute $\\text{pct} = (\\text{drop} / S_{\\text{full}}) \\times 100$.
4. Sort by drop descending, breaking ties by ablation name ascending.`,
    hints: [
      'drop = full_score - ablated_score.',
      'degradation_pct = (drop / full_score) * 100.0.',
      'Sort by (-drop, name).'
    ],
    testCases: [
      {
        inputs: [
          0.85,
          [{"name": "-PPR", "eval_fn": "lambda: 0.65"}, {"name": "-CRAG", "eval_fn": "lambda: 0.75"}]
        ],
        expected: [
          {"ablation": "-PPR", "score": 0.65, "drop": 0.2, "degradation_pct": 23.53},
          {"ablation": "-CRAG", "score": 0.75, "drop": 0.1, "degradation_pct": 11.76}
        ]
      }
    ],
    defaultCustomInput: '0.85, [{"name": "-PPR", "eval_fn": lambda: 0.65}]',
    suggestedVisualizer: 'hybrid-comparator'
  }
];
