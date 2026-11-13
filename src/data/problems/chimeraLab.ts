import { Problem } from '../../types/problem';

export const CHIMERA_LAB_PROBLEMS: Problem[] = [
  {
    id: 'chimera-p1',
    moduleId: 'module-chimera-lab',
    order: 1,
    title: 'Multimodal Ingestion & Chunk Metadata Parsing',
    difficulty: 'Easy',
    tags: ['Chimera Lab', 'Multimodal Ingestion', 'PDF & Audio Parsing'],
    funcName: 'parse_multimodal_document',
    description: `The first step in Chimera is ingesting diverse multimodal sources: PDF text pages, extracted figure images, and Whisper audio lecture transcripts.

Given a raw list of multimodal document chunks:
\`raw_chunks = [{'id': str, 'type': str, 'content': str, 'metadata': dict}, ...]\`
where \`type\` is one of \`'text'\`, \`'image_caption'\`, or \`'audio_transcript'\`.

Parse and clean each chunk into standardized format:
1. Clean text: strip whitespace and collapse multiple internal spaces into a single space.
2. Add a unique chunk index \`idx\` starting at 0.
3. Compute approximate token count: \`token_count = len(content.split())\`.
4. Validate metadata: ensure keys \`'source_doc'\` and \`'modality'\` exist; if missing, assign default \`'unknown'\` and \`chunk['type']\`.

Return the list of standardized chunks:
\`[{'chunk_id': str, 'cleaned_content': str, 'modality': str, 'source_doc': str, 'token_count': int}, ...]\``,
    mathematicalExplanation: `Multimodal corpus standardization:
$$\\mathcal{C} = \\bigcup_{m \\in \\{\\text{text, img, audio}\\}} \\text{Standardize}(\\mathcal{D}_m)$$`,
    chimeraContext: `Chimera Ingestion Stage: normalizes inputs from PDF extraction, image OCR, and audio transcription before entity recognition.`,
    examples: [
      {
        input: 'raw_chunks = [{"id": "c1", "type": "text", "content": "  Attention   mechanisms  in Transformers. ", "metadata": {"source_doc": "paper.pdf"}}]',
        output: '[{"chunk_id": "c1", "cleaned_content": "Attention mechanisms in Transformers.", "modality": "text", "source_doc": "paper.pdf", "token_count": 4}]',
        explanation: 'Spaces collapsed, token count is 4.'
      }
    ],
    constraints: ['1 <= len(raw_chunks) <= 500'],
    expectedComplexity: {'time': 'O(N)', 'space': 'O(N)'},
    starterCode: `def parse_multimodal_document(raw_chunks: list[dict]) -> list[dict]:
    """
    Standardizes multimodal chunks from PDF, images, and audio.
    
    Args:
        raw_chunks: List of raw chunk dicts.
        
    Returns:
        List of standardized chunk dicts.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def parse_multimodal_document(raw_chunks: list[dict]) -> list[dict]:
    standardized = []
    for c in raw_chunks:
        cid = c["id"]
        mod = c["type"]
        meta = c.get("metadata", {})
        cleaned = " ".join(c.get("content", "").split())
        tokens = len(cleaned.split())
        s_doc = meta.get("source_doc", "unknown")
        standardized.append({
            "chunk_id": cid,
            "cleaned_content": cleaned,
            "modality": mod,
            "source_doc": s_doc,
            "token_count": tokens
        })
    return standardized
`,
    editorial: `### Algorithmic Approach
1. Collapse whitespace using \`" ".join(c['content'].split())\`.
2. Extract source metadata.
3. Compute token count and format standardized dictionary.`,
    hints: ['Use " ".join(content.split()) to clean whitespace.'],
    testCases: [
      {
        inputs: [[{"id": "c1", "type": "text", "content": "  Attention   mechanisms  in Transformers. ", "metadata": {"source_doc": "paper.pdf"}}]],
        expected: [{"chunk_id": "c1", "cleaned_content": "Attention mechanisms in Transformers.", "modality": "text", "source_doc": "paper.pdf", "token_count": 4}]
      }
    ],
    defaultCustomInput: '[{"id": "c1", "type": "text", "content": "Attention in Transformers", "metadata": {}}]',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'chimera-p2',
    moduleId: 'module-chimera-lab',
    order: 2,
    title: 'Extract Seed Entities from User Query',
    difficulty: 'Easy',
    tags: ['Chimera Lab', 'Query Analysis', 'Seed Extraction'],
    funcName: 'extract_query_seeds',
    description: `Given a user query string \`query\` and a known knowledge base dictionary of canonical entities:
\`known_entities = {'canonical_name': [alias_1, alias_2, ...], ...}\`

Identify all seed entities mentioned in the query:
1. Search case-insensitively for matches against canonical names or their aliases.
2. If an alias matches, map it back to the canonical entity name.
3. Compute a seed weight for each detected entity:
   - Base weight: $1.0$.
   - If the exact canonical name matched (not just an alias), increase weight to $1.5$.
4. Return a dictionary of detected seed entities and their weights:
\`{canonical_entity: weight, ...}\``,
    mathematicalExplanation: `Query seed grounding:
$$S_q = \\{ e \\in \\mathcal{V} \\mid \\text{Mention}(e, q) \\}$$`,
    chimeraContext: `Identifies the entry points in Chimera\'s knowledge graph from which Personalized PageRank begins propagation.`,
    examples: [
      {
        input: 'query = "How does NVIDIA manufacture GPUs?", known_entities = {"NVIDIA": ["Nvidia", "NVDA"], "GPU": ["Graphics Card"]}',
        output: '{"NVIDIA": 1.5, "GPU": 1.5}',
        explanation: 'Both canonical names appear directly in query, receiving weight 1.5.'
      }
    ],
    constraints: ['1 <= len(query) <= 300'],
    expectedComplexity: {'time': 'O(|entities| \\cdot |query|)', 'space': 'O(|S|)'},
    starterCode: `def extract_query_seeds(query: str, known_entities: dict[str, list[str]]) -> dict[str, float]:
    """
    Extracts seed entities from query string matching canonical or aliases.
    
    Args:
        query: User prompt.
        known_entities: {canonical_name: [aliases]}
        
    Returns:
        {canonical_name: weight}
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def extract_query_seeds(query: str, known_entities: dict[str, list[str]]) -> dict[str, float]:
    import re
    q_lower = query.lower()
    seeds = {}
    
    for canon, aliases in known_entities.items():
        # Check canonical first
        pattern_canon = r'\b' + re.escape(canon.lower()) + r'\b'
        if re.search(pattern_canon, q_lower):
            seeds[canon] = 1.5
            continue
            
        # Check aliases
        for al in aliases:
            pattern_al = r'\b' + re.escape(al.lower()) + r'\b'
            if re.search(pattern_al, q_lower):
                seeds[canon] = 1.0
                break
                
    return seeds
`,
    editorial: `### Algorithmic Approach
1. Lowercase query.
2. Match canonical name using word boundaries \`\\b\\b\`. If matched, weight = 1.5.
3. Else match aliases. If matched, weight = 1.0.
4. Return seed dictionary.`,
    hints: ['Use regex with word boundaries r"\\b" to prevent substring false matches.'],
    testCases: [
      {
        inputs: [
          "How does NVIDIA manufacture GPUs?",
          {"NVIDIA": ["Nvidia", "NVDA"], "GPU": ["Graphics Card"]}
        ],
        expected: {"NVIDIA": 1.5, "GPU": 1.5}
      }
    ],
    defaultCustomInput: '"How does NVIDIA manufacture GPUs?", {"NVIDIA": ["NVDA"], "GPU": ["Graphics Card"]}',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'chimera-p3',
    moduleId: 'module-chimera-lab',
    order: 3,
    title: 'Construct Knowledge Graph with Modality Provenance',
    difficulty: 'Medium',
    tags: ['Chimera Lab', 'Graph Construction', 'Multi-Relational'],
    funcName: 'build_chimera_graph',
    description: `Construct Chimera\'s unified multi-relational knowledge graph from multimodal extractions.

Given:
- \`triples = [{'head': str, 'relation': str, 'tail': str, 'confidence': float, 'chunk_id': str, 'modality': str}, ...]\`

Requirements:
1. Build an adjacency matrix over all unique entities (sorted alphabetically).
2. For each directed edge $(u, v)$:
   - Sum confidence weights for composite edge weight.
   - Collect unique chunk IDs into a sorted list.
   - Collect unique modalities into a sorted list.
3. Compute node in-degrees and out-degrees.

Return:
\`{ 'nodes': sorted_entities, 'out_degrees': list[float], 'in_degrees': list[float], 'edge_count': int, 'edges': [{'source': str, 'target': str, 'weight': float, 'chunk_ids': list[str], 'modalities': list[str]}, ...] }\`
Round weights and degrees to 4 decimal places. Sort edges by source, then target.`,
    mathematicalExplanation: `$$\\mathcal{G} = (\\mathcal{V}, \\mathcal{E}, W, \\Pi)$$`,
    chimeraContext: `Constructs the unified knowledge graph layer in Chimera with full source chunk provenance.`,
    examples: [
      {
        input: 'triples = [{"head": "NVIDIA", "relation": "DEVELOPS", "tail": "CUDA", "confidence": 0.9, "chunk_id": "c1", "modality": "text"}]',
        output: '{"nodes": ["CUDA", "NVIDIA"], "edge_count": 1, ...}',
        explanation: 'Constructs directed edge NVIDIA -> CUDA with weight 0.9.'
      }
    ],
    constraints: ['1 <= len(triples) <= 1000'],
    expectedComplexity: {'time': 'O(|triples| \\log |V|)', 'space': 'O(|V| + |E|)'},
    starterCode: `def build_chimera_graph(triples: list[dict]) -> dict:
    """
    Constructs unified knowledge graph with modality provenance.
    
    Args:
        triples: List of extracted triple dicts.
        
    Returns:
        Graph summary dict.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def build_chimera_graph(triples: list[dict]) -> dict:
    nodes_set = set()
    edge_map = {}
    
    for t in triples:
        u = t["head"]
        v = t["tail"]
        w = float(t.get("confidence", 1.0))
        cid = t["chunk_id"]
        mod = t["modality"]
        
        nodes_set.add(u)
        nodes_set.add(v)
        
        pair = (u, v)
        if pair not in edge_map:
            edge_map[pair] = {
                "weight": 0.0,
                "chunks": set(),
                "mods": set()
            }
        edge_map[pair]["weight"] += w
        edge_map[pair]["chunks"].add(cid)
        edge_map[pair]["mods"].add(mod)
        
    sorted_nodes = sorted(list(nodes_set))
    n = len(sorted_nodes)
    node_to_idx = {name: i for i, name in enumerate(sorted_nodes)}
    
    out_deg = [0.0] * n
    in_deg = [0.0] * n
    edges_list = []
    
    for (u, v), data in edge_map.items():
        w = round(data["weight"], 4)
        u_idx = node_to_idx[u]
        v_idx = node_to_idx[v]
        out_deg[u_idx] += w
        in_deg[v_idx] += w
        edges_list.append({
            "source": u,
            "target": v,
            "weight": w,
            "chunk_ids": sorted(list(data["chunks"])),
            "modalities": sorted(list(data["mods"]))
        })
        
    edges_list.sort(key=lambda e: (e["source"], e["target"]))
    return {
        "nodes": sorted_nodes,
        "out_degrees": [round(x, 4) for x in out_deg],
        "in_degrees": [round(x, 4) for x in in_deg],
        "edge_count": len(edges_list),
        "edges": edges_list
    }
`,
    editorial: `### Algorithmic Approach
1. Collect unique nodes and aggregate edge weights, chunks, and modalities.
2. Compute in and out degrees.
3. Sort nodes and edges for deterministic output.`,
    hints: ['Use sets to deduplicate chunk IDs and modalities.'],
    testCases: [
      {
        inputs: [[{"head": "NVIDIA", "relation": "DEVELOPS", "tail": "CUDA", "confidence": 0.9, "chunk_id": "c1", "modality": "text"}]],
        expected: {
          "nodes": ["CUDA", "NVIDIA"],
          "out_degrees": [0.0, 0.9],
          "in_degrees": [0.9, 0.0],
          "edge_count": 1,
          "edges": [{"source": "NVIDIA", "target": "CUDA", "weight": 0.9, "chunk_ids": ["c1"], "modalities": ["text"]}]
        }
      }
    ],
    defaultCustomInput: '[{"head": "NVIDIA", "relation": "DEVELOPS", "tail": "CUDA", "confidence": 0.9, "chunk_id": "c1", "modality": "text"}]',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'chimera-p4',
    moduleId: 'module-chimera-lab',
    order: 4,
    title: 'Reverse-Edge Augmented Personalized PageRank',
    difficulty: 'Medium',
    tags: ['Chimera Lab', 'Bidirectional PPR', 'Graph Retrieval'],
    funcName: 'run_chimera_ppr',
    description: `Execute Chimera\'s bidirectional Personalized PageRank over the knowledge graph.

Given:
- \`num_nodes\`: Total nodes $n$.
- \`edges = [[u, v, weight], ...]\`.
- \`seed_weights = {node_id: weight, ...}\`.
- Reverse attenuation factor $\\beta = 0.3$.
- Damping factor $\\alpha = 0.85$.

Algorithm:
1. Build bidirectional matrix: $W_{\\text{bi}}[u][v] = W[u][v] + \\beta W[v][u]$.
2. Row-normalize into transition matrix $P_{\\text{bi}}$.
3. Normalize seed weights into vector $v$ (handle dangling nodes by recycling to $v$).
4. Run power iteration until $L_1 < 10^{-6}$.
5. Return the PPR scores list rounded to 4 decimal places.`,
    mathematicalExplanation: `$$r = \\alpha r P_{\\text{bi}} + (1 - \\alpha) v$$`,
    chimeraContext: `The core graph retrieval execution step in Chimera.`,
    examples: [
      {
        input: 'num_nodes = 2, edges = [[0, 1, 1.0]], seed_weights = {0: 1.0}, beta = 0.3',
        output: '[0.5813, 0.4187]',
        explanation: 'Seed at 0 propagates to 1 with reverse feedback.'
      }
    ],
    constraints: ['2 <= num_nodes <= 100'],
    expectedComplexity: {'time': 'O(T \\cdot n^2)', 'space': 'O(n^2)'},
    starterCode: `def run_chimera_ppr(num_nodes: int, edges: list[list[float]], seed_weights: dict[int, float], beta: float = 0.3, alpha: float = 0.85) -> list[float]:
    """
    Runs bidirectional PPR with sink recycling.
    
    Args:
        num_nodes: Total nodes.
        edges: List of [u, v, w].
        seed_weights: {node_id: weight}.
        beta: Reverse attenuation.
        alpha: Damping factor.
        
    Returns:
        Converged PPR vector.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def run_chimera_ppr(num_nodes: int, edges: list[list[float]], seed_weights: dict[int, float], beta: float = 0.3, alpha: float = 0.85) -> list[float]:
    n = num_nodes
    W = [[0.0 for _ in range(n)] for _ in range(n)]
    for u, v, w in edges:
        W[int(u)][int(v)] += float(w)
        
    W_bi = [[W[i][j] + beta * W[j][i] for j in range(n)] for i in range(n)]
    row_sums = [sum(W_bi[i]) for i in range(n)]
    sinks = [i for i in range(n) if row_sums[i] == 0]
    
    P = [[W_bi[i][j] / row_sums[i] if row_sums[i] > 0 else 0.0 for j in range(n)] for i in range(n)]
    
    v = [0.0] * n
    for node, w in seed_weights.items():
        if 0 <= node < n and w > 0:
            v[node] += w
    tot_w = sum(v)
    v = [x / tot_w for x in v] if tot_w > 0 else [1.0 / n] * n
    
    r = list(v)
    for _ in range(200):
        r_next = [0.0] * n
        for i in range(n):
            if r[i] > 0 and i not in sinks:
                for j in range(n):
                    r_next[j] += r[i] * P[i][j]
                    
        sink_mass = sum(r[i] for i in sinks)
        teleport = alpha * sink_mass + (1.0 - alpha)
        for j in range(n):
            r_next[j] = alpha * r_next[j] + teleport * v[j]
            
        if sum(abs(r_next[j] - r[j]) for j in range(n)) < 1e-6:
            r = r_next
            break
        r = r_next
        
    return [round(x, 4) for x in r]
`,
    editorial: `### Algorithmic Approach
1. Build bidirectional matrix $W + \\beta W^T$.
2. Normalize row sums.
3. Power iteration with sink mass returned to $v$.
4. Return rounded result.`,
    hints: ['W_bi[i][j] = W[i][j] + beta * W[j][i].'],
    testCases: [
      {
        inputs: [2, [[0, 1, 1.0]], {0: 1.0}, 0.3, 0.85],
        expected: [0.5813, 0.4187]
      }
    ],
    defaultCustomInput: '2, [[0, 1, 1.0]], {0: 1.0}, 0.3, 0.85',
    suggestedVisualizer: 'ppr-propagator'
  },
  {
    id: 'chimera-p5',
    moduleId: 'module-chimera-lab',
    order: 5,
    title: 'Dual-Channel Fusion (Qdrant Dense + PPR Graph)',
    difficulty: 'Medium',
    tags: ['Chimera Lab', 'Dual Channel', 'RRF Fusion'],
    funcName: 'fuse_dense_and_ppr',
    description: `Implement the dual-channel candidate fusion step in Chimera:
1. Receive \`dense_ranked_chunks\`: List of chunk IDs ranked by Qdrant vector similarity.
2. Receive \`ppr_ranked_chunks\`: List of chunk IDs ranked by aggregated PPR graph scores.
3. Combine using Reciprocal Rank Fusion:
   $$\\text{RRF}(c) = \\frac{1}{60 + \\text{rank}_{\\text{dense}}(c)} + \\frac{1}{60 + \\text{rank}_{\\text{ppr}}(c)}$$
4. Return the top-$K$ candidates as \`[{'chunk_id': str, 'rrf_score': float, 'rank': int}, ...]\`.`,
    mathematicalExplanation: `$$\\mathcal{C}^* = \\text{TopK}\\left(\\text{RRF}_{60}(R_{\\text{Qdrant}}, R_{\\text{PPR}})\\right)$$`,
    chimeraContext: `Combines vector semantics with graph topological reachability in Chimera.`,
    examples: [
      {
        input: 'dense_ranked_chunks = ["c1", "c2"], ppr_ranked_chunks = ["c2", "c3"], K = 2',
        output: '[{"chunk_id": "c2", "rrf_score": 0.032523, "rank": 1}, {"chunk_id": "c1", "rrf_score": 0.016393, "rank": 2}]',
        explanation: 'c2 appears in both channels, dominating the top rank.'
      }
    ],
    constraints: ['K >= 1'],
    expectedComplexity: {'time': 'O(N \\log N)', 'space': 'O(N)'},
    starterCode: `def fuse_dense_and_ppr(dense_ranked_chunks: list[str], ppr_ranked_chunks: list[str], K: int = 5) -> list[dict]:
    """
    Fuses dense vector and PPR graph ranked chunks using RRF.
    
    Args:
        dense_ranked_chunks: Vector rankings.
        ppr_ranked_chunks: Graph rankings.
        K: Top budget.
        
    Returns:
        Top-K fused chunks.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def fuse_dense_and_ppr(dense_ranked_chunks: list[str], ppr_ranked_chunks: list[str], K: int = 5) -> list[dict]:
    rrf = {}
    for r, cid in enumerate(dense_ranked_chunks, 1):
        rrf[cid] = rrf.get(cid, 0.0) + 1.0 / (60 + r)
    for r, cid in enumerate(ppr_ranked_chunks, 1):
        rrf[cid] = rrf.get(cid, 0.0) + 1.0 / (60 + r)
        
    scored = [{"chunk_id": cid, "rrf_score": round(sc, 6)} for cid, sc in rrf.items()]
    scored.sort(key=lambda x: (-x["rrf_score"], x["chunk_id"]))
    
    for rank, item in enumerate(scored, 1):
        item["rank"] = rank
        
    return scored[:K]
`,
    editorial: `### Algorithmic Approach
1. Compute RRF on both rankings.
2. Sort by score desc, chunk_id asc.
3. Return top K.`,
    hints: ['Use 1.0 / (60 + rank).'],
    testCases: [
      {
        inputs: [["c1", "c2"], ["c2", "c3"], 2],
        expected: [
          {"chunk_id": "c2", "rrf_score": 0.032523, "rank": 1},
          {"chunk_id": "c1", "rrf_score": 0.016393, "rank": 2}
        ]
      }
    ],
    defaultCustomInput: '["c1", "c2"], ["c2", "c3"], 2',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'chimera-p6',
    moduleId: 'module-chimera-lab',
    order: 6,
    title: 'Self-Correcting Context Grader',
    difficulty: 'Easy',
    tags: ['Chimera Lab', 'CRAG', 'Context Verification'],
    funcName: 'grade_retrieved_context',
    description: `Evaluate retrieved chunks before generation:
Given:
- \`query\`: User query.
- \`chunks = [{'chunk_id': str, 'text': str, 'similarity': float}, ...]\`
- \`required_terms = [str, ...]\`

1. Grade each chunk:
   - Keyword ratio: fraction of \`required_terms\` present in \`chunk['text']\` (case-insensitive).
   - Score: $0.6 \\times \\text{similarity} + 0.4 \\times \\text{keyword\\_ratio}$.
   - Pass: if score $\\ge 0.65$.
2. Filter: keep only passing chunks.
3. If no chunks pass: return \`{'status': 'RETRY', 'passing_chunks': []}\`.
4. If at least 1 chunk passes: return \`{'status': 'PROCEED', 'passing_chunks': [chunk_id, ...]}\`.`,
    mathematicalExplanation: `Context gatekeeper preventing hallucination from noisy multimodal extractions.`,
    chimeraContext: `Relevance evaluation node in Chimera LangGraph controller.`,
    examples: [
      {
        input: 'query = "CUDA", chunks = [{"chunk_id": "c1", "text": "CUDA by NVIDIA", "similarity": 0.8}], required_terms = ["cuda"]',
        output: '{"status": "PROCEED", "passing_chunks": ["c1"]}',
        explanation: 'Score = 0.6*0.8 + 0.4*1.0 = 0.88 >= 0.65. Passes.'
      }
    ],
    constraints: ['len(chunks) >= 0'],
    expectedComplexity: {'time': 'O(N)', 'space': 'O(N)'},
    starterCode: `def grade_retrieved_context(query: str, chunks: list[dict], required_terms: list[str]) -> dict:
    """
    Filters chunks by relevance score and determines whether to proceed or retry.
    
    Args:
        query: Query string.
        chunks: List of chunk dicts.
        required_terms: Terms that should appear.
        
    Returns:
        {'status': 'PROCEED'|'RETRY', 'passing_chunks': list[str]}
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def grade_retrieved_context(query: str, chunks: list[dict], required_terms: list[str]) -> dict:
    passing = []
    for c in chunks:
        text = c["text"].lower()
        sim = float(c.get("similarity", 0.0))
        if required_terms:
            hits = sum(1 for kw in required_terms if kw.lower() in text)
            ratio = hits / len(required_terms)
        else:
            ratio = 1.0
        score = 0.6 * sim + 0.4 * ratio
        if score >= 0.65:
            passing.append(c["chunk_id"])
            
    if passing:
        return {"status": "PROCEED", "passing_chunks": passing}
    return {"status": "RETRY", "passing_chunks": []}
`,
    editorial: `### Algorithmic Approach
1. Compute score for each chunk.
2. Collect chunk IDs where score >= 0.65.
3. Return status PROCEED if passing list non-empty, else RETRY.`,
    hints: ['Check if passing list is empty.'],
    testCases: [
      {
        inputs: ["CUDA", [{"chunk_id": "c1", "text": "CUDA by NVIDIA", "similarity": 0.8}], ["cuda"]],
        expected: {"status": "PROCEED", "passing_chunks": ["c1"]}
      }
    ],
    defaultCustomInput: '"CUDA", [{"chunk_id": "c1", "text": "CUDA by NVIDIA", "similarity": 0.8}], ["cuda"]',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'chimera-p7',
    moduleId: 'module-chimera-lab',
    order: 7,
    title: 'Adaptive Query Rewriter for Graph Expansion',
    difficulty: 'Easy',
    tags: ['Chimera Lab', 'Query Reformulation', 'Graph Expansion'],
    funcName: 'adaptive_query_rewriter',
    description: `When context grading returns \`"RETRY"\`, Chimera rewrites the query using graph context:
1. Extract top 2 most prominent 1-hop neighbors of the query seed from the knowledge graph.
2. Append these neighbors to the query string: \`"{query} {neighbor1} {neighbor2}"\`.
3. Increment revision count.

Return the rewritten query string.`,
    mathematicalExplanation: `$$q^{(t+1)} = q^{(t)} \\cup \\text{Top2}(\\mathcal{N}_1(S_q))$$`,
    chimeraContext: `Query expansion node in Chimera\'s self-correcting loop.`,
    examples: [
      {
        input: 'query = "Transformer", neighbors = ["Attention", "Self-Attention", "RNN"]',
        output: '"Transformer Attention Self-Attention"',
        explanation: 'Appends top 2 neighbors.'
      }
    ],
    constraints: ['len(query) >= 1'],
    expectedComplexity: {'time': 'O(1)', 'space': 'O(1)'},
    starterCode: `def adaptive_query_rewriter(query: str, neighbors: list[str]) -> str:
    """
    Expands failed query with top-2 1-hop graph neighbors.
    
    Args:
        query: Query string.
        neighbors: Candidate neighbors.
        
    Returns:
        Expanded query.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def adaptive_query_rewriter(query: str, neighbors: list[str]) -> str:
    top2 = neighbors[:2]
    parts = [query.strip()] + top2
    return " ".join(" ".join(parts).split())
`,
    editorial: `### Algorithmic Approach
1. Take up to 2 items from neighbors.
2. Join with original query and normalize whitespace.`,
    hints: ['Slice neighbors[:2].'],
    testCases: [
      {
        inputs: ["Transformer", ["Attention", "Self-Attention", "RNN"]],
        expected: "Transformer Attention Self-Attention"
      }
    ],
    defaultCustomInput: '"Transformer", ["Attention", "Self-Attention"]',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'chimera-p8',
    moduleId: 'module-chimera-lab',
    order: 8,
    title: 'Multi-Modal Evidence Assembler & Context Prompt Builder',
    difficulty: 'Medium',
    tags: ['Chimera Lab', 'Prompt Engineering', 'Evidence Assembly'],
    funcName: 'assemble_chimera_context',
    description: `Once chunks pass verification, assemble the final context prompt:
Given:
- \`passing_chunks = [{'chunk_id': str, 'text': str, 'modality': str, 'source_doc': str}, ...]\`
- \`graph_subgraph_edges = [{'source': str, 'relation': str, 'target': str}, ...]\`

Format context string:
1. Section \`"=== KNOWLEDGE GRAPH RELATIONSHIPS ===\\n"\`:
   Each edge on its own line: \`- (source) -[relation]-> (target)\\n\`
2. Section \`"=== MULTIMODAL CONTEXT PASSAGES ===\\n"\`:
   Each passage formatted as:
   \`[source_doc | modality | chunk_id]\\ntext\\n\\n\`

Return the complete formatted context string.`,
    mathematicalExplanation: `Structured prompt synthesis fusing topological relational graphs with raw grounded citations.`,
    chimeraContext: `The final synthesis step before passing prompt to LLM generation in Chimera.`,
    examples: [
      {
        input: 'passing_chunks = [{"chunk_id": "c1", "text": "CUDA is fast", "modality": "text", "source_doc": "doc.pdf"}], graph_subgraph_edges = [{"source": "NVIDIA", "relation": "DEVELOPS", "target": "CUDA"}]',
        output: '"=== KNOWLEDGE GRAPH RELATIONSHIPS ===\\n- (NVIDIA) -[DEVELOPS]-> (CUDA)\\n\\n=== MULTIMODAL CONTEXT PASSAGES ===\\n[doc.pdf | text | c1]\\nCUDA is fast\\n"',
        explanation: 'Formatted prompt context.'
      }
    ],
    constraints: ['len(passing_chunks) >= 0'],
    expectedComplexity: {'time': 'O(|chunks| + |edges|)', 'space': 'O(prompt)'},
    starterCode: `def assemble_chimera_context(passing_chunks: list[dict], graph_subgraph_edges: list[dict]) -> str:
    """
    Assembles structured prompt combining graph triples and multimodal passages.
    
    Args:
        passing_chunks: Verified chunks.
        graph_subgraph_edges: Subgraph triples.
        
    Returns:
        Formatted context string.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def assemble_chimera_context(passing_chunks: list[dict], graph_subgraph_edges: list[dict]) -> str:
    lines = ["=== KNOWLEDGE GRAPH RELATIONSHIPS ==="]
    for e in graph_subgraph_edges:
        lines.append(f"- ({e['source']}) -[{e['relation']}]-> ({e['target']})")
        
    lines.append("\n=== MULTIMODAL CONTEXT PASSAGES ===")
    for c in passing_chunks:
        header = f"[{c['source_doc']} | {c['modality']} | {c['chunk_id']}]"
        lines.append(f"{header}\n{c['text']}\n")
        
    return "\n".join(lines).strip() + "\n"
`,
    editorial: `### Algorithmic Approach
1. Format graph relationships header and lines.
2. Format passages header and citation blocks.
3. Join and return.`,
    hints: ['Format each edge as - (source) -[relation]-> (target).'],
    testCases: [
      {
        inputs: [
          [{"chunk_id": "c1", "text": "CUDA is fast", "modality": "text", "source_doc": "doc.pdf"}],
          [{"source": "NVIDIA", "relation": "DEVELOPS", "target": "CUDA"}]
        ],
        expected: "=== KNOWLEDGE GRAPH RELATIONSHIPS ===\n- (NVIDIA) -[DEVELOPS]-> (CUDA)\n\n=== MULTIMODAL CONTEXT PASSAGES ===\n[doc.pdf | text | c1]\nCUDA is fast\n"
      }
    ],
    defaultCustomInput: '[{"chunk_id": "c1", "text": "CUDA", "modality": "text", "source_doc": "doc.pdf"}], [{"source": "A", "relation": "R", "target": "B"}]',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'chimera-p9',
    moduleId: 'module-chimera-lab',
    order: 9,
    title: 'LangGraph Self-Correcting Orchestrator State Machine',
    difficulty: 'Hard',
    tags: ['Chimera Lab', 'LangGraph', 'State Machine'],
    funcName: 'chimera_langgraph_orchestrator',
    description: `Construct the complete **LangGraph Self-Correcting State Machine** for Chimera:

State object:
\`state = {'query': str, 'attempt': int, 'max_attempts': int, 'history': list[str], 'retrieved_chunks': list[str], 'status': str}\`

Node actions:
1. \`retrieve\`: Retrieves chunks based on query.
2. \`grade\`:
   - If query contains \`"ambiguous"\` and attempt < max_attempts: grade is \`"RETRY"\`.
   - Else: grade is \`"SUCCESS"\`.
3. \`rewrite\`: Replaces \`"ambiguous"\` with \`"specific"\` and increments \`attempt\`.
4. \`generate\`: Sets \`status = 'COMPLETED'\`.

Conditional routing:
- From \`grade\`:
  - If \`grade == "SUCCESS"\` $\\to$ route to \`generate\`.
  - Else if \`attempt < max_attempts\` $\\to$ route to \`rewrite\` $\\to$ \`retrieve\`.
  - Else $\\to$ route to \`generate\` (forced fallback).

Return the final state dictionary.`,
    mathematicalExplanation: `Full agentic state transition loop executing conditional correction.`,
    chimeraContext: `The master LangGraph controller governing Chimera runtime.`,
    examples: [
      {
        input: 'initial_state = {"query": "ambiguous concept", "attempt": 1, "max_attempts": 2, "history": [], "retrieved_chunks": [], "status": "START"}',
        output: '{"query": "specific concept", "attempt": 2, "status": "COMPLETED", ...}',
        explanation: 'Detects ambiguous query, executes rewrite, retries, and completes on attempt 2.'
      }
    ],
    constraints: ['max_attempts >= 1'],
    expectedComplexity: {'time': 'O(T)', 'space': 'O(1)'},
    starterCode: `def chimera_langgraph_orchestrator(state: dict) -> dict:
    """
    Executes Chimera LangGraph state machine with self-correcting loop.
    
    Args:
        state: Initial state dict.
        
    Returns:
        Terminal state dict.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def chimera_langgraph_orchestrator(state: dict) -> dict:
    s = dict(state)
    curr_node = "retrieve"
    
    while curr_node != "END" and s["attempt"] <= s["max_attempts"] + 1:
        if curr_node == "retrieve":
            s["retrieved_chunks"] = [f"chunk_for_{s['query']}"]
            s["history"].append(f"retrieve:{s['query']}")
            curr_node = "grade"
            
        elif curr_node == "grade":
            is_ambig = "ambiguous" in s["query"]
            s["history"].append("grade")
            if not is_ambig:
                curr_node = "generate"
            elif s["attempt"] < s["max_attempts"]:
                curr_node = "rewrite"
            else:
                curr_node = "generate"
                
        elif curr_node == "rewrite":
            s["attempt"] += 1
            s["query"] = s["query"].replace("ambiguous", "specific")
            s["history"].append(f"rewrite:attempt_{s['attempt']}")
            curr_node = "retrieve"
            
        elif curr_node == "generate":
            s["status"] = "COMPLETED"
            s["history"].append("generate")
            curr_node = "END"
            
    return s
`,
    editorial: `### Algorithmic Approach
1. Step through nodes based on state conditions.
2. On ambiguous query, branch to rewrite if attempts remain.
3. Transition to generate and terminate at END.`,
    hints: ['Check if "ambiguous" in query to trigger rewrite.'],
    testCases: [
      {
        inputs: [{"query": "ambiguous concept", "attempt": 1, "max_attempts": 2, "history": [], "retrieved_chunks": [], "status": "START"}],
        expected: {
          "query": "specific concept",
          "attempt": 2,
          "max_attempts": 2,
          "history": ["retrieve:ambiguous concept", "grade", "rewrite:attempt_2", "retrieve:specific concept", "grade", "generate"],
          "retrieved_chunks": ["chunk_for_specific concept"],
          "status": "COMPLETED"
        }
      }
    ],
    defaultCustomInput: '{"query": "ambiguous concept", "attempt": 1, "max_attempts": 2, "history": [], "retrieved_chunks": [], "status": "START"}',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'chimera-p10',
    moduleId: 'module-chimera-lab',
    order: 10,
    title: 'The Complete Chimera Pipeline: End-to-End Execution & Evaluation',
    difficulty: 'Hard',
    tags: ['Chimera Lab', 'Capstone Challenge', 'End-to-End Pipeline'],
    funcName: 'run_complete_chimera_pipeline',
    description: `**The Grand Capstone Challenge!**
Implement the entire Chimera Cross-Modal Knowledge Graph RAG with Self-Correcting Retrieval pipeline from scratch in a single unified function:

Input:
- \`query\`: User question string (e.g. *"What hardware executes CUDA?"*).
- \`chunks\`: Multimodal chunks \`[{'chunk_id': str, 'text': str, 'embedding': list[float]}, ...]\`.
- \`query_emb\`: Dense embedding vector of the query.
- \`triples\`: Extracted knowledge triples \`[[head, relation, tail, weight], ...]\`.
- \`entity_to_chunks\`: Map of entity name to chunk IDs.
- \`known_entities\`: Canonical entity lookup dictionary: \`{canon_name: [aliases], ...}\`.

Workflow:
1. **Query Seed Extraction:** Match \`query\` against \`known_entities\` to extract seed names and initial weights.
2. **Channel 1 (Dense Vector Retrieval):** Compute cosine similarity of \`query_emb\` with each chunk embedding to obtain \`vector_ranked_cids\`.
3. **Channel 2 (Reverse-Augmented PPR Graph Retrieval):**
   - Build bidirectional graph ($W + 0.3 W^T$) over unique entities.
   - Run PPR with restart vector $v$ over detected seeds.
   - Project entity scores to chunk IDs to obtain \`graph_ranked_cids\`.
4. **Reciprocal Rank Fusion:** Fuse vector and graph rankings ($k=60$) to obtain top-3 fused chunk IDs.
5. **Relevance Grading & Verification:**
   - Check if top chunk has vector similarity $\\ge 0.50$ or contains at least one detected query seed entity.
   - If verified: \`status = "VERIFIED"\`.
   - If unverified: \`status = "CORRECTED"\` (trigger fallback top chunk).

Return:
\`{ 'detected_seeds': list[str], 'top_chunks': list[str], 'retrieval_status': str, 'primary_evidence_chunk': str }\``,
    mathematicalExplanation: `$$\\text{Chimera}(q, \\mathcal{C}, \\mathcal{G}) = \\text{Verify}\\left( \\text{RRF}\\Big( \\text{Dense}(q, \\mathcal{C}), \\; \\text{PPR}(G_{\\text{bi}}, v_q) \\Big) \\right)$$`,
    chimeraContext: `The ultimate capstone implementation of the entire M.Tech research project.`,
    examples: [
      {
        input: 'End-to-end evaluation scenario',
        output: '{"detected_seeds": ["CUDA"], "top_chunks": ["c1", "c2"], "retrieval_status": "VERIFIED", "primary_evidence_chunk": "c1"}',
        explanation: 'Executes seed extraction, dual-channel search, RRF fusion, and verification.'
      }
    ],
    constraints: ['1 <= len(chunks) <= 100', '1 <= len(triples) <= 100'],
    expectedComplexity: {'time': 'O(|chunks| \\cdot d + T \\cdot n^2)', 'space': 'O(|chunks| + n^2)'},
    starterCode: `def run_complete_chimera_pipeline(query: str, chunks: list[dict], query_emb: list[float], triples: list[list[any]], entity_to_chunks: dict[str, list[str]], known_entities: dict[str, list[str]]) -> dict:
    """
    Executes complete end-to-end Chimera Cross-Modal KG RAG pipeline.
    
    Args:
        query: User question.
        chunks: List of chunk dicts.
        query_emb: Query embedding vector.
        triples: [[h, r, t, w], ...]
        entity_to_chunks: {entity: [chunk_ids]}
        known_entities: {canon: [aliases]}
        
    Returns:
        Summary dict of complete retrieval execution.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def run_complete_chimera_pipeline(query: str, chunks: list[dict], query_emb: list[float], triples: list[list[any]], entity_to_chunks: dict[str, list[str]], known_entities: dict[str, list[str]]) -> dict:
    import math
    import re
    
    # 1. Seed extraction
    q_lower = query.lower()
    seeds = []
    for canon, aliases in known_entities.items():
        if re.search(r'\b' + re.escape(canon.lower()) + r'\b', q_lower):
            seeds.append(canon)
        else:
            for al in aliases:
                if re.search(r'\b' + re.escape(al.lower()) + r'\b', q_lower):
                    seeds.append(canon)
                    break
    seeds = sorted(list(set(seeds)))
    
    # 2. Vector Channel
    norm_q = math.sqrt(sum(x * x for x in query_emb))
    v_scores = []
    chunk_sim_map = {}
    for c in chunks:
        emb = c["embedding"]
        dot = sum(x * y for x, y in zip(query_emb, emb))
        norm_e = math.sqrt(sum(y * y for y in emb))
        sim = dot / (norm_q * norm_e) if norm_q > 0 and norm_e > 0 else 0.0
        v_scores.append((c["chunk_id"], sim))
        chunk_sim_map[c["chunk_id"]] = sim
    v_scores.sort(key=lambda x: (-x[1], x[0]))
    v_ranked = [cid for cid, _ in v_scores]
    
    # 3. Graph Channel (Bidirectional PPR)
    all_entities = sorted(list(set([t[0] for t in triples] + [t[2] for t in triples])))
    n = len(all_entities)
    e_to_idx = {name: i for i, name in enumerate(all_entities)}
    
    W = [[0.0 for _ in range(n)] for _ in range(n)]
    for t in triples:
        W[e_to_idx[t[0]]][e_to_idx[t[2]]] += float(t[3])
        
    beta = 0.3
    W_bi = [[W[i][j] + beta * W[j][i] for j in range(n)] for i in range(n)]
    row_sums = [sum(W_bi[i]) for i in range(n)]
    sinks = [i for i in range(n) if row_sums[i] == 0]
    P = [[W_bi[i][j] / row_sums[i] if row_sums[i] > 0 else 0.0 for j in range(n)] for i in range(n)]
    
    v_vec = [0.0] * n
    for s in seeds:
        if s in e_to_idx:
            v_vec[e_to_idx[s]] = 1.0
    tot_s = sum(v_vec)
    v_vec = [x / tot_s for x in v_vec] if tot_s > 0 else [1.0 / n] * n
    
    alpha = 0.85
    r = list(v_vec)
    for _ in range(100):
        r_next = [0.0] * n
        for i in range(n):
            if r[i] > 0 and i not in sinks:
                for j in range(n):
                    r_next[j] += r[i] * P[i][j]
        sink_mass = sum(r[i] for i in sinks)
        teleport = alpha * sink_mass + (1.0 - alpha)
        for j in range(n):
            r_next[j] = alpha * r_next[j] + teleport * v_vec[j]
        if sum(abs(r_next[j] - r[j]) for j in range(n)) < 1e-6:
            r = r_next
            break
        r = r_next
        
    g_chunk_scores = {}
    for i, e_name in enumerate(all_entities):
        sc = r[i]
        for cid in entity_to_chunks.get(e_name, []):
            g_chunk_scores[cid] = g_chunk_scores.get(cid, 0.0) + sc
            
    g_sorted = sorted(g_chunk_scores.items(), key=lambda x: (-x[1], x[0]))
    g_ranked = [cid for cid, _ in g_sorted]
    
    # 4. RRF
    rrf = {}
    for rank, cid in enumerate(v_ranked, 1):
        rrf[cid] = rrf.get(cid, 0.0) + 1.0 / (60 + rank)
    for rank, cid in enumerate(g_ranked, 1):
        rrf[cid] = rrf.get(cid, 0.0) + 1.0 / (60 + rank)
        
    fused = sorted(rrf.items(), key=lambda x: (-x[1], x[0]))
    top_cids = [cid for cid, _ in fused[:3]]
    
    primary = top_cids[0] if top_cids else ""
    is_verified = False
    if primary:
        sim = chunk_sim_map.get(primary, 0.0)
        c_text = next((c["text"].lower() for c in chunks if c["chunk_id"] == primary), "")
        has_seed = any(s.lower() in c_text for s in seeds)
        if sim >= 0.50 or has_seed:
            is_verified = True
            
    return {
        "detected_seeds": seeds,
        "top_chunks": top_cids,
        "retrieval_status": "VERIFIED" if is_verified else "CORRECTED",
        "primary_evidence_chunk": primary
    }
`,
    editorial: `### Algorithmic Approach
1. Extract seeds via regex word boundaries.
2. Vector channel: cosine similarity ranking.
3. Graph channel: bidirectional PPR with sink mass recycling, then mapped to chunks.
4. RRF rank fusion of both channels.
5. Verification logic on top retrieved chunk.`,
    hints: ['Follow the 5-step workflow in order.'],
    testCases: [
      {
        inputs: [
          "What hardware executes CUDA?",
          [
            {"chunk_id": "c1", "text": "NVIDIA GPUs execute CUDA parallel code.", "embedding": [0.9, 0.1]},
            {"chunk_id": "c2", "text": "Python script compiler.", "embedding": [0.1, 0.9]}
          ],
          [0.85, 0.15],
          [["CUDA", "EXECUTED_BY", "GPU", 1.0], ["NVIDIA", "MANUFACTURES", "GPU", 1.0]],
          {"CUDA": ["c1"], "GPU": ["c1"], "NVIDIA": ["c1"]},
          {"CUDA": [], "GPU": ["Graphics Card"], "NVIDIA": []}
        ],
        expected: {
          "detected_seeds": ["CUDA", "GPU"],
          "top_chunks": ["c1", "c2"],
          "retrieval_status": "VERIFIED",
          "primary_evidence_chunk": "c1"
        }
      }
    ],
    defaultCustomInput: '"CUDA hardware", [{"chunk_id": "c1", "text": "CUDA on GPU", "embedding": [1.0, 0.0]}], [1.0, 0.0], [["CUDA", "RUNS_ON", "GPU", 1.0]], {"CUDA": ["c1"]}, {"CUDA": []}',
    suggestedVisualizer: 'hybrid-comparator'
  }
];
