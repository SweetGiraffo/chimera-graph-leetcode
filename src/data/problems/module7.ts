import { Problem } from '../../types/problem';

export const MODULE_7_PROBLEMS: Problem[] = [
  {
    id: 'm7-p1',
    moduleId: 'module-7',
    order: 1,
    title: 'Convert Extracted Triples into a NetworkX DiGraph',
    difficulty: 'Easy',
    tags: ['NetworkX', 'Knowledge Graph', 'Graph Construction'],
    funcName: 'triples_to_networkx',
    description: `Given a list of extracted knowledge triples:
\`triples = [{'head': str, 'relation': str, 'tail': str, 'weight': float}, ...]\`

Construct a directed graph using \`networkx.DiGraph\`:
1. Add nodes for all unique \`head\` and \`tail\` entities.
2. For each triple, add a directed edge from \`head\` to \`tail\`.
3. If an edge already exists from \`head\` to \`tail\`:
   - Sum their weights together: \`edge_weight += triple['weight']\`.
   - Append the new relation to a list of relations stored in edge attribute \`'relations'\`.
4. If it is a new edge, initialize \`'weight' = triple['weight']\` and \`'relations' = [triple['relation']]\`.

Return a dictionary describing the graph:
\`{ 'num_nodes': int, 'num_edges': int, 'nodes': sorted_list_of_nodes, 'edges': [{'source': str, 'target': str, 'weight': float, 'relations': list[str]}, ...] }\`
Sort edges by source ascending, then target ascending. Round edge weights to 4 decimal places.`,
    mathematicalExplanation: `A multi-relational directed knowledge graph $\\mathcal{G} = (\\mathcal{V}, \\mathcal{E}, \\mathcal{R})$ maps relation edges into multigraph space.
Aggregating multiple predicates between $(u, v)$ collapses parallel multigraph edges into a single weighted composite edge:
$$W(u, v) = \\sum_{r \\in \\mathcal{R}(u, v)} w_{u, v, r}$$`,
    chimeraContext: `The primary ingestion step in Chimera\'s graph pipeline, converting raw multimodal LLM extractions into a queryable NetworkX structure.`,
    examples: [
      {
        input: 'triples = [{"head": "NVIDIA", "relation": "MANUFACTURES", "tail": "GPU", "weight": 0.9}, {"head": "NVIDIA", "relation": "DESIGNS", "tail": "GPU", "weight": 0.8}]',
        output: '{"num_nodes": 2, "num_edges": 1, "nodes": ["GPU", "NVIDIA"], "edges": [{"source": "NVIDIA", "target": "GPU", "weight": 1.7, "relations": ["MANUFACTURES", "DESIGNS"]}]}',
        explanation: 'The two relations between NVIDIA and GPU are combined into a single edge with weight 1.7.'
      }
    ],
    constraints: [
      '1 <= len(triples) <= 1000'
    ],
    expectedComplexity: {
      time: 'O(|triples| + |V| \\log |V|)',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def triples_to_networkx(triples: list[dict]) -> dict:
    """
    Constructs a NetworkX DiGraph from triples and returns summary dict.
    
    Args:
        triples: [{'head': str, 'relation': str, 'tail': str, 'weight': float}, ...]
        
    Returns:
        Summary dict with num_nodes, num_edges, nodes, and edges.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def triples_to_networkx(triples: list[dict]) -> dict:
    import networkx as nx
    G = nx.DiGraph()
    
    for t in triples:
        u = t["head"]
        v = t["tail"]
        r = t["relation"]
        w = float(t.get("weight", 1.0))
        
        if G.has_edge(u, v):
            G[u][v]["weight"] += w
            G[u][v]["relations"].append(r)
        else:
            G.add_edge(u, v, weight=w, relations=[r])
            
    nodes = sorted(list(G.nodes()))
    edges_list = []
    for u, v, data in G.edges(data=True):
        edges_list.append({
            "source": u,
            "target": v,
            "weight": round(data["weight"], 4),
            "relations": data["relations"]
        })
        
    edges_list.sort(key=lambda e: (e["source"], e["target"]))
    return {
        "num_nodes": G.number_of_nodes(),
        "num_edges": G.number_of_edges(),
        "nodes": nodes,
        "edges": edges_list
    }
`,
    editorial: `### Algorithmic Approach

1. Instantiate \`nx.DiGraph()\`.
2. For each triple, check if edge $(u, v)$ already exists.
3. If yes, add weight and append relation name to \`G[u][v]['relations']\`.
4. If no, create edge with \`weight=w\` and \`relations=[r]\`.
5. Extract sorted nodes and formatted sorted edge list.`,
    hints: [
      'Use G.has_edge(u, v) to check if the edge already exists.',
      'Accumulate weight with G[u][v]["weight"] += w.',
      'Sort nodes and edges for deterministic output.'
    ],
    testCases: [
      {
        inputs: [[
          {"head": "NVIDIA", "relation": "MANUFACTURES", "tail": "GPU", "weight": 0.9},
          {"head": "NVIDIA", "relation": "DESIGNS", "tail": "GPU", "weight": 0.8}
        ]],
        expected: {
          "num_nodes": 2,
          "num_edges": 1,
          "nodes": ["GPU", "NVIDIA"],
          "edges": [
            {"source": "NVIDIA", "target": "GPU", "weight": 1.7, "relations": ["MANUFACTURES", "DESIGNS"]}
          ]
        }
      }
    ],
    defaultCustomInput: '[{"head": "NVIDIA", "relation": "MANUFACTURES", "tail": "GPU", "weight": 0.9}]',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm7-p2',
    moduleId: 'module-7',
    order: 2,
    title: 'Merge Duplicate Entities with Synset Linking',
    difficulty: 'Medium',
    tags: ['Graph Merging', 'Synset Linking', 'NetworkX'],
    funcName: 'merge_graph_synsets',
    description: `Given a graph of directed weighted edges:
\`edges = [{'source': str, 'target': str, 'weight': float}, ...]\`
and an alias mapping dictionary:
\`synset_map = {'alias': 'canonical_name', ...}\` (e.g. \`{'Nvidia': 'NVIDIA', 'Nvidia Corp': 'NVIDIA'}\`):

1. Replace every occurrence of an entity name with its canonical form if it exists in \`synset_map\`.
2. Collapse merged edges: if multiple edges now share the same canonical $(u, v)$, sum their weights.
3. Discard self-loops formed by merging (i.e. edges where $u == v$ after mapping).

Return the merged list of edges sorted by source ascending, then target ascending:
\`[{'source': str, 'target': str, 'weight': float}, ...]\`
Round weights to 4 decimal places.`,
    mathematicalExplanation: `Graph quotient operation $\\mathcal{G} / \\sim$ under the equivalence relation defined by synsets:
$$W(C_A, C_B) = \\sum_{u \\in C_A, v \\in C_B, u \\neq v} W(u, v)$$
where $C_A, C_B$ are equivalence classes of merged entity vertices.`,
    chimeraContext: `Prevents duplicate knowledge graph clusters from splitting random-walk probability mass between identical concepts like "Attention" and "Self-Attention Mechanism".`,
    examples: [
      {
        input: 'edges = [{"source": "Nvidia", "target": "GPU", "weight": 1.0}, {"source": "Nvidia Corp", "target": "GPU", "weight": 2.0}], synset_map = {"Nvidia": "NVIDIA", "Nvidia Corp": "NVIDIA"}',
        output: '[{"source": "NVIDIA", "target": "GPU", "weight": 3.0}]',
        explanation: 'Both edges map to NVIDIA -> GPU, so weights 1.0 + 2.0 sum to 3.0.'
      }
    ],
    constraints: [
      '1 <= len(edges) <= 1000'
    ],
    expectedComplexity: {
      time: 'O(|edges| \\log |edges|)',
      space: 'O(|edges|)'
    },
    starterCode: `def merge_graph_synsets(edges: list[dict], synset_map: dict[str, str]) -> list[dict]:
    """
    Merges duplicate entity nodes in graph edges according to synset_map.
    
    Args:
        edges: [{'source': str, 'target': str, 'weight': float}, ...]
        synset_map: {alias: canonical_name, ...}
        
    Returns:
        Consolidated edge list sorted by source, then target.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def merge_graph_synsets(edges: list[dict], synset_map: dict[str, str]) -> list[dict]:
    merged_weights = {}
    
    for e in edges:
        u = synset_map.get(e["source"], e["source"])
        v = synset_map.get(e["target"], e["target"])
        w = float(e.get("weight", 1.0))
        
        # Discard self-loops
        if u == v:
            continue
            
        pair = (u, v)
        merged_weights[pair] = merged_weights.get(pair, 0.0) + w
        
    results = []
    for (u, v), w in merged_weights.items():
        results.append({
            "source": u,
            "target": v,
            "weight": round(w, 4)
        })
        
    results.sort(key=lambda x: (x["source"], x["target"]))
    return results
`,
    editorial: `### Algorithmic Approach

1. For each edge, look up canonical source $u$ and canonical target $v$ in \`synset_map\`.
2. Skip if $u == v$ (self-loop created by synonym merge).
3. Accumulate weight in a dictionary keyed by tuple $(u, v)$.
4. Format output dictionaries and sort by source, then target.`,
    hints: [
      'Use synset_map.get(node, node) to map names to canonical forms.',
      'Check if u == v to discard self-loops.',
      'Use a dictionary with (u, v) keys to sum edge weights.'
    ],
    testCases: [
      {
        inputs: [
          [
            {"source": "Nvidia", "target": "GPU", "weight": 1.0},
            {"source": "Nvidia Corp", "target": "GPU", "weight": 2.0}
          ],
          {"Nvidia": "NVIDIA", "Nvidia Corp": "NVIDIA"}
        ],
        expected: [
          {"source": "NVIDIA", "target": "GPU", "weight": 3.0}
        ]
      },
      {
        inputs: [
          [{"source": "A", "target": "B", "weight": 1.0}],
          {"B": "A"}
        ],
        expected: []
      }
    ],
    defaultCustomInput: '[{"source": "Nvidia", "target": "GPU", "weight": 1.0}], {"Nvidia": "NVIDIA"}',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm7-p3',
    moduleId: 'module-7',
    order: 3,
    title: 'Update Node Metadata with Source Chunk Tracking',
    difficulty: 'Easy',
    tags: ['Node Attributes', 'Provenance Tracking', 'Metadata'],
    funcName: 'update_node_metadata',
    description: `Each entity in Chimera\'s knowledge graph tracks rich provenance metadata:
- \`mention_count\`: Total occurrences of the entity.
- \`source_chunks\`: Set/list of unique text/audio/image chunk IDs where the entity was extracted.
- \`modalities\`: Set/list of unique modalities (\`"text"\`, \`"image"\`, \`"audio"\`).

Given an existing dictionary of entity metadata:
\`graph_nodes = { entity_name: {'mention_count': int, 'source_chunks': list[str], 'modalities': list[str]}, ... }\`
and a batch of new extractions:
\`new_mentions = [{'entity': str, 'chunk_id': str, 'modality': str}, ...]\`

Update the metadata for each entity:
1. Increment \`mention_count\` by 1 for each appearance.
2. Add new \`chunk_id\` to \`source_chunks\` (ensure uniqueness, sorted alphabetically).
3. Add new \`modality\` to \`modalities\` (ensure uniqueness, sorted alphabetically).
4. If an entity is new, initialize it with \`mention_count = 1\`, \`source_chunks = [chunk_id]\`, \`modalities = [modality]\`.

Return the updated \`graph_nodes\` dictionary.`,
    mathematicalExplanation: `Provenance mapping $\\Pi: \\mathcal{V} \\to \\mathcal{P}(\\mathcal{C}) \\times \\mathcal{P}(\\mathcal{M})$ links conceptual nodes back to raw multimodal evidence chunks, supporting grounded citation verification.`,
    chimeraContext: `Enables Chimera to cite specific page numbers, audio timestamps, and figure numbers when an entity is retrieved.`,
    examples: [
      {
        input: 'graph_nodes = {"GPU": {"mention_count": 1, "source_chunks": ["doc1_c1"], "modalities": ["text"]}}, new_mentions = [{"entity": "GPU", "chunk_id": "fig_img3", "modality": "image"}]',
        output: '{"GPU": {"mention_count": 2, "source_chunks": ["doc1_c1", "fig_img3"], "modalities": ["image", "text"]}}',
        explanation: 'Mention count increases to 2, fig_img3 added to chunks, image added to modalities.'
      }
    ],
    constraints: [
      '1 <= len(new_mentions) <= 500'
    ],
    expectedComplexity: {
      time: 'O(|mentions| \\log |chunks|)',
      space: 'O(|V|)'
    },
    starterCode: `def update_node_metadata(graph_nodes: dict, new_mentions: list[dict]) -> dict:
    """
    Updates entity node metadata with new mentions, chunk IDs, and modalities.
    
    Args:
        graph_nodes: {entity: {mention_count, source_chunks, modalities}}
        new_mentions: [{'entity', 'chunk_id', 'modality'}, ...]
        
    Returns:
        Updated graph_nodes dictionary.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def update_node_metadata(graph_nodes: dict, new_mentions: list[dict]) -> dict:
    # Deep copy / working structures
    nodes = {}
    for k, v in graph_nodes.items():
        nodes[k] = {
            "mention_count": v["mention_count"],
            "source_chunks": set(v["source_chunks"]),
            "modalities": set(v["modalities"])
        }
        
    for m in new_mentions:
        name = m["entity"]
        cid = m["chunk_id"]
        mod = m["modality"]
        
        if name not in nodes:
            nodes[name] = {
                "mention_count": 1,
                "source_chunks": set([cid]),
                "modalities": set([mod])
            }
        else:
            nodes[name]["mention_count"] += 1
            nodes[name]["source_chunks"].add(cid)
            nodes[name]["modalities"].add(mod)
            
    return {
        name: {
            "mention_count": data["mention_count"],
            "source_chunks": sorted(list(data["source_chunks"])),
            "modalities": sorted(list(data["modalities"]))
        }
        for name, data in nodes.items()
    }
`,
    editorial: `### Algorithmic Approach

1. Convert existing lists of chunks and modalities to sets for $O(1)$ addition.
2. Iterate through new mentions. Increment \`mention_count\` and add \`chunk_id\` and \`modality\` to sets.
3. Convert sets back to sorted lists before returning.`,
    hints: [
      'Use Python sets to handle duplicate chunk IDs and modalities automatically.',
      'Increment mention_count each time an entity appears.',
      'Sort the final lists so the output order is deterministic.'
    ],
    testCases: [
      {
        inputs: [
          {"GPU": {"mention_count": 1, "source_chunks": ["doc1_c1"], "modalities": ["text"]}},
          [{"entity": "GPU", "chunk_id": "fig_img3", "modality": "image"}]
        ],
        expected: {
          "GPU": {"mention_count": 2, "source_chunks": ["doc1_c1", "fig_img3"], "modalities": ["image", "text"]}
        }
      }
    ],
    defaultCustomInput: '{"GPU": {"mention_count": 1, "source_chunks": ["doc1_c1"], "modalities": ["text"]}}, [{"entity": "GPU", "chunk_id": "fig_img3", "modality": "image"}]',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm7-p4',
    moduleId: 'module-7',
    order: 4,
    title: 'Add Weighted Relationship Edges Based on Confidence',
    difficulty: 'Easy',
    tags: ['Confidence Scoring', 'Edge Creation', 'Weighting'],
    funcName: 'add_confidence_weighted_edges',
    description: `When relations are extracted using multimodal models, each extraction has an extraction confidence $c \\in [0.0, 1.0]$.
Furthermore, relationships extracted from high-quality sources (e.g. structured tables) deserve higher reliability than noisy OCR.

Given:
- Triples: \`[{'head': str, 'tail': str, 'relation': str, 'confidence': float, 'source_type': str}, ...]\`.
- Source quality multiplier map: \`source_weights = {'table': 1.5, 'text': 1.0, 'ocr': 0.7, 'audio': 0.6}\`.

Compute the composite weight for each directed pair $(u, v)$:
$$w_{\\text{final}} = \\sum_{\\text{mentions}} (\\text{confidence} \\times \\text{source\\_weights.get}(\\text{source\\_type}, 1.0))$$
Discard any edge where total $w_{\\text{final}} < 0.5$ (low confidence pruning).

Return a list of edges sorted by source ascending, then target ascending:
\`[{'source': str, 'target': str, 'weight': float}, ...]\`
Round weights to 4 decimal places.`,
    mathematicalExplanation: `Calibrated belief propagation: edge weight represents expected evidentiary count:
$$W(u, v) = \\sum_{m \\in \\mathcal{M}(u, v)} c_m \\cdot \\sigma(s_m)$$
Pruning edges below a threshold $\\tau = 0.5$ removes spurious hallucinated relations.`,
    chimeraContext: `Filters out hallucinated or noisy relationships before graph indexing in Chimera.`,
    examples: [
      {
        input: 'triples = [{"head": "A", "tail": "B", "confidence": 0.8, "source_type": "text"}, {"head": "A", "tail": "B", "confidence": 0.9, "source_type": "table"}], source_weights = {"table": 1.5, "text": 1.0}',
        output: '[{"source": "A", "target": "B", "weight": 2.15}]',
        explanation: '0.8*1.0 + 0.9*1.5 = 0.8 + 1.35 = 2.15.'
      }
    ],
    constraints: [
      '1 <= len(triples) <= 1000'
    ],
    expectedComplexity: {
      time: 'O(|triples| \\log |edges|)',
      space: 'O(|edges|)'
    },
    starterCode: `def add_confidence_weighted_edges(triples: list[dict], source_weights: dict[str, float]) -> list[dict]:
    """
    Computes confidence and source-weighted edges, filtering out weights < 0.5.
    
    Args:
        triples: [{'head', 'tail', 'confidence', 'source_type'}, ...]
        source_weights: {source_type: multiplier}
        
    Returns:
        List of {'source', 'target', 'weight'} sorted by source, target.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def add_confidence_weighted_edges(triples: list[dict], source_weights: dict[str, float]) -> list[dict]:
    accum = {}
    for t in triples:
        u = t["head"]
        v = t["tail"]
        conf = float(t.get("confidence", 1.0))
        stype = t.get("source_type", "text")
        mult = source_weights.get(stype, 1.0)
        
        effective_w = conf * mult
        pair = (u, v)
        accum[pair] = accum.get(pair, 0.0) + effective_w
        
    results = []
    for (u, v), total_w in accum.items():
        if total_w >= 0.5:
            results.append({
                "source": u,
                "target": v,
                "weight": round(total_w, 4)
            })
            
    results.sort(key=lambda x: (x["source"], x["target"]))
    return results
`,
    editorial: `### Algorithmic Approach

1. For each triple, multiply confidence by the source quality multiplier.
2. Accumulate in a dictionary by $(u, v)$ tuple.
3. Filter out pairs where total weight $< 0.5$.
4. Sort by source, then target.`,
    hints: [
      'effective_w = confidence * source_weights.get(source_type, 1.0).',
      'Sum weights for identical (u, v) pairs.',
      'Only keep edges where total weight >= 0.5.'
    ],
    testCases: [
      {
        inputs: [
          [
            {"head": "A", "tail": "B", "confidence": 0.8, "source_type": "text"},
            {"head": "A", "tail": "B", "confidence": 0.9, "source_type": "table"}
          ],
          {"table": 1.5, "text": 1.0}
        ],
        expected: [{"source": "A", "target": "B", "weight": 2.15}]
      },
      {
        inputs: [
          [{"head": "X", "tail": "Y", "confidence": 0.3, "source_type": "text"}],
          {"text": 1.0}
        ],
        expected: []
      }
    ],
    defaultCustomInput: '[{"head": "A", "tail": "B", "confidence": 0.8, "source_type": "text"}], {"text": 1.0}',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm7-p5',
    moduleId: 'module-7',
    order: 5,
    title: 'Construct Co-Occurrence Edges Between Entities',
    difficulty: 'Medium',
    tags: ['Co-occurrence', 'Graph Construction', 'Undirected Edges'],
    funcName: 'build_cooccurrence_edges',
    description: `Direct factual triples (like \`DEVELOPED_BY\`) capture explicit relations, but often entities appearing in the same passage share implicit topical affinity.

Given a list of document passages, where each passage contains a list of extracted entities:
\`passages = [['BERT', 'RoBERTa', 'NLP'], ['NVIDIA', 'GPU'], ['BERT', 'Transformer', 'NLP']]\`

Construct undirected **co-occurrence edges**:
1. For every pair of distinct entities $\\{u, v\\}$ ($u \\neq v$) co-occurring in the same passage, add an edge with weight $1.0$.
2. If entities appear together across multiple passages, sum their co-occurrence counts.
3. Normalize each edge weight by the **Pointwise Mutual Information (PMI)** or geometric mean:
   $$W(u, v) = \\frac{\\text{cooccur}(u, v)}{\\sqrt{\\text{freq}(u) \\times \\text{freq}(v)}}$$
   where $\\text{freq}(u)$ is the total number of passages containing entity $u$.

Return the list of undirected edges formatted with $u < v$ alphabetically:
\`[{'entity1': str, 'entity2': str, 'weight': float}, ...]\`
Sort edges by \`entity1\` ascending, then \`entity2\` ascending. Round weights to 4 decimal places.`,
    mathematicalExplanation: `Normalized co-occurrence measures associative affinity (Ochiai coefficient / cosine similarity between entity occurrence indicator vectors):
$$W(u, v) = \\frac{|\\mathcal{D}_u \\cap \\mathcal{D}_v|}{\\sqrt{|\\mathcal{D}_u| \\cdot |\\mathcal{D}_v|}} \\in [0.0, 1.0]$$
Normalizing by the geometric mean prevents ultra-frequent entities (like "Data" or "System") from dominating all co-occurrence scores.`,
    chimeraContext: `Supplements sparse factual knowledge triples in Chimera with statistical associations across cross-modal documents.`,
    examples: [
      {
        input: 'passages = [["A", "B", "C"], ["A", "B"]]',
        output: '[{"entity1": "A", "entity2": "B", "weight": 1.0}, {"entity1": "A", "entity2": "C", "weight": 0.7071}, {"entity1": "B", "entity2": "C", "weight": 0.7071}]',
        explanation: 'A appears in 2 passages, B in 2, C in 1. Co-occurrence(A,B) = 2. Norm = 2/sqrt(4) = 1.0. Co-occurrence(A,C) = 1. Norm = 1/sqrt(2) = 0.7071.'
      }
    ],
    constraints: [
      '1 <= len(passages) <= 500'
    ],
    expectedComplexity: {
      time: 'O(\\sum |passage|^2)',
      space: 'O(|V|^2)'
    },
    starterCode: `def build_cooccurrence_edges(passages: list[list[str]]) -> list[dict]:
    """
    Constructs normalized co-occurrence edges between entities in passages.
    
    Args:
        passages: List of entity lists per passage.
        
    Returns:
        List of {'entity1', 'entity2', 'weight'} sorted alphabetically.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def build_cooccurrence_edges(passages: list[list[str]]) -> list[dict]:
    import math
    from itertools import combinations
    
    freq = {}
    cooccur = {}
    
    for p in passages:
        unique_entities = sorted(list(set(p)))
        for e in unique_entities:
            freq[e] = freq.get(e, 0) + 1
            
        for u, v in combinations(unique_entities, 2):
            pair = (min(u, v), max(u, v))
            cooccur[pair] = cooccur.get(pair, 0) + 1
            
    edges = []
    for (u, v), count in cooccur.items():
        w = count / math.sqrt(freq[u] * freq[v])
        edges.append({
            "entity1": u,
            "entity2": v,
            "weight": round(w, 4)
        })
        
    edges.sort(key=lambda x: (x["entity1"], x["entity2"]))
    return edges
`,
    editorial: `### Algorithmic Approach

1. Deduplicate entities within each passage using \`set(p)\`.
2. Count document frequency \`freq[e]\` for each entity.
3. For each pair $(u, v)$ in a passage, increment \`cooccur[(min(u, v), max(u, v))]\`.
4. Normalize count by $\\sqrt{\\text{freq}[u] \\times \\text{freq}[v]}$.
5. Sort edges alphabetically.`,
    hints: [
      'Deduplicate entities in each passage first with set(p).',
      'Use itertools.combinations(unique_entities, 2) to get pairs.',
      'Normalize weight using count / math.sqrt(freq[u] * freq[v]).'
    ],
    testCases: [
      {
        inputs: [[["A", "B", "C"], ["A", "B"]]],
        expected: [
          {"entity1": "A", "entity2": "B", "weight": 1.0},
          {"entity1": "A", "entity2": "C", "weight": 0.7071},
          {"entity1": "B", "entity2": "C", "weight": 0.7071}
        ]
      }
    ],
    defaultCustomInput: '[["A", "B", "C"], ["A", "B"]]',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm7-p6',
    moduleId: 'module-7',
    order: 6,
    title: 'Provenance Tracking on Graph Edges',
    difficulty: 'Easy',
    tags: ['Edge Attributes', 'Provenance', 'Grounding'],
    funcName: 'track_edge_provenance',
    description: `In addition to node provenance, graph **edges** must track the specific chunk IDs and extraction confidence from which the relationship was deduced.

Given:
- Existing edge dictionary:
  \`edge_store = { "head->tail": {'relation': str, 'weight': float, 'chunk_ids': list[str]}, ... }\`
- A new extraction:
  \`new_edge = {'head': str, 'relation': str, 'tail': str, 'chunk_id': str, 'confidence': float}\`

Update \`edge_store\`:
1. Use key format \`f"{new_edge['head']}->{new_edge['tail']}"\`.
2. If edge exists:
   - Add \`confidence\` to \`weight\`.
   - If \`chunk_id\` is not already in \`chunk_ids\`, append it and sort the list.
3. If edge is new:
   - Initialize with \`relation = new_edge['relation']\`, \`weight = new_edge['confidence']\`, and \`chunk_ids = [new_edge['chunk_id']]\`.

Return the updated dictionary representation. Round weights to 4 decimal places.`,
    mathematicalExplanation: `Edge provenance establishes multi-source evidential support:
$$\\text{Chunks}(u, r, v) = \\bigcup_{m \\in \\mathcal{M}(u, r, v)} \\{ \\text{chunk\\_id}_m \\}$$
Allows verifiable backtracking from reasoning graphs to source PDF sentences.`,
    chimeraContext: `Critical for Self-Correcting Retrieval: when the relevance grader doubts an edge, it queries the source chunk IDs recorded here to re-verify the assertion.`,
    examples: [
      {
        input: 'edge_store = {"A->B": {"relation": "R1", "weight": 0.8, "chunk_ids": ["c1"]}}, new_edge = {"head": "A", "relation": "R1", "tail": "B", "chunk_id": "c2", "confidence": 0.9}',
        output: '{"A->B": {"relation": "R1", "weight": 1.7, "chunk_ids": ["c1", "c2"]}}',
        explanation: 'Weight becomes 0.8 + 0.9 = 1.7; c2 added to chunk_ids.'
      }
    ],
    constraints: [
      'new_edge["confidence"] > 0'
    ],
    expectedComplexity: {
      time: 'O(|chunk_ids|)',
      space: 'O(1)'
    },
    starterCode: `def track_edge_provenance(edge_store: dict, new_edge: dict) -> dict:
    """
    Updates edge store with new edge extraction and provenance chunk ID.
    
    Args:
        edge_store: {"head->tail": {'relation', 'weight', 'chunk_ids'}}
        new_edge: {'head', 'relation', 'tail', 'chunk_id', 'confidence'}
        
    Returns:
        Updated edge_store dict.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def track_edge_provenance(edge_store: dict, new_edge: dict) -> dict:
    u = new_edge["head"]
    v = new_edge["tail"]
    pair_key = f"{u}->{v}"
    r = new_edge["relation"]
    cid = new_edge["chunk_id"]
    conf = float(new_edge["confidence"])
    
    if pair_key in edge_store:
        edge_store[pair_key]["weight"] = round(edge_store[pair_key]["weight"] + conf, 4)
        c_set = set(edge_store[pair_key]["chunk_ids"])
        c_set.add(cid)
        edge_store[pair_key]["chunk_ids"] = sorted(list(c_set))
    else:
        edge_store[pair_key] = {
            "relation": r,
            "weight": round(conf, 4),
            "chunk_ids": [cid]
        }
        
    return edge_store
`,
    editorial: `### Algorithmic Approach

1. Form key \`f"{new_edge['head']}->{new_edge['tail']}"\`.
2. If key exists, add confidence to weight and insert \`chunk_id\` into sorted unique list.
3. If new, initialize record.
4. Return updated dictionary.`,
    hints: [
      'Use key = f"{new_edge[\'head\']}->{new_edge[\'tail\']}" as string dictionary key.',
      'Add confidence to existing weight and round to 4 decimals.',
      'Ensure chunk_ids contains unique, sorted elements.'
    ],
    testCases: [
      {
        inputs: [
          {"A->B": {"relation": "R1", "weight": 0.8, "chunk_ids": ["c1"]}},
          {"head": "A", "relation": "R1", "tail": "B", "chunk_id": "c2", "confidence": 0.9}
        ],
        expected: {"A->B": {"relation": "R1", "weight": 1.7, "chunk_ids": ["c1", "c2"]}}
      },
      {
        inputs: [
          {},
          {"head": "NVIDIA", "relation": "BUILDS", "tail": "H100", "chunk_id": "chunk_42", "confidence": 0.95}
        ],
        expected: {"NVIDIA->H100": {"relation": "BUILDS", "weight": 0.95, "chunk_ids": ["chunk_42"]}}
      }
    ],
    defaultCustomInput: '{"A->B": {"relation": "R1", "weight": 0.8, "chunk_ids": ["c1"]}}, {"head": "A", "relation": "R1", "tail": "B", "chunk_id": "c2", "confidence": 0.9}',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm7-p7',
    moduleId: 'module-7',
    order: 7,
    title: 'Incremental Graph Updates Without Duplication',
    difficulty: 'Medium',
    tags: ['Incremental Graph', 'Graph Maintenance', 'Production Systems'],
    funcName: 'incremental_graph_update',
    description: `As new documents arrive continuously, the knowledge graph must update dynamically without re-indexing from scratch.

Given:
- Existing graph state: \`graph = {'nodes': set[str], 'edges': {(u, v): {'weight': float, 'relations': set[str]}}}\`.
- New incoming document triples: \`new_triples = [{'head': str, 'relation': str, 'tail': str, 'weight': float}, ...]\`.
- Alias mapping: \`alias_map = {alias: canonical_name, ...}\`.

For each incoming triple:
1. Resolve \`head\` and \`tail\` using \`alias_map\`.
2. If canonical head equals canonical tail, ignore (no self-loops).
3. Add canonical nodes to \`graph['nodes']\`.
4. Update or insert the edge in \`graph['edges']\`:
   - Add \`weight\` to existing weight.
   - Add \`relation\` to the relations set.

Return a formatted summary:
\`{ 'total_nodes': int, 'total_edges': int, 'nodes': sorted_list_of_nodes, 'edges': [{'source': str, 'target': str, 'weight': float, 'relations': sorted_list_of_relations}, ...] }\`
Sort edges by source, then target. Round weights to 4 decimal places.`,
    mathematicalExplanation: `Streaming graph construction maintains the dynamic property:
$$\\mathcal{G}_{t} = \\mathcal{G}_{t-1} \\cup \\Delta \\mathcal{G}_t$$
where node sets and edge weights accumulate monotonically without redundant entity duplication.`,
    chimeraContext: `Supports real-time incremental updates in Chimera when users upload additional multimodal lecture notes or papers.`,
    examples: [
      {
        input: 'graph = {"nodes": ["NVIDIA"], "edges": {}}, new_triples = [{"head": "Nvidia", "relation": "BUILDS", "tail": "GPU", "weight": 1.0}], alias_map = {"Nvidia": "NVIDIA"}',
        output: '{"total_nodes": 2, "total_edges": 1, "nodes": ["GPU", "NVIDIA"], "edges": [{"source": "NVIDIA", "target": "GPU", "weight": 1.0, "relations": ["BUILDS"]}]}',
        explanation: '"Nvidia" is resolved to canonical "NVIDIA", adding node "GPU" and directed edge NVIDIA -> GPU.'
      }
    ],
    constraints: [
      '0 <= len(new_triples) <= 1000'
    ],
    expectedComplexity: {
      time: 'O(|triples| \\log |V|)',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def incremental_graph_update(graph: dict, new_triples: list[dict], alias_map: dict[str, str]) -> dict:
    """
    Incrementally updates graph with new triples and alias resolution.
    
    Args:
        graph: {'nodes': list/set, 'edges': {(u, v): {'weight', 'relations'}}}
        new_triples: [{'head', 'relation', 'tail', 'weight'}, ...]
        alias_map: {alias: canonical}
        
    Returns:
        Summary dict of updated graph state.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def incremental_graph_update(graph: dict, new_triples: list[dict], alias_map: dict[str, str]) -> dict:
    nodes = set(graph.get("nodes", []))
    edges = {}
    for edge_key, data in graph.get("edges", {}).items():
        if isinstance(edge_key, tuple):
            u, v = edge_key
        elif "->" in str(edge_key):
            u, v = str(edge_key).split("->", 1)
        else:
            u, v = str(edge_key), ""
        edges[(u, v)] = {
            "weight": data["weight"],
            "relations": set(data["relations"])
        }
        
    for t in new_triples:
        raw_u = t["head"]
        raw_v = t["tail"]
        r = t["relation"]
        w = float(t.get("weight", 1.0))
        
        u = alias_map.get(raw_u, raw_u)
        v = alias_map.get(raw_v, raw_v)
        
        if u == v:
            continue
            
        nodes.add(u)
        nodes.add(v)
        
        pair = (u, v)
        if pair in edges:
            edges[pair]["weight"] += w
            edges[pair]["relations"].add(r)
        else:
            edges[pair] = {
                "weight": w,
                "relations": set([r])
            }
            
    sorted_nodes = sorted(list(nodes))
    sorted_edges = []
    for (u, v), data in edges.items():
        sorted_edges.append({
            "source": u,
            "target": v,
            "weight": round(data["weight"], 4),
            "relations": sorted(list(data["relations"]))
        })
    sorted_edges.sort(key=lambda e: (e["source"], e["target"]))
    
    return {
        "total_nodes": len(sorted_nodes),
        "total_edges": len(sorted_edges),
        "nodes": sorted_nodes,
        "edges": sorted_edges
    }
`,
    editorial: `### Algorithmic Approach

1. Resolve raw entity names using \`alias_map\`.
2. Skip if canonical $u == v$.
3. Insert nodes into set \`nodes\`.
4. Accumulate weights and relation sets in \`edges[(u, v)]\`.
5. Format and return sorted lists.`,
    hints: [
      'Resolve both head and tail through alias_map before checking for self-loops.',
      'Use sets for relations so duplicates are not added twice.',
      'Sort nodes and edges before returning.'
    ],
    testCases: [
      {
        inputs: [
          {"nodes": ["NVIDIA"], "edges": {}},
          [{"head": "Nvidia", "relation": "BUILDS", "tail": "GPU", "weight": 1.0}],
          {"Nvidia": "NVIDIA"}
        ],
        expected: {
          "total_nodes": 2,
          "total_edges": 1,
          "nodes": ["GPU", "NVIDIA"],
          "edges": [{"source": "NVIDIA", "target": "GPU", "weight": 1.0, "relations": ["BUILDS"]}]
        }
      }
    ],
    defaultCustomInput: '{"nodes": ["NVIDIA"], "edges": {}}, [{"head": "Nvidia", "relation": "BUILDS", "tail": "GPU", "weight": 1.0}], {"Nvidia": "NVIDIA"}',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm7-p8',
    moduleId: 'module-7',
    order: 8,
    title: 'Persist and Reload Graph in JSON Format',
    difficulty: 'Medium',
    tags: ['Serialization', 'Node-Link Format', 'Graph Persistence'],
    funcName: 'serialize_and_verify_graph',
    description: `To store and transmit graphs across microservices, graphs are serialized into standard **Node-Link JSON format**.

Given a graph defined by:
- \`nodes\`: List of entity dicts: \`[{'id': str, 'type': str}, ...]\`.
- \`edges\`: List of edge dicts: \`[{'source': str, 'target': str, 'relation': str, 'weight': float}, ...]\`.

Write two functions in your solution (or execute in \`serialize_and_verify_graph\`):
1. **Serialize:** Convert into JSON string:
   \`{"directed": true, "multigraph": false, "nodes": [...], "links": [...]}\`
   where each link has keys \`'source'\`, \`'target'\`, \`'relation'\`, \`'weight'\`.
2. **Deserialize and Verify:** Parse the JSON string back into Python objects and verify:
   - All link endpoints exist in \`nodes\`.
   - Node count and edge count match original.
   - Graph is valid and non-corrupt.

Return a tuple \`(is_valid: bool, num_nodes: int, num_edges: int)\`.`,
    mathematicalExplanation: `Deterministic bijection between internal graph memory representations and standard JSON graph schemas:
$$\\mathcal{G} \\xrightarrow{\\text{serialize}} \\text{JSON} \\xrightarrow{\\text{deserialize}} \\mathcal{G}' \\cong \\mathcal{G}$$`,
    chimeraContext: `Guarantees reliable persistence of Chimera\'s knowledge graphs to disk/S3 and seamless transfer between Python retrieval services and frontend visualizers.`,
    examples: [
      {
        input: 'nodes = [{"id": "A", "type": "T1"}, {"id": "B", "type": "T2"}], edges = [{"source": "A", "target": "B", "relation": "R", "weight": 1.0}]',
        output: '(True, 2, 1)',
        explanation: 'Endpoints A and B exist in nodes. Valid node-link graph with 2 nodes and 1 edge.'
      }
    ],
    constraints: [
      '1 <= len(nodes) <= 1000'
    ],
    expectedComplexity: {
      time: 'O(|V| + |E|)',
      space: 'O(|V| + |E|)'
    },
    starterCode: `def serialize_and_verify_graph(nodes: list[dict], edges: list[dict]) -> tuple[bool, int, int]:
    """
    Serializes graph to JSON node-link format, deserializes, and verifies integrity.
    
    Args:
        nodes: [{'id': str, 'type': str}, ...]
        edges: [{'source': str, 'target': str, 'relation': str, 'weight': float}, ...]
        
    Returns:
        (is_valid, num_nodes, num_edges)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def serialize_and_verify_graph(nodes: list[dict], edges: list[dict]) -> tuple[bool, int, int]:
    import json
    
    # 1. Serialize
    payload = {
        "directed": True,
        "multigraph": False,
        "nodes": nodes,
        "links": edges
    }
    json_str = json.dumps(payload)
    
    # 2. Deserialize & Verify
    data = json.loads(json_str)
    deser_nodes = data.get("nodes", [])
    deser_links = data.get("links", [])
    
    node_ids = set(n["id"] for n in deser_nodes)
    
    # Verify endpoints
    for link in deser_links:
        if link["source"] not in node_ids or link["target"] not in node_ids:
            return False, len(deser_nodes), len(deser_links)
            
    return True, len(deser_nodes), len(deser_links)
`,
    editorial: `### Algorithmic Approach

1. Wrap nodes and edges into standard schema dict with \`"directed": True\`.
2. Convert to JSON with \`json.dumps\`.
3. Parse back with \`json.loads\`.
4. Collect all node IDs into a set. Check that every edge\'s source and target exist in the set.
5. Return \`(True, num_nodes, num_edges)\`.`,
    hints: [
      'Use json.dumps and json.loads.',
      'Check that every link source and target is present in the node ID set.',
      'Return (is_valid, len(nodes), len(links)).'
    ],
    testCases: [
      {
        inputs: [
          [{"id": "A", "type": "T1"}, {"id": "B", "type": "T2"}],
          [{"source": "A", "target": "B", "relation": "R", "weight": 1.0}]
        ],
        expected: [true, 2, 1]
      },
      {
        inputs: [
          [{"id": "A", "type": "T1"}],
          [{"source": "A", "target": "MISSING", "relation": "R", "weight": 1.0}]
        ],
        expected: [false, 1, 1]
      }
    ],
    defaultCustomInput: '[{"id": "A", "type": "T1"}, {"id": "B", "type": "T2"}], [{"source": "A", "target": "B", "relation": "R", "weight": 1.0}]',
    suggestedVisualizer: 'graph-editor'
  }
];
