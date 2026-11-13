import { Problem } from '../../types/problem';

export const MODULE_8_PROBLEMS: Problem[] = [
  {
    id: 'm8-p1',
    moduleId: 'module-8',
    order: 1,
    title: 'Dense Vector Cosine Search (Qdrant Style)',
    difficulty: 'Easy',
    tags: ['Vector Search', 'Cosine Similarity', 'Dense Retrieval'],
    funcName: 'dense_vector_search',
    description: `Vector databases like **Qdrant** store high-dimensional embeddings of document passages and execute nearest-neighbor search.

Given:
- A query embedding vector \`query_emb\` of dimension $d$.
- A collection of indexed document chunks:
  \`chunks = [{'chunk_id': str, 'text': str, 'embedding': list[float]}, ...]\`
- Integer $K$ (number of top results to return).

Compute the cosine similarity between \`query_emb\` and each chunk\'s embedding.
Retrieve the top-$K$ chunks with highest cosine similarity.

Return a list of dictionaries sorted by score descending:
\`[{'chunk_id': str, 'score': float, 'text': str}, ...]\`
Round scores to 4 decimal places. If scores are tied, sort by \`chunk_id\` ascending.`,
    mathematicalExplanation: `Dense semantic retrieval ranks documents by the cosine similarity of their contextual vector representations:
$$s_{\\text{dense}}(q, d) = \\frac{\\mathbf{q} \\cdot \\mathbf{d}}{\\|\\mathbf{q}\\|_2 \\|\\mathbf{d}\\|_2}$$
Captures fuzzy semantic similarity, synonyms, and paraphrasing without requiring explicit keyword overlap.`,
    chimeraContext: `The dense vector channel in Chimera\'s dual-channel retrieval architecture (interfacing Qdrant).`,
    examples: [
      {
        input: 'query_emb = [1.0, 0.0], chunks = [{"chunk_id": "c1", "text": "A", "embedding": [0.8, 0.6]}, {"chunk_id": "c2", "text": "B", "embedding": [0.0, 1.0]}], K = 1',
        output: '[{"chunk_id": "c1", "score": 0.8, "text": "A"}]',
        explanation: 'Cosine similarity for c1 is 0.8 / (1.0 * 1.0) = 0.8. For c2 is 0.0. Top-1 is c1.'
      }
    ],
    constraints: [
      '1 <= len(chunks) <= 2000',
      '1 <= K <= len(chunks)'
    ],
    expectedComplexity: {
      time: 'O(|chunks| \\cdot d + |chunks| \\log K)',
      space: 'O(|chunks|)'
    },
    starterCode: `def dense_vector_search(query_emb: list[float], chunks: list[dict], K: int) -> list[dict]:
    """
    Retrieves top-K chunks by cosine similarity with query_emb.
    
    Args:
        query_emb: Query vector of dimension d.
        chunks: List of {'chunk_id', 'text', 'embedding'}.
        K: Top-K count.
        
    Returns:
        List of {'chunk_id', 'score', 'text'} sorted by score desc.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def dense_vector_search(query_emb: list[float], chunks: list[dict], K: int) -> list[dict]:
    import math
    norm_q = math.sqrt(sum(x * x for x in query_emb))
    if norm_q == 0.0:
        return []
        
    scored = []
    for c in chunks:
        emb = c["embedding"]
        dot = sum(x * y for x, y in zip(query_emb, emb))
        norm_e = math.sqrt(sum(y * y for y in emb))
        sim = dot / (norm_q * norm_e) if norm_e > 0 else 0.0
        scored.append({
            "chunk_id": c["chunk_id"],
            "score": round(sim, 4),
            "text": c["text"]
        })
        
    scored.sort(key=lambda x: (-x["score"], x["chunk_id"]))
    return scored[:K]
`,
    editorial: `### Algorithmic Approach

1. Compute $L_2$ norm of query vector.
2. For each document chunk, calculate dot product and document vector norm.
3. Compute cosine similarity.
4. Sort candidates using key: \`(-x['score'], x['chunk_id'])\`.
5. Slice and return top $K$.`,
    hints: [
      'Compute dot product and norms using zip.',
      'Handle zero-norm vectors safely.',
      'Sort by (-score, chunk_id) to handle ties deterministically.'
    ],
    testCases: [
      {
        inputs: [
          [1.0, 0.0],
          [
            {"chunk_id": "c1", "text": "A", "embedding": [0.8, 0.6]},
            {"chunk_id": "c2", "text": "B", "embedding": [0.0, 1.0]}
          ],
          1
        ],
        expected: [{"chunk_id": "c1", "score": 0.8, "text": "A"}]
      }
    ],
    defaultCustomInput: '[1.0, 0.0], [{"chunk_id": "c1", "text": "A", "embedding": [0.8, 0.6]}], 1',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm8-p2',
    moduleId: 'module-8',
    order: 2,
    title: 'Top-K Vector Candidates with Threshold Filtering',
    difficulty: 'Easy',
    tags: ['Threshold Filtering', 'Vector Search', 'Information Retrieval'],
    funcName: 'filter_vector_candidates',
    description: `In RAG pipelines, returning low-scoring vector candidates causes hallucination. Filtering by minimum score ensures only relevant passages reach the context window.

Given a list of scored vector candidates:
\`candidates = [{'chunk_id': str, 'score': float}, ...]\`
a minimum similarity threshold \`min_threshold = 0.65\`, and maximum budget $K$:

1. Discard any candidate with \`score < min_threshold\`.
2. Sort remaining candidates by score descending (tie-break by \`chunk_id\` ascending).
3. Keep at most $K$ candidates.

Return the filtered list of dictionaries.`,
    mathematicalExplanation: `$$\\mathcal{C}_{\\text{filtered}} = \\text{TopK}_{d \\in \\mathcal{D}, s(q, d) \\ge \\theta} (s(q, d))$$
Guarantees precision bounded below by threshold $\\theta$.`,
    chimeraContext: `Prevents vector channel noise from leaking into Chimera\'s fusion layer when queries have low semantic match in the database.`,
    examples: [
      {
        input: 'candidates = [{"chunk_id": "c1", "score": 0.85}, {"chunk_id": "c2", "score": 0.5}, {"chunk_id": "c3", "score": 0.72}], min_threshold = 0.65, K = 2',
        output: '[{"chunk_id": "c1", "score": 0.85}, {"chunk_id": "c3", "score": 0.72}]',
        explanation: 'c2 has score 0.5 < 0.65 and is discarded. c1 and c3 survive.'
      }
    ],
    constraints: [
      '0 <= len(candidates) <= 1000'
    ],
    expectedComplexity: {
      time: 'O(N \\log N)',
      space: 'O(N)'
    },
    starterCode: `def filter_vector_candidates(candidates: list[dict], min_threshold: float, K: int) -> list[dict]:
    """
    Filters candidates by threshold and limits to top-K.
    
    Args:
        candidates: [{'chunk_id': str, 'score': float}, ...]
        min_threshold: Minimum score.
        K: Max count.
        
    Returns:
        Filtered list sorted by score desc.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def filter_vector_candidates(candidates: list[dict], min_threshold: float, K: int) -> list[dict]:
    survivors = [c for c in candidates if c["score"] >= min_threshold]
    survivors.sort(key=lambda x: (-x["score"], x["chunk_id"]))
    return survivors[:K]
`,
    editorial: `### Algorithmic Approach

1. Filter list with list comprehension \`c['score'] >= min_threshold\`.
2. Sort survivors by \`(-score, chunk_id)\`.
3. Return slice \`[:K]\`.`,
    hints: [
      'Filter candidates with score >= min_threshold.',
      'Sort using key=lambda x: (-x["score"], x["chunk_id"]).',
      'Return the top K.'
    ],
    testCases: [
      {
        inputs: [
          [{"chunk_id": "c1", "score": 0.85}, {"chunk_id": "c2", "score": 0.5}, {"chunk_id": "c3", "score": 0.72}],
          0.65,
          2
        ],
        expected: [{"chunk_id": "c1", "score": 0.85}, {"chunk_id": "c3", "score": 0.72}]
      }
    ],
    defaultCustomInput: '[{"chunk_id": "c1", "score": 0.85}], 0.65, 2',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm8-p3',
    moduleId: 'module-8',
    order: 3,
    title: 'Retrieve Graph Candidates Using PPR',
    difficulty: 'Medium',
    tags: ['Graph Candidates', 'PPR Retrieval', 'Dual Channel'],
    funcName: 'retrieve_graph_candidates',
    description: `Given an $n \\times n$ row-stochastic matrix $P$, entity names list \`entities\` of length $n$, and query seed dictionary \`seed_weights = {seed_name: weight, ...}\`:

1. Build normalized personalization vector $v$.
2. Run PPR until convergence ($L_1 < 10^{-6}$).
3. Extract non-seed entities with their scores.
4. Return the top-$K$ candidate entities as a list:
\`[{'entity': str, 'graph_score': float, 'rank': int}, ...]\`
Round scores to 4 decimal places. Rank starts at 1.`,
    mathematicalExplanation: `Identifies the topological core of entities related to the query seeds:
$$\\mathcal{C}_{\\text{graph}} = \\text{TopK}_{e \\notin S_q} \\left( \\text{PPR}(G, v_q) \\right)$$`,
    chimeraContext: `The second retrieval channel in Chimera, generating graph entities to be mapped back to document chunks.`,
    examples: [
      {
        input: 'P = [[0.0, 1.0], [1.0, 0.0]], entities = ["A", "B"], seed_weights = {"A": 1.0}, K = 1',
        output: '[{"entity": "B", "graph_score": 0.4633, "rank": 1}]',
        explanation: 'Seed is A. Non-seed candidate B receives score 0.4633 at rank 1.'
      }
    ],
    constraints: [
      '2 <= n <= 100'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot n^2 + n \\log n)',
      space: 'O(n^2)'
    },
    starterCode: `def retrieve_graph_candidates(P: list[list[float]], entities: list[str], seed_weights: dict[str, float], K: int) -> list[dict]:
    """
    Runs PPR from seeds and retrieves top-K non-seed entities.
    
    Args:
        P: Transition matrix.
        entities: Entity names list.
        seed_weights: {name: weight}.
        K: Top count.
        
    Returns:
        List of {'entity', 'graph_score', 'rank'}.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def retrieve_graph_candidates(P: list[list[float]], entities: list[str], seed_weights: dict[str, float], K: int) -> list[dict]:
    n = len(entities)
    name_to_idx = {name: i for i, name in enumerate(entities)}
    
    v = [0.0] * n
    seed_indices = set()
    for name, w in seed_weights.items():
        if name in name_to_idx and w > 0:
            idx = name_to_idx[name]
            v[idx] += w
            seed_indices.add(idx)
            
    tot_w = sum(v)
    v = [x / tot_w for x in v] if tot_w > 0 else [1.0 / n] * n
    
    alpha = 0.85
    r = list(v)
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
        
    candidates = []
    for i in range(n):
        if i not in seed_indices:
            candidates.append((entities[i], round(r[i], 4)))
            
    candidates.sort(key=lambda x: (-x[1], x[0]))
    return [{"entity": name, "graph_score": sc, "rank": rank} for rank, (name, sc) in enumerate(candidates[:K], 1)]
`,
    editorial: `### Algorithmic Approach

1. Form personalization vector $v$ from seed weights and keep track of seed indices.
2. Run PPR power iteration until $L_1 < 10^{-6}$.
3. Filter out seed indices.
4. Sort candidates by score descending and format output.`,
    hints: [
      'Normalize seed weights into vector v.',
      'Filter out nodes that were in seed_weights.',
      'Sort candidates by score descending, then name ascending.'
    ],
    testCases: [
      {
        inputs: [[[0.0, 1.0], [1.0, 0.0]], ["A", "B"], {"A": 1.0}, 1],
        expected: [{"entity": "B", "graph_score": 0.4633, "rank": 1}]
      }
    ],
    defaultCustomInput: '[[0.0, 1.0], [1.0, 0.0]], ["A", "B"], {"A": 1.0}, 1',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'm8-p4',
    moduleId: 'module-8',
    order: 4,
    title: 'Map Graph Entities to Source Chunks',
    difficulty: 'Medium',
    tags: ['Chunk Mapping', 'Score Aggregation', 'Graph to Document'],
    funcName: 'map_entities_to_chunks',
    description: `Graph retrieval produces scores for **entities**, but the LLM requires raw **text chunks**. We must project entity scores back to source document chunks.

Given:
- \`entity_scores = {entity_name: score, ...}\`.
- An index mapping entities to their source chunks:
  \`entity_to_chunks = {entity_name: [chunk_id_1, chunk_id_2, ...], ...}\`.

Aggregation rules:
1. For each chunk $c$, its raw graph score is the **sum** of scores of all entities mentioned within it:
   $$\\text{score}(c) = \\sum_{e \\in \\text{Entities}(c)} \\text{score}(e)$$
2. Count how many distinct retrieved entities appear in chunk $c$: \`entity_count\`.
3. Apply a bonus multiplier for chunks that contain multiple retrieved entities (co-occurrence reward):
   $$\\text{final\\_score}(c) = \\text{score}(c) \\times (1.0 + 0.1 \\times (\\text{entity\\_count} - 1))$$

Return a list of chunk scores sorted by \`final_score\` descending:
\`[{'chunk_id': str, 'final_score': float, 'entity_count': int}, ...]\`
Round \`final_score\` to 4 decimal places. If tied, sort by \`chunk_id\` ascending.`,
    mathematicalExplanation: `Inverts the provenance bipartite graph $\\mathcal{V} \\times \\mathcal{C}$:
$$s_{\\text{graph}}(c) = \\left( \\sum_{e \\in \\mathcal{E}_c} r(e) \\right) \\cdot \\left(1 + \\gamma (|\\mathcal{E}_c| - 1)\\right)$$
Chunks discussing multiple highly-ranked entities receive super-linear prioritization.`,
    chimeraContext: `Bridges the graph reasoning layer and the text retrieval layer in Chimera.`,
    examples: [
      {
        input: 'entity_scores = {"Attention": 0.4, "Transformer": 0.5}, entity_to_chunks = {"Attention": ["c1", "c2"], "Transformer": ["c1"]}',
        output: '[{"chunk_id": "c1", "final_score": 0.99, "entity_count": 2}, {"chunk_id": "c2", "final_score": 0.4, "entity_count": 1}]',
        explanation: 'c1 contains both Attention (0.4) and Transformer (0.5). Raw sum = 0.9. Bonus = 1.0 + 0.1*(2-1) = 1.1. Final = 0.9 * 1.1 = 0.99.'
      }
    ],
    constraints: [
      '1 <= len(entity_scores) <= 500'
    ],
    expectedComplexity: {
      time: 'O(|entities| \\cdot |chunks| + |chunks| \\log |chunks|)',
      space: 'O(|chunks|)'
    },
    starterCode: `def map_entities_to_chunks(entity_scores: dict[str, float], entity_to_chunks: dict[str, list[str]]) -> list[dict]:
    """
    Aggregates entity scores into chunk scores with multi-entity bonus.
    
    Args:
        entity_scores: {entity: score}
        entity_to_chunks: {entity: [chunk_ids]}
        
    Returns:
        List of {'chunk_id', 'final_score', 'entity_count'} sorted by final_score desc.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def map_entities_to_chunks(entity_scores: dict[str, float], entity_to_chunks: dict[str, list[str]]) -> list[dict]:
    chunk_raw_scores = {}
    chunk_entities = {}
    
    for entity, score in entity_scores.items():
        chunks = entity_to_chunks.get(entity, [])
        for cid in chunks:
            chunk_raw_scores[cid] = chunk_raw_scores.get(cid, 0.0) + score
            if cid not in chunk_entities:
                chunk_entities[cid] = set()
            chunk_entities[cid].add(entity)
            
    results = []
    for cid, raw_score in chunk_raw_scores.items():
        count = len(chunk_entities[cid])
        bonus = 1.0 + 0.1 * (count - 1)
        final_sc = raw_score * bonus
        results.append({
            "chunk_id": cid,
            "final_score": round(final_sc, 4),
            "entity_count": count
        })
        
    results.sort(key=lambda x: (-x["final_score"], x["chunk_id"]))
    return results
`,
    editorial: `### Algorithmic Approach

1. Invert the entity-to-chunk map to calculate raw score sums and track unique entities per chunk.
2. For each chunk, calculate bonus multiplier $1.0 + 0.1 \\times (\\text{count} - 1)$.
3. Compute $\\text{final\\_score} = \\text{raw\\_score} \\times \\text{bonus}$.
4. Sort by final score descending, breaking ties by \`chunk_id\` ascending.`,
    hints: [
      'Use a dictionary chunk_raw_scores to sum entity scores per chunk.',
      'Use a dictionary of sets chunk_entities to track distinct entities per chunk.',
      'Multiply raw_score by (1.0 + 0.1 * (count - 1)).'
    ],
    testCases: [
      {
        inputs: [
          {"Attention": 0.4, "Transformer": 0.5},
          {"Attention": ["c1", "c2"], "Transformer": ["c1"]}
        ],
        expected: [
          {"chunk_id": "c1", "final_score": 0.99, "entity_count": 2},
          {"chunk_id": "c2", "final_score": 0.4, "entity_count": 1}
        ]
      }
    ],
    defaultCustomInput: '{"Attention": 0.4, "Transformer": 0.5}, {"Attention": ["c1", "c2"], "Transformer": ["c1"]}',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm8-p5',
    moduleId: 'module-8',
    order: 5,
    title: 'Implement Reciprocal Rank Fusion (RRF)',
    difficulty: 'Medium',
    tags: ['Reciprocal Rank Fusion', 'Hybrid Search', 'Ranking'],
    funcName: 'reciprocal_rank_fusion',
    description: `Dense vector search and knowledge graph traversal produce scores on entirely different scales:
- Dense cosine similarity $\\in [-1.0, 1.0]$.
- PPR graph scores $\\in [0.0, 1.0]$ (often $\\approx 0.01$).

Directly adding raw scores is biased towards the larger scale. **Reciprocal Rank Fusion (RRF)** combines systems based strictly on their **ranked order**, independent of numerical calibration:
$$\\text{RRF}(d) = \\sum_{m \\in \\text{retrievers}} \\frac{1}{k + \\text{rank}_m(d)}$$
where $\\text{rank}_m(d) \\in [1, |R_m|]$ is the 1-based rank of document $d$ in system $m$, and $k$ is a constant (typically $60$).

Given:
- \`vector_ranked_chunks\`: List of chunk IDs in order of vector similarity (index 0 = rank 1).
- \`graph_ranked_chunks\`: List of chunk IDs in order of graph relevance (index 0 = rank 1).
- Constant $k$ (default 60).

Compute the fused RRF score for all unique chunks.
Return a list of dictionaries sorted by \`rrf_score\` descending:
\`[{'chunk_id': str, 'rrf_score': float, 'rank': int}, ...]\`
Round \`rrf_score\` to 6 decimal places. If tied, sort by \`chunk_id\` ascending.`,
    mathematicalExplanation: `RRF is an unsupervised rank aggregation method robust to scale mismatch and outlier score distortion:
$$\\text{RRF}(d) = \\frac{\\mathbb{I}(d \\in V)}{k + \\text{rank}_V(d)} + \\frac{\\mathbb{I}(d \\in G)}{k + \\text{rank}_G(d)}$$
Documents appearing near the top of both retrievers receive substantial boosts, while items unique to one channel still receive sensible rank-based credit.`,
    chimeraContext: `The core fusion algorithm uniting Chimera\'s dense Qdrant retriever with its Personalized PageRank graph engine.`,
    examples: [
      {
        input: 'vector_ranked_chunks = ["c1", "c2"], graph_ranked_chunks = ["c2", "c3"], k = 60',
        output: '[{"chunk_id": "c2", "rrf_score": 0.032523, "rank": 1}, {"chunk_id": "c1", "rrf_score": 0.016393, "rank": 2}, {"chunk_id": "c3", "rrf_score": 0.016129, "rank": 3}]',
        explanation: 'c2 is rank 2 in vector (1/62 = 0.016129) and rank 1 in graph (1/61 = 0.016393). Total = 0.032523, ranking #1.'
      }
    ],
    constraints: [
      '1 <= len(vector_ranked_chunks), len(graph_ranked_chunks) <= 1000',
      'k >= 1'
    ],
    expectedComplexity: {
      time: 'O(N \\log N)',
      space: 'O(N)'
    },
    starterCode: `def reciprocal_rank_fusion(vector_ranked_chunks: list[str], graph_ranked_chunks: list[str], k: int = 60) -> list[dict]:
    """
    Computes Reciprocal Rank Fusion of vector and graph rankings.
    
    Args:
        vector_ranked_chunks: List of chunk IDs sorted by vector similarity.
        graph_ranked_chunks: List of chunk IDs sorted by graph score.
        k: Smoothing constant (default 60).
        
    Returns:
        List of {'chunk_id', 'rrf_score', 'rank'} sorted by score desc.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def reciprocal_rank_fusion(vector_ranked_chunks: list[str], graph_ranked_chunks: list[str], k: int = 60) -> list[dict]:
    scores = {}
    
    # 1. Vector ranks
    for rank_0, cid in enumerate(vector_ranked_chunks):
        rank = rank_0 + 1
        scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank)
        
    # 2. Graph ranks
    for rank_0, cid in enumerate(graph_ranked_chunks):
        rank = rank_0 + 1
        scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank)
        
    results = [{"chunk_id": cid, "rrf_score": round(sc, 6)} for cid, sc in scores.items()]
    results.sort(key=lambda x: (-x["rrf_score"], x["chunk_id"]))
    
    for r, item in enumerate(results, 1):
        item["rank"] = r
        
    return results
`,
    editorial: `### Algorithmic Approach

1. For each chunk $c$ in \`vector_ranked_chunks\`, add $1 / (k + \\text{rank})$ to its RRF score.
2. For each chunk $c$ in \`graph_ranked_chunks\`, add $1 / (k + \\text{rank})$ to its RRF score.
3. Sort items by \`rrf_score\` descending, breaking ties by \`chunk_id\` ascending.
4. Assign final 1-based ranks.`,
    hints: [
      'Ranks are 1-based: rank = index + 1.',
      'Add 1.0 / (k + rank) for both lists.',
      'Sort by (-rrf_score, chunk_id).'
    ],
    testCases: [
      {
        inputs: [["c1", "c2"], ["c2", "c3"], 60],
        expected: [
          {"chunk_id": "c2", "rrf_score": 0.032523, "rank": 1},
          {"chunk_id": "c1", "rrf_score": 0.016393, "rank": 2},
          {"chunk_id": "c3", "rrf_score": 0.016129, "rank": 3}
        ]
      }
    ],
    defaultCustomInput: '["c1", "c2"], ["c2", "c3"], 60',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm8-p6',
    moduleId: 'module-8',
    order: 6,
    title: 'Weighted Score Fusion vs Reciprocal Rank Fusion',
    difficulty: 'Medium',
    tags: ['Fusion Comparison', 'Min-Max Normalization', 'Hybrid RAG'],
    funcName: 'compare_fusion_methods',
    description: `An alternative to RRF is **Min-Max Score Normalization followed by Weighted Linear Fusion**:
1. Normalize vector scores: $s\'_v(d) = \\frac{s_v(d) - \\min s_v}{\\max s_v - \\min s_v}$ (if max == min, assign 1.0).
2. Normalize graph scores: $s\'_g(d) = \\frac{s_g(d) - \\min s_g}{\\max s_g - \\min s_g}$ (if max == min, assign 1.0).
3. Compute weighted linear score:
   $$\\text{Score}_{\\text{linear}}(d) = w_v \\cdot s\'_v(d) + w_g \\cdot s\'_g(d)$$
   (where chunks missing from a channel get normalized score 0.0).

Given:
- \`vector_scores = {chunk_id: score, ...}\`.
- \`graph_scores = {chunk_id: score, ...}\`.
- Channel weights: $w_v = 0.5, w_g = 0.5$.
- Top budget $K = 2$.

Compute both:
1. Top-$K$ chunk IDs using **Linear Weighted Fusion**.
2. Top-$K$ chunk IDs using **RRF** ($k=60$).

Return a tuple \`(linear_top_k: list[str], rrf_top_k: list[str])\`.`,
    mathematicalExplanation: `Linear score fusion is susceptible to outlier compression: if one document has an anomalously high vector score ($0.99$) while all others cluster at $0.60$, min-max normalization compresses the remaining candidates.
RRF is immune to distribution skew because it depends strictly on ordinal rank.`,
    chimeraContext: `Demonstrates why Chimera adopted RRF over linear score combination to avoid fragile calibration constants.`,
    examples: [
      {
        input: 'vector_scores = {"c1": 0.9, "c2": 0.8}, graph_scores = {"c2": 0.05, "c1": 0.01}, K = 1',
        output: '(["c2"], ["c1"])',
        explanation: 'Linear fusion balances normalized values. RRF evaluates ordinal agreements.'
      }
    ],
    constraints: [
      '1 <= len(vector_scores), len(graph_scores) <= 500'
    ],
    expectedComplexity: {
      time: 'O(N \\log N)',
      space: 'O(N)'
    },
    starterCode: `def compare_fusion_methods(vector_scores: dict[str, float], graph_scores: dict[str, float], K: int = 2) -> tuple[list[str], list[str]]:
    """
    Compares Linear Score Fusion vs RRF on identical candidate sets.
    
    Args:
        vector_scores: {chunk_id: float}
        graph_scores: {chunk_id: float}
        K: Top budget.
        
    Returns:
        (linear_top_k, rrf_top_k)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def compare_fusion_methods(vector_scores: dict[str, float], graph_scores: dict[str, float], K: int = 2) -> tuple[list[str], list[str]]:
    all_chunks = sorted(list(set(vector_scores.keys()) | set(graph_scores.keys())))
    
    # 1. Linear Min-Max Normalization
    v_vals = list(vector_scores.values())
    min_v, max_v = min(v_vals), max(v_vals)
    range_v = max_v - min_v
    
    g_vals = list(graph_scores.values())
    min_g, max_g = min(g_vals), max(g_vals)
    range_g = max_g - min_g
    
    linear_scored = []
    for cid in all_chunks:
        if cid in vector_scores:
            norm_v = (vector_scores[cid] - min_v) / range_v if range_v > 0 else 1.0
        else:
            norm_v = 0.0
            
        if cid in graph_scores:
            norm_g = (graph_scores[cid] - min_g) / range_g if range_g > 0 else 1.0
        else:
            norm_g = 0.0
            
        sc = 0.5 * norm_v + 0.5 * norm_g
        linear_scored.append((cid, sc))
        
    linear_scored.sort(key=lambda x: (-x[1], x[0]))
    linear_top = [cid for cid, _ in linear_scored[:K]]
    
    # 2. RRF
    v_sorted = sorted(vector_scores.items(), key=lambda x: (-x[1], x[0]))
    g_sorted = sorted(graph_scores.items(), key=lambda x: (-x[1], x[0]))
    
    rrf_scores = {}
    for rank, (cid, _) in enumerate(v_sorted, 1):
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (60 + rank)
    for rank, (cid, _) in enumerate(g_sorted, 1):
        rrf_scores[cid] = rrf_scores.get(cid, 0.0) + 1.0 / (60 + rank)
        
    rrf_list = list(rrf_scores.items())
    rrf_list.sort(key=lambda x: (-x[1], x[0]))
    rrf_top = [cid for cid, _ in rrf_list[:K]]
    
    return linear_top, rrf_top
`,
    editorial: `### Algorithmic Approach

1. **Linear Min-Max:** Compute $\\min$ and $\\max$ for each channel. Normalize each score to $[0, 1]$. Chunks missing from a channel get $0.0$. Average normalized scores and pick top $K$.
2. **RRF:** Sort vector chunks by score desc to get rank $1 \\dots N_v$. Sort graph chunks by score desc to get rank $1 \\dots N_g$. Sum $1 / (60 + \\text{rank})$ and pick top $K$.
3. Return both top-$K$ lists.`,
    hints: [
      'Min-max formula: (val - min) / (max - min).',
      'For RRF, sort each channel to assign 1-based ranks.',
      'Sum 1.0 / (60 + rank) for RRF.'
    ],
    testCases: [
      {
        inputs: [{"c1": 0.9, "c2": 0.8}, {"c2": 0.05, "c1": 0.01}, 1],
        expected: [["c2"], ["c1"]]
      }
    ],
    defaultCustomInput: '{"c1": 0.9, "c2": 0.8}, {"c2": 0.05, "c1": 0.01}, 1',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm8-p7',
    moduleId: 'module-8',
    order: 7,
    title: 'Deduplicate and Re-Rank Retrieved Chunks',
    difficulty: 'Medium',
    tags: ['Deduplication', 'Re-Ranking', 'Context Diversity'],
    funcName: 'deduplicate_and_rerank',
    description: `Multimodal ingestion often extracts near-duplicate passages (e.g. caption of a figure repeating the adjacent paragraph).
To prevent wasting LLM context tokens on redundant information, Chimera uses **Maximal Marginal Relevance (MMR)** or greedy threshold deduplication.

Given:
- A ranked list of candidate chunks with embeddings:
  \`chunks = [{'chunk_id': str, 'score': float, 'embedding': list[float]}, ...]\`
- Maximum pairwise redundancy threshold \`sim_threshold = 0.80\`.
- Budget $K$.

Greedy Selection Algorithm:
1. Sort \`chunks\` by \`score\` descending.
2. Initialize an empty selected list \`selected\`.
3. For each candidate chunk:
   - Check its cosine similarity against all **already selected** chunks.
   - If its cosine similarity with **any** selected chunk is $\\ge \\text{sim\\_threshold}$, discard it as redundant.
   - Otherwise, append it to \`selected\`.
   - Stop when \`len(selected) == K\`.

Return the list of selected \`chunk_id\` strings.`,
    mathematicalExplanation: `Diversity-aware subset selection maximizing information novelty:
$$c^* = \\arg\\max_{c \\in \\mathcal{C} \\setminus S} \\left[ \\text{score}(c) - \\lambda \\max_{s \\in S} \\cos(c, s) \\right]$$
Guarantees high relevance while strictly prohibiting semantic duplication in the prompt context.`,
    chimeraContext: `Preserves context diversity across text, table, and audio transcript modalities in Chimera.`,
    examples: [
      {
        input: 'chunks = [{"chunk_id": "c1", "score": 0.95, "embedding": [1.0, 0.0]}, {"chunk_id": "c2", "score": 0.90, "embedding": [0.99, 0.01]}, {"chunk_id": "c3", "score": 0.80, "embedding": [0.0, 1.0]}], sim_threshold = 0.85, K = 2',
        output: '["c1", "c3"]',
        explanation: 'c1 is selected first. c2 has cosine similarity > 0.99 with c1 (>= 0.85) and is discarded. c3 is orthogonal to c1 and is selected.'
      }
    ],
    constraints: [
      '1 <= len(chunks) <= 500'
    ],
    expectedComplexity: {
      time: 'O(K \\cdot N \\cdot d)',
      space: 'O(N)'
    },
    starterCode: `def deduplicate_and_rerank(chunks: list[dict], sim_threshold: float = 0.80, K: int = 5) -> list[str]:
    """
    Selects top-K diverse chunks using greedy cosine threshold deduplication.
    
    Args:
        chunks: [{'chunk_id', 'score', 'embedding'}, ...]
        sim_threshold: Redundancy threshold.
        K: Target count.
        
    Returns:
        List of selected chunk_ids.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def deduplicate_and_rerank(chunks: list[dict], sim_threshold: float = 0.80, K: int = 5) -> list[str]:
    import math
    
    # Sort by score desc, chunk_id asc
    sorted_chunks = sorted(chunks, key=lambda x: (-x["score"], x["chunk_id"]))
    
    selected_cids = []
    selected_embs = []
    
    def cosine_sim(v1, v2):
        dot = sum(x * y for x, y in zip(v1, v2))
        n1 = math.sqrt(sum(x * x for x in v1))
        n2 = math.sqrt(sum(y * y for y in v2))
        return dot / (n1 * n2) if n1 > 0 and n2 > 0 else 0.0

    for item in sorted_chunks:
        emb = item["embedding"]
        is_redundant = False
        for s_emb in selected_embs:
            if cosine_sim(emb, s_emb) >= sim_threshold:
                is_redundant = True
                break
        if not is_redundant:
            selected_cids.append(item["chunk_id"])
            selected_embs.append(emb)
            if len(selected_cids) == K:
                break
                
    return selected_cids
`,
    editorial: `### Algorithmic Approach

1. Sort candidate chunks by score descending.
2. Maintain \`selected_cids\` and \`selected_embs\`.
3. For each candidate, compare against all vectors in \`selected_embs\`.
4. If similarity $< \\text{sim\\_threshold}$ against all existing members, accept the chunk.
5. Stop when $K$ items are selected.`,
    hints: [
      'Sort candidates by score descending first.',
      'Check cosine similarity against already selected chunks.',
      'If any similarity >= sim_threshold, skip candidate.'
    ],
    testCases: [
      {
        inputs: [
          [
            {"chunk_id": "c1", "score": 0.95, "embedding": [1.0, 0.0]},
            {"chunk_id": "c2", "score": 0.90, "embedding": [0.99, 0.01]},
            {"chunk_id": "c3", "score": 0.80, "embedding": [0.0, 1.0]}
          ],
          0.85,
          2
        ],
        expected: ["c1", "c3"]
      }
    ],
    defaultCustomInput: '[{"chunk_id": "c1", "score": 0.95, "embedding": [1.0, 0.0]}, {"chunk_id": "c2", "score": 0.90, "embedding": [0.99, 0.01]}], 0.85, 2',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm8-p8',
    moduleId: 'module-8',
    order: 8,
    title: 'Complete Hybrid Retrieval Pipeline',
    difficulty: 'Hard',
    tags: ['Hybrid RAG', 'Pipeline Integration', 'Chimera Architecture'],
    funcName: 'hybrid_retrieval_pipeline',
    description: `Construct the complete **Dual-Channel Hybrid Retrieval Pipeline** of Chimera:

Input:
- \`query_emb\`: Dense query embedding vector.
- \`seed_entities\`: List of extracted seed entity names.
- \`chunks\`: List of chunks with text and embeddings: \`[{'chunk_id': str, 'text': str, 'embedding': list[float]}, ...]\`.
- \`graph_triples\`: Labeled triples: \`[[head, relation, tail, weight], ...]\`.
- \`entity_to_chunks\`: Map of entity name to chunk IDs.
- \`K\`: Final retrieval budget (e.g. 3).

Execution Pipeline:
1. **Channel 1 (Dense Vector):** Compute cosine similarity between \`query_emb\` and all chunks. Rank chunks to get \`vector_ranked_cids\`.
2. **Channel 2 (Graph PPR):**
   - Extract unique entities from \`graph_triples\`. Build adjacency matrix and row-normalize into $P$.
   - Form uniform seed vector $v$ over \`seed_entities\`.
   - Run PPR ($\\alpha=0.85$) to obtain entity scores.
   - Map entity scores to chunk IDs (sum scores per chunk).
   - Rank chunks by aggregated graph score to get \`graph_ranked_cids\`.
3. **Reciprocal Rank Fusion:** Combine \`vector_ranked_cids\` and \`graph_ranked_cids\` using RRF with $k=60$.
4. Return the top-$K$ fused chunks as a list of dictionaries:
\`[{'chunk_id': str, 'rrf_score': float, 'rank': int}, ...]\``,
    mathematicalExplanation: `Dual-channel hybrid architecture:
$$\\mathcal{R}(q) = \\text{RRF}_{k=60} \\Big( \\text{DenseRank}(q, \\mathcal{C}), \\; \\text{EntityToChunk}\\big( \\text{PPR}(G, v_q) \\big) \\Big)$$`,
    chimeraContext: `The core hybrid retrieval engine of the Chimera project, integrating both modalities seamlessly.`,
    examples: [
      {
        input: 'K = 2',
        output: '[{"chunk_id": "c1", ...}, {"chunk_id": "c2", ...}]',
        explanation: 'Fuses vector candidates and graph PPR candidates into top-K unified context chunks.'
      }
    ],
    constraints: [
      '1 <= len(chunks) <= 500',
      'K >= 1'
    ],
    expectedComplexity: {
      time: 'O(|chunks| \\cdot d + T \\cdot n^2 + N \\log N)',
      space: 'O(|chunks| + n^2)'
    },
    starterCode: `def hybrid_retrieval_pipeline(query_emb: list[float], seed_entities: list[str], chunks: list[dict], graph_triples: list[list[any]], entity_to_chunks: dict[str, list[str]], K: int = 3) -> list[dict]:
    """
    Executes Chimera's dual-channel hybrid retrieval pipeline.
    
    Args:
        query_emb: Query embedding.
        seed_entities: Query seed names.
        chunks: List of chunk dicts.
        graph_triples: Triples [h, r, t, w].
        entity_to_chunks: Entity to chunk map.
        K: Top chunks count.
        
    Returns:
        List of {'chunk_id', 'rrf_score', 'rank'}.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def hybrid_retrieval_pipeline(query_emb: list[float], seed_entities: list[str], chunks: list[dict], graph_triples: list[list[any]], entity_to_chunks: dict[str, list[str]], K: int = 3) -> list[dict]:
    import math
    
    # 1. Vector Channel
    norm_q = math.sqrt(sum(x * x for x in query_emb))
    v_scored = []
    for c in chunks:
        emb = c["embedding"]
        dot = sum(x * y for x, y in zip(query_emb, emb))
        norm_e = math.sqrt(sum(y * y for y in emb))
        sim = dot / (norm_q * norm_e) if norm_q > 0 and norm_e > 0 else 0.0
        v_scored.append((c["chunk_id"], sim))
        
    v_scored.sort(key=lambda x: (-x[1], x[0]))
    vector_ranked = [cid for cid, _ in v_scored]
    
    # 2. Graph Channel
    all_entities = sorted(list(set([t[0] for t in graph_triples] + [t[2] for t in graph_triples])))
    n = len(all_entities)
    e_to_idx = {name: i for i, name in enumerate(all_entities)}
    
    adj = [[0.0 for _ in range(n)] for _ in range(n)]
    for t in graph_triples:
        u = e_to_idx[t[0]]
        v = e_to_idx[t[2]]
        w = float(t[3])
        adj[u][v] += w
        
    P = []
    for i in range(n):
        s = sum(adj[i])
        if s > 0:
            P.append([adj[i][j] / s for j in range(n)])
        else:
            P.append([1.0 / n for _ in range(n)])
            
    v_ppr = [0.0] * n
    for s_name in seed_entities:
        if s_name in e_to_idx:
            v_ppr[e_to_idx[s_name]] = 1.0
    tot_s = sum(v_ppr)
    v_ppr = [x / tot_s for x in v_ppr] if tot_s > 0 else [1.0 / n] * n
    
    alpha = 0.85
    r = list(v_ppr)
    for _ in range(100):
        r_next = [0.0] * n
        for i in range(n):
            if r[i] > 0:
                for j in range(n):
                    r_next[j] += r[i] * P[i][j]
        r_next = [alpha * r_next[j] + (1.0 - alpha) * v_ppr[j] for j in range(n)]
        if sum(abs(r_next[j] - r[j]) for j in range(n)) < 1e-6:
            r = r_next
            break
        r = r_next
        
    entity_scores = {all_entities[i]: r[i] for i in range(n)}
    
    # Map to chunks
    chunk_graph_scores = {}
    for e_name, score in entity_scores.items():
        for cid in entity_to_chunks.get(e_name, []):
            chunk_graph_scores[cid] = chunk_graph_scores.get(cid, 0.0) + score
            
    g_sorted = sorted(chunk_graph_scores.items(), key=lambda x: (-x[1], x[0]))
    graph_ranked = [cid for cid, _ in g_sorted]
    
    # 3. RRF Fusion
    rrf = {}
    for rank, cid in enumerate(vector_ranked, 1):
        rrf[cid] = rrf.get(cid, 0.0) + 1.0 / (60 + rank)
    for rank, cid in enumerate(graph_ranked, 1):
        rrf[cid] = rrf.get(cid, 0.0) + 1.0 / (60 + rank)
        
    fused = [{"chunk_id": cid, "rrf_score": round(sc, 6)} for cid, sc in rrf.items()]
    fused.sort(key=lambda x: (-x["rrf_score"], x["chunk_id"]))
    
    for r_idx, item in enumerate(fused, 1):
        item["rank"] = r_idx
        
    return fused[:K]
`,
    editorial: `### Algorithmic Approach

1. Compute vector cosine similarities and sort chunks to get \`vector_ranked\`.
2. Extract all entities, build row-normalized matrix $P$, run PPR from seed entities.
3. Sum entity scores per chunk and sort to get \`graph_ranked\`.
4. Run Reciprocal Rank Fusion ($k=60$) combining both rank lists.
5. Slice and return top $K$.`,
    hints: [
      'Implement vector search first.',
      'Implement graph PPR and map scores to chunks.',
      'Combine both ranked lists using 1.0 / (60 + rank).'
    ],
    testCases: [
      {
        inputs: [
          [1.0, 0.0],
          ["NVIDIA"],
          [
            {"chunk_id": "c1", "text": "NVIDIA GPU", "embedding": [0.9, 0.1]},
            {"chunk_id": "c2", "text": "CUDA Code", "embedding": [0.1, 0.9]}
          ],
          [["NVIDIA", "MANUFACTURES", "GPU", 1.0]],
          {"NVIDIA": ["c1"], "GPU": ["c1", "c2"]},
          2
        ],
        expected: [
          {"chunk_id": "c1", "rrf_score": 0.032523, "rank": 1},
          {"chunk_id": "c2", "rrf_score": 0.032002, "rank": 2}
        ]
      }
    ],
    defaultCustomInput: '[1.0, 0.0], ["NVIDIA"], [{"chunk_id": "c1", "text": "A", "embedding": [1.0, 0.0]}], [["NVIDIA", "R", "GPU", 1.0]], {"NVIDIA": ["c1"]}, 1',
    suggestedVisualizer: 'hybrid-comparator'
  }
];
