import { Problem } from '../../types/problem';

export const MODULE_6_PROBLEMS: Problem[] = [
  {
    id: 'm6-p1',
    moduleId: 'module-6',
    order: 1,
    title: 'Normalize Entity Names',
    difficulty: 'Easy',
    tags: ['Entity Extraction', 'String Normalization', 'Preprocessing'],
    funcName: 'normalize_entity_name',
    description: `During multimodal text extraction, identical entities appear in diverse formats (e.g. \`"NVIDIA Corp."\`, \`"nvidia" \`, \`"  NVIDIA  "\`, \`"NVIDIA Corporation"\`).

Given a raw entity string \`raw_name\` and an optional alias replacement dictionary \`alias_map\` (e.g. \`{"corp": "", "corporation": "", "inc": ""}\`):
1. Strip leading and trailing whitespace.
2. Convert all characters to lowercase.
3. Remove common punctuation characters: \`.,;:'"!?-()[]{}/\`
4. Split the string into whitespace-separated tokens.
5. If a token is in \`alias_map\`, replace it with \`alias_map[token]\` (or delete it if the replacement is empty \`""\`).
6. Join surviving tokens with a single space.
7. Return the canonical normalized string.`,
    mathematicalExplanation: `Entity normalization is an equivalence relation mapping $\\Sigma^* \\to \\mathcal{C}$:
$$\\text{Norm}(s_1) = \\text{Norm}(s_2) \\implies s_1 \\equiv s_2$$
It collapses trivial morphological variations into a unified canonical key before embedding computation.`,
    chimeraContext: `In Chimera, raw OCR from figures, Whisper audio transcripts, and PDF body text produce surface variations of the same entity. Normalization prevents graph node fragmentation.`,
    examples: [
      {
        input: 'raw_name = "  NVIDIA Corp.  ", alias_map = {"corp": ""}',
        output: '"nvidia"',
        explanation: 'Punctuation "." removed, "corp" eliminated via alias_map, whitespace stripped.'
      }
    ],
    constraints: [
      '1 <= len(raw_name) <= 200'
    ],
    expectedComplexity: {
      time: 'O(|raw_name|)',
      space: 'O(|raw_name|)'
    },
    starterCode: `def normalize_entity_name(raw_name: str, alias_map: dict[str, str] | None = None) -> str:
    """
    Normalizes raw entity string by stripping punctuation, lowercasing, and applying alias mappings.
    
    Args:
        raw_name: Raw entity string.
        alias_map: Mapping of terms to replacements or empty string to delete.
        
    Returns:
        Canonical entity name.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def normalize_entity_name(raw_name: str, alias_map: dict[str, str] | None = None) -> str:
    alias_map = alias_map or {}
    text = raw_name.strip().lower()
    punct = ".,;:'\\\"!?-()[]{}/"
    for p in punct:
        text = text.replace(p, " ")
        
    tokens = text.split()
    processed = []
    for tok in tokens:
        if tok in alias_map:
            rep = alias_map[tok].strip()
            if rep:
                processed.append(rep)
        else:
            processed.append(tok)
            
    return " ".join(processed)
`,
    editorial: `### Algorithmic Approach

1. Lowercase and strip whitespace.
2. Replace all punctuation characters with space.
3. Tokenize by whitespace.
4. Replace or drop tokens based on \`alias_map\`.
5. Join remaining tokens with single spaces.`,
    hints: [
      'Replace punctuation with spaces so "Corp." becomes "Corp".',
      'Split into tokens to check each word against alias_map.',
      'Join tokens with a single space.'
    ],
    testCases: [
      {
        inputs: ["  NVIDIA Corp.  ", {"corp": ""}],
        expected: "nvidia"
      },
      {
        inputs: ["Google Inc.", {"inc": ""}],
        expected: "google"
      },
      {
        inputs: ["PyTorch (Framework)", {}],
        expected: "pytorch framework"
      }
    ],
    defaultCustomInput: '"  NVIDIA Corp.  ", {"corp": ""}',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm6-p2',
    moduleId: 'module-6',
    order: 2,
    title: 'Detect Duplicate Entity Mentions via Jaccard Similarity',
    difficulty: 'Easy',
    tags: ['Entity Resolution', 'Jaccard Similarity', 'N-Grams'],
    funcName: 'jaccard_duplicate_detection',
    description: `Given two entity names \`name1\` and \`name2\`, compute the character **3-gram Jaccard Similarity**:
1. For each name, lowercase and strip whitespace.
2. Extract all character 3-grams (substrings of length 3). If a name has length $< 3$, the set contains the whole name.
3. Compute the Jaccard similarity between the two sets of 3-grams $A$ and $B$:
   $$J(A, B) = \\frac{|A \\cap B|}{|A \\cup B|}$$
4. Return a tuple \`(is_duplicate: bool, round(similarity, 4))\`, where \`is_duplicate = True\` if $J(A, B) \\ge \\text{threshold}$ (default $0.5$).`,
    mathematicalExplanation: `The Jaccard index on character n-grams measures surface string overlap resistant to minor spelling errors, typos, and affixes:
$$J(A, B) = \\frac{|A \\cap B|}{|A \\cup B|} \\in [0.0, 1.0]$$`,
    chimeraContext: `Fast duplicate entity candidate pairing prior to costly transformer embedding calculations.`,
    examples: [
      {
        input: 'name1 = "transformer", name2 = "transformers", threshold = 0.5',
        output: '(True, 0.9)',
        explanation: '3-grams overlap across 9 of 10 unique n-grams. Jaccard = 0.9 >= 0.5.'
      }
    ],
    constraints: [
      '1 <= len(name1), len(name2) <= 100'
    ],
    expectedComplexity: {
      time: 'O(|name1| + |name2|)',
      space: 'O(|name1| + |name2|)'
    },
    starterCode: `def jaccard_duplicate_detection(name1: str, name2: str, threshold: float = 0.5) -> tuple[bool, float]:
    """
    Computes 3-gram Jaccard similarity to detect duplicate entity mentions.
    
    Args:
        name1: First entity string.
        name2: Second entity string.
        threshold: Duplicate decision threshold.
        
    Returns:
        (is_duplicate, similarity)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def jaccard_duplicate_detection(name1: str, name2: str, threshold: float = 0.5) -> tuple[bool, float]:
    s1 = name1.strip().lower()
    s2 = name2.strip().lower()
    
    def get_ngrams(s):
        if len(s) < 3:
            return set([s])
        return set(s[i:i+3] for i in range(len(s) - 2))
        
    ng1 = get_ngrams(s1)
    ng2 = get_ngrams(s2)
    
    inter = len(ng1 & ng2)
    union = len(ng1 | ng2)
    sim = inter / union if union > 0 else 0.0
    return (sim >= threshold, round(sim, 4))
`,
    editorial: `### Algorithmic Approach

1. Clean both strings (strip, lower).
2. Generate sets of character 3-grams: \`{s[i:i+3] for i in range(len(s)-2)}\`.
3. Intersection is \`len(ng1 & ng2)\`, Union is \`len(ng1 | ng2)\`.
4. Similarity is $\\text{intersection} / \\text{union}$.
5. Return \`(similarity >= threshold, round(sim, 4))\`.`,
    hints: [
      'Slice substrings of length 3: s[i:i+3].',
      'Use Python set operations: set1 & set2 and set1 | set2.',
      'Check if union is 0 to avoid division by zero.'
    ],
    testCases: [
      {
        inputs: ["transformer", "transformers", 0.5],
        expected: [true, 0.9]
      },
      {
        inputs: ["apple", "banana", 0.5],
        expected: [false, 0.0]
      }
    ],
    defaultCustomInput: '"transformer", "transformers", 0.5',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm6-p3',
    moduleId: 'module-6',
    order: 3,
    title: 'Implement Cosine Similarity for Vector Embeddings',
    difficulty: 'Easy',
    tags: ['Cosine Similarity', 'Vector Math', 'Linear Algebra'],
    funcName: 'cosine_similarity',
    description: `Given two non-zero vectors $\\mathbf{a}, \\mathbf{b} \\in \\mathbb{R}^d$:

Compute their **Cosine Similarity**:
$$\\cos(\\theta) = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{\\|\\mathbf{a}\\|_2 \\|\\mathbf{b}\\|_2} = \\frac{\\sum_{i=1}^d a_i b_i}{\\sqrt{\\sum_{i=1}^d a_i^2} \\sqrt{\\sum_{i=1}^d b_i^2}}$$

Return the cosine similarity rounded to 4 decimal places. If either vector has norm 0, return 0.0.`,
    mathematicalExplanation: `Cosine similarity evaluates the angular alignment between two high-dimensional vectors, invariant to scale or magnitude:
$$\\cos(\\theta) \\in [-1.0, 1.0]$$
In sentence and entity transformer spaces (e.g. \`all-MiniLM-L6-v2\`), semantic equivalence produces values $\\ge 0.85$.`,
    chimeraContext: `The core distance metric used in Qdrant vector retrieval and semantic entity linking in Chimera.`,
    examples: [
      {
        input: 'a = [1.0, 2.0, 3.0], b = [1.0, 2.0, 3.0]',
        output: '1.0',
        explanation: 'Identical vectors have an angle of 0 degrees, so cosine similarity is 1.0.'
      },
      {
        input: 'a = [1.0, 0.0], b = [0.0, 1.0]',
        output: '0.0',
        explanation: 'Orthogonal vectors have cosine similarity 0.0.'
      }
    ],
    constraints: [
      '1 <= len(a) == len(b) <= 1536'
    ],
    expectedComplexity: {
      time: 'O(d)',
      space: 'O(1)'
    },
    starterCode: `def cosine_similarity(a: list[float], b: list[float]) -> float:
    """
    Computes cosine similarity between two dense vectors.
    
    Args:
        a: First vector of dimension d.
        b: Second vector of dimension d.
        
    Returns:
        Cosine similarity rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def cosine_similarity(a: list[float], b: list[float]) -> float:
    import math
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return round(dot / (norm_a * norm_b), 4)
`,
    editorial: `### Algorithmic Approach

1. Compute dot product: $\\sum a_i b_i$.
2. Compute $L_2$ norms: $\\sqrt{\\sum a_i^2}$ and $\\sqrt{\\sum b_i^2}$.
3. Divide dot product by the product of norms.
4. Return rounded result.`,
    hints: [
      'Dot product is sum(x * y for x, y in zip(a, b)).',
      'Norm is math.sqrt(sum(x * x for x in v)).',
      'Check for 0 norm to avoid ZeroDivisionError.'
    ],
    testCases: [
      {
        inputs: [[1.0, 2.0, 3.0], [1.0, 2.0, 3.0]],
        expected: 1.0
      },
      {
        inputs: [[1.0, 0.0], [0.0, 1.0]],
        expected: 0.0
      },
      {
        inputs: [[1.0, 2.0], [2.0, 4.0]],
        expected: 1.0
      }
    ],
    defaultCustomInput: '[1.0, 2.0, 3.0], [1.0, 2.0, 3.0]',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm6-p4',
    moduleId: 'module-6',
    order: 4,
    title: 'Match Entity Mention Against Canonical Embeddings',
    difficulty: 'Easy',
    tags: ['Entity Linking', 'Nearest Neighbor', 'Dense Search'],
    funcName: 'match_canonical_entity',
    description: `Given a query entity embedding vector \`mention_embedding\` and a database of canonical entities represented as:
\`canonical_entities = [{'name': str, 'embedding': list[float]}, ...]\`

Find the canonical entity that has the **highest cosine similarity** with \`mention_embedding\`.

Return a tuple \`(best_canonical_name: str, round(best_similarity, 4))\`.
If \`canonical_entities\` is empty, return \`("", 0.0)\`.`,
    mathematicalExplanation: `1-Nearest Neighbor search over canonical entity representations:
$$e^* = \\arg\\max_{e \\in \\mathcal{E}_{\\text{canonical}}} \\frac{\\mathbf{v}_{\\text{mention}} \\cdot \\mathbf{v}_e}{\\|\\mathbf{v}_{\\text{mention}}\\| \\|\\mathbf{v}_e\\|}$$`,
    chimeraContext: `Maps ambiguous extracted entity mentions to canonical knowledge graph nodes (e.g. mapping "Google LLC" to canonical node "Alphabet Inc").`,
    examples: [
      {
        input: 'mention_embedding = [0.9, 0.1], canonical_entities = [{"name": "E1", "embedding": [1.0, 0.0]}, {"name": "E2", "embedding": [0.0, 1.0]}]',
        output: '("E1", 0.9939)',
        explanation: 'E1 is much closer to [0.9, 0.1] than E2.'
      }
    ],
    constraints: [
      '0 <= len(canonical_entities) <= 1000'
    ],
    expectedComplexity: {
      time: 'O(|canonical| \\cdot d)',
      space: 'O(1)'
    },
    starterCode: `def match_canonical_entity(mention_embedding: list[float], canonical_entities: list[dict]) -> tuple[str, float]:
    """
    Finds the canonical entity with maximum cosine similarity.
    
    Args:
        mention_embedding: Query embedding vector.
        canonical_entities: List of {'name': str, 'embedding': list[float]}.
        
    Returns:
        (best_name, best_sim)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def match_canonical_entity(mention_embedding: list[float], canonical_entities: list[dict]) -> tuple[str, float]:
    if not canonical_entities:
        return "", 0.0
    import math
    norm_m = math.sqrt(sum(x * x for x in mention_embedding))
    if norm_m == 0.0:
        return canonical_entities[0]["name"], 0.0
        
    best_name = ""
    best_sim = -float('inf')
    
    for item in canonical_entities:
        emb = item["embedding"]
        dot = sum(x * y for x, y in zip(mention_embedding, emb))
        norm_e = math.sqrt(sum(y * y for y in emb))
        sim = dot / (norm_m * norm_e) if norm_e > 0 else 0.0
        if sim > best_sim:
            best_sim = sim
            best_name = item["name"]
            
    return best_name, round(best_sim, 4)
`,
    editorial: `### Algorithmic Approach

1. Precompute the norm of \`mention_embedding\`.
2. Iterate through each canonical candidate, compute cosine similarity.
3. Track the maximum similarity and associated entity name.
4. Return \`(best_name, round(best_sim, 4))\`.`,
    hints: [
      'Iterate through canonical_entities.',
      'Compute cosine similarity with each embedding.',
      'Keep track of the argmax entity name.'
    ],
    testCases: [
      {
        inputs: [
          [0.9, 0.1],
          [{"name": "E1", "embedding": [1.0, 0.0]}, {"name": "E2", "embedding": [0.0, 1.0]}]
        ],
        expected: ["E1", 0.9939]
      }
    ],
    defaultCustomInput: '[0.9, 0.1], [{"name": "E1", "embedding": [1.0, 0.0]}, {"name": "E2", "embedding": [0.0, 1.0]}]',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm6-p5',
    moduleId: 'module-6',
    order: 5,
    title: 'Threshold-Based Entity Resolution with Clustering',
    difficulty: 'Medium',
    tags: ['Entity Resolution', 'Connected Components', 'Clustering'],
    funcName: 'cluster_duplicate_entities',
    description: `Given a list of entity names and their embedding vectors:
\`entities = [{'name': str, 'embedding': list[float]}, ...]\`
and a similarity threshold \`threshold = 0.85\`:

1. Build an undirected graph where each entity is a vertex.
2. Add an edge between entity $i$ and entity $j$ ($i < j$) if their cosine similarity $\\ge \\text{threshold}$.
3. Find all connected components in this graph.
4. For each component, pick the **shortest name** as the canonical representative (if tied in length, choose alphabetically first).

Return a dictionary mapping every original entity name to its canonical representative:
\`{original_name: canonical_name, ...}\``,
    mathematicalExplanation: `Single-linkage agglomerative clustering truncated at similarity threshold $\\theta$:
$$e_i \\sim e_j \\iff \\cos(\\mathbf{v}_i, \\mathbf{v}_j) \\ge \\theta$$
The transitive closure partitions entities into equivalence classes $[e]$ forming canonical synsets.`,
    chimeraContext: `Merges identical concepts across multiple documents into single unified graph nodes before building knowledge graph edges.`,
    examples: [
      {
        input: 'entities = [{"name": "NVIDIA Corp", "embedding": [1.0, 0.0]}, {"name": "NVIDIA", "embedding": [0.99, 0.05]}, {"name": "AMD", "embedding": [0.0, 1.0]}], threshold = 0.85',
        output: '{"NVIDIA Corp": "NVIDIA", "NVIDIA": "NVIDIA", "AMD": "AMD"}',
        explanation: '"NVIDIA Corp" and "NVIDIA" are highly similar (sim > 0.99). "NVIDIA" is shorter, so it becomes the canonical name for both.'
      }
    ],
    constraints: [
      '1 <= len(entities) <= 100'
    ],
    expectedComplexity: {
      time: 'O(N^2 \\cdot d)',
      space: 'O(N^2)'
    },
    starterCode: `def cluster_duplicate_entities(entities: list[dict], threshold: float = 0.85) -> dict[str, str]:
    """
    Clusters entities with cosine similarity >= threshold and selects canonical shortest name.
    
    Args:
        entities: [{'name': str, 'embedding': list[float]}, ...]
        threshold: Similarity threshold.
        
    Returns:
        Mapping from original name to canonical name.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def cluster_duplicate_entities(entities: list[dict], threshold: float = 0.85) -> dict[str, str]:
    import math
    n = len(entities)
    names = [e["name"] for e in entities]
    embs = [e["embedding"] for e in entities]
    
    # Precompute norms
    norms = [math.sqrt(sum(x * x for x in emb)) for emb in embs]
    
    # Adjacency for connected components
    adj = {i: [] for i in range(n)}
    for i in range(n):
        for j in range(i + 1, n):
            if norms[i] > 0 and norms[j] > 0:
                dot = sum(x * y for x, y in zip(embs[i], embs[j]))
                sim = dot / (norms[i] * norms[j])
                if sim >= threshold:
                    adj[i].append(j)
                    adj[j].append(i)
                    
    # Find connected components
    visited = [False] * n
    mapping = {}
    
    for i in range(n):
        if not visited[i]:
            component = []
            stack = [i]
            visited[i] = True
            while stack:
                curr = stack.pop()
                component.append(names[curr])
                for neighbor in adj[curr]:
                    if not visited[neighbor]:
                        visited[neighbor] = True
                        stack.append(neighbor)
                        
            # Choose canonical: shortest length, then alphabetical
            canonical = sorted(component, key=lambda name: (len(name), name))[0]
            for member in component:
                mapping[member] = canonical
                
    return mapping
`,
    editorial: `### Algorithmic Approach

1. Compute pairwise cosine similarity between all entities.
2. Build an adjacency graph connecting pairs with similarity $\\ge \\text{threshold}$.
3. Extract connected components using DFS/BFS.
4. For each component, select the canonical label using key \`(len(name), name)\`.
5. Map every member of the component to that canonical name.`,
    hints: [
      'Compare all pairs i < j.',
      'Use BFS/DFS to find connected components of connected entity indices.',
      'Pick the canonical name using min(component, key=lambda x: (len(x), x)).'
    ],
    testCases: [
      {
        inputs: [
          [
            {"name": "NVIDIA Corp", "embedding": [1.0, 0.0]},
            {"name": "NVIDIA", "embedding": [0.99, 0.05]},
            {"name": "AMD", "embedding": [0.0, 1.0]}
          ],
          0.85
        ],
        expected: {"NVIDIA Corp": "NVIDIA", "NVIDIA": "NVIDIA", "AMD": "AMD"}
      }
    ],
    defaultCustomInput: '[{"name": "NVIDIA Corp", "embedding": [1.0, 0.0]}, {"name": "NVIDIA", "embedding": [0.99, 0.05]}], 0.85',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm6-p6',
    moduleId: 'module-6',
    order: 6,
    title: 'Avoid Merging Distinct Entities (Type Filtering)',
    difficulty: 'Medium',
    tags: ['Entity Disambiguation', 'Type Constraints', 'Guardrails'],
    funcName: 'disambiguate_with_types',
    description: `A critical flaw in naive embedding similarity is **false positive merging**:
- *"Apple"* (Organization) vs *"Apple"* (Fruit) have similar lexical forms but represent totally distinct entities.
- *"GPT-3"* vs *"GPT-4"* have high embedding similarity ($> 0.92$), but merging them would destroy version-specific facts.

Given two entities with their embeddings, name, and entity types:
\`e1 = {'name': str, 'type': str, 'embedding': list[float]}\`
\`e2 = {'name': str, 'type': str, 'embedding': list[float]}\`
and a compatibility dictionary \`compatible_types\` where \`compatible_types[t1]\` is a set/list of types that can merge with \`t1\`:

Determine if $e_1$ and $e_2$ should be merged:
1. Type compatibility rule: $e_2.\\text{type}$ must be in \`compatible_types.get(e1.type, [e1.type])\`.
2. Exact negation rule: if both names contain distinct numeric versions (e.g. \`"3"\` vs \`"4"\` or \`"v1"\` vs \`"v2"\`), do **not** merge, even if similarity is high.
3. Embedding rule: cosine similarity must be $\\ge 0.88$.

Return a tuple \`(should_merge: bool, reason: str)\`.`,
    mathematicalExplanation: `Constrained resolution prevents semantic collapse by enforcing type predicate gating:
$$\\text{Merge}(e_1, e_2) \\iff \\text{Compatible}(\\tau_1, \\tau_2) \\land \\neg \\text{VersionConflict}(e_1, e_2) \\land \\cos(\\mathbf{v}_1, \\mathbf{v}_2) \\ge \\theta$$`,
    chimeraContext: `Guarantees that distinct model versions, product releases, or homonyms are not conflated during multimodal ingestion in Chimera.`,
    examples: [
      {
        input: 'e1 = {"name": "Apple", "type": "Company", "embedding": [0.9, 0.1]}, e2 = {"name": "Apple", "type": "Food", "embedding": [0.89, 0.12]}, compatible_types = {"Company": ["Organization", "Company"]}',
        output: '(False, "Type mismatch: Food is not compatible with Company")',
        explanation: 'Types Company and Food are incompatible, correctly preventing merge.'
      }
    ],
    constraints: [
      'len(e1["embedding"]) == len(e2["embedding"])'
    ],
    expectedComplexity: {
      time: 'O(d)',
      space: 'O(1)'
    },
    starterCode: `def disambiguate_with_types(e1: dict, e2: dict, compatible_types: dict[str, list[str]]) -> tuple[bool, str]:
    """
    Evaluates whether two entities can be safely merged using type and version constraints.
    
    Args:
        e1: First entity dict.
        e2: Second entity dict.
        compatible_types: Type compatibility map.
        
    Returns:
        (should_merge, reason)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def disambiguate_with_types(e1: dict, e2: dict, compatible_types: dict[str, list[str]]) -> tuple[bool, str]:
    import re
    import math
    
    # 1. Type compatibility
    allowed_types = set(compatible_types.get(e1["type"], [e1["type"]]))
    if e2["type"] not in allowed_types:
        return False, f"Type mismatch: {e2['type']} is not compatible with {e1['type']}"
        
    # 2. Version conflict check
    nums1 = set(re.findall(r'\\b\\d+\\b', e1["name"]))
    nums2 = set(re.findall(r'\\b\\d+\\b', e2["name"]))
    if nums1 and nums2 and nums1 != nums2:
        return False, f"Version conflict between '{e1['name']}' and '{e2['name']}'"
        
    # 3. Cosine similarity
    emb1, emb2 = e1["embedding"], e2["embedding"]
    norm1 = math.sqrt(sum(x * x for x in emb1))
    norm2 = math.sqrt(sum(y * y for y in emb2))
    dot = sum(x * y for x, y in zip(emb1, emb2))
    sim = dot / (norm1 * norm2) if norm1 > 0 and norm2 > 0 else 0.0
    
    if sim < 0.88:
        return False, f"Similarity {round(sim, 4)} below threshold 0.88"
        
    return True, f"Entities merged with similarity {round(sim, 4)}"
`,
    editorial: `### Algorithmic Approach

1. Verify that $e2[\\text{'type'}]$ is in the allowed set for $e1[\\text{'type'}]$.
2. Extract numeric tokens using regex \`\\b\\d+\\b\`. If both names contain numbers and they differ (e.g. 3 vs 4), reject the merge.
3. Compute cosine similarity. If $\\ge 0.88$, accept merge.`,
    hints: [
      'Check type compatibility first.',
      'Use re.findall(r"\\b\\d+\\b", name) to extract version numbers.',
      'Check if cosine similarity is >= 0.88.'
    ],
    testCases: [
      {
        inputs: [
          {"name": "Apple", "type": "Company", "embedding": [0.9, 0.1]},
          {"name": "Apple", "type": "Food", "embedding": [0.89, 0.12]},
          {"Company": ["Organization", "Company"]}
        ],
        expected: [false, "Type mismatch: Food is not compatible with Company"]
      },
      {
        inputs: [
          {"name": "GPT 3", "type": "Model", "embedding": [0.95, 0.05]},
          {"name": "GPT 4", "type": "Model", "embedding": [0.94, 0.06]},
          {"Model": ["Model"]}
        ],
        expected: [false, "Version conflict between 'GPT 3' and 'GPT 4'"]
      },
      {
        inputs: [
          {"name": "PyTorch", "type": "Library", "embedding": [1.0, 0.0]},
          {"name": "PyTorch Framework", "type": "Library", "embedding": [0.98, 0.02]},
          {"Library": ["Library"]}
        ],
        expected: [true, "Entities merged with similarity 0.9998"]
      }
    ],
    defaultCustomInput: '{"name": "Apple", "type": "Company", "embedding": [0.9, 0.1]}, {"name": "Apple", "type": "Food", "embedding": [0.89, 0.12]}, {"Company": ["Company"]}',
    suggestedVisualizer: 'graph-editor'
  },
  {
    id: 'm6-p7',
    moduleId: 'module-6',
    order: 7,
    title: 'Type-Aware Entity Matching Matrix',
    difficulty: 'Medium',
    tags: ['Matrix Operations', 'Type Prior', 'Cosine Similarity'],
    funcName: 'type_aware_similarity_matrix',
    description: `Given:
- A list of $n$ entity objects: \`[{'name': str, 'type': str, 'embedding': list[float]}, ...]\`.
- A type compatibility penalty matrix: \`type_compat[type_i][type_j] \\in [0.0, 1.0]\` (1.0 = fully compatible, 0.0 = completely incompatible).

Compute the $n \\times n$ **Type-Aware Similarity Matrix** $S$:
$$S_{ij} = \\cos(\\mathbf{e}_i, \\mathbf{e}_j) \\times \\text{type\\_compat}[\\text{type}_i][\\text{type}_j]$$
If $\\cos(\\mathbf{e}_i, \\mathbf{e}_j) < 0$, set the cosine term to $0.0$.
Diagonal elements $S_{ii} = 1.0$.

Return $S$ as a list of lists of floats rounded to 4 decimal places.`,
    mathematicalExplanation: `Combines metric embedding space with symbolic type ontology:
$$S_{ij} = \\max(0, \\cos(\\mathbf{e}_i, \\mathbf{e}_j)) \\cdot T(\\tau_i, \\tau_j)$$
It smoothly scales down cross-type confusion while preserving within-type metric geometry.`,
    chimeraContext: `Used in Chimera\'s graph builder to compute edge weights between entity mentions that might refer to the same concept.`,
    examples: [
      {
        input: 'entities = [{"name": "A", "type": "Tech", "embedding": [1.0, 0.0]}, {"name": "B", "type": "Bio", "embedding": [1.0, 0.0]}], type_compat = {"Tech": {"Tech": 1.0, "Bio": 0.2}, "Bio": {"Tech": 0.2, "Bio": 1.0}}',
        output: '[[1.0, 0.2], [0.2, 1.0]]',
        explanation: 'Cosine similarity is 1.0, but type compatibility is 0.2, so S[0][1] = 1.0 * 0.2 = 0.2.'
      }
    ],
    constraints: [
      '1 <= n <= 50'
    ],
    expectedComplexity: {
      time: 'O(n^2 \\cdot d)',
      space: 'O(n^2)'
    },
    starterCode: `def type_aware_similarity_matrix(entities: list[dict], type_compat: dict[str, dict[str, float]]) -> list[list[float]]:
    """
    Computes type-aware similarity matrix S_ij = max(0, cos) * type_compat.
    
    Args:
        entities: List of entity dicts.
        type_compat: 2D dictionary of type penalties.
        
    Returns:
        n x n matrix rounded to 4 decimal places.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def type_aware_similarity_matrix(entities: list[dict], type_compat: dict[str, dict[str, float]]) -> list[list[float]]:
    import math
    n = len(entities)
    norms = [math.sqrt(sum(x * x for x in e["embedding"])) for e in entities]
    
    S = [[0.0 for _ in range(n)] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i == j:
                S[i][j] = 1.0
                continue
            emb_i, emb_j = entities[i]["embedding"], entities[j]["embedding"]
            dot = sum(x * y for x, y in zip(emb_i, emb_j))
            cos = dot / (norms[i] * norms[j]) if norms[i] > 0 and norms[j] > 0 else 0.0
            cos = max(0.0, cos)
            
            t_i = entities[i]["type"]
            t_j = entities[j]["type"]
            penalty = type_compat.get(t_i, {}).get(t_j, 1.0 if t_i == t_j else 0.0)
            S[i][j] = round(cos * penalty, 4)
            
    return S
`,
    editorial: `### Algorithmic Approach

1. Precompute norms for all $n$ entity embeddings.
2. For each pair $(i, j)$:
   - If $i == j$: $S_{ii} = 1.0$.
   - Compute cosine similarity: $\\cos = \\max(0, \\text{dot} / (\\|e_i\\| \\|e_j\\|))$.
   - Retrieve type compatibility factor.
   - Multiply and round to 4 decimal places.`,
    hints: [
      'Precompute norms to avoid recomputing.',
      'Clamp cosine similarity to max(0.0, cos).',
      'Diagonal S[i][i] is always 1.0.'
    ],
    testCases: [
      {
        inputs: [
          [
            {"name": "A", "type": "Tech", "embedding": [1.0, 0.0]},
            {"name": "B", "type": "Bio", "embedding": [1.0, 0.0]}
          ],
          {
            "Tech": {"Tech": 1.0, "Bio": 0.2},
            "Bio": {"Tech": 0.2, "Bio": 1.0}
          }
        ],
        expected: [[1.0, 0.2], [0.2, 1.0]]
      }
    ],
    defaultCustomInput: '[{"name": "A", "type": "Tech", "embedding": [1.0, 0.0]}, {"name": "B", "type": "Bio", "embedding": [1.0, 0.0]}], {"Tech": {"Tech": 1.0, "Bio": 0.2}, "Bio": {"Tech": 0.2, "Bio": 1.0}}',
    suggestedVisualizer: 'matrix-heatmap'
  },
  {
    id: 'm6-p8',
    moduleId: 'module-6',
    order: 8,
    title: 'Measure Entity Resolution Precision, Recall, and F1',
    difficulty: 'Easy',
    tags: ['Evaluation Metrics', 'Precision and Recall', 'F1 Score'],
    funcName: 'evaluate_entity_resolution',
    description: `Evaluate an entity resolution pipeline by comparing predicted duplicate pairs against ground-truth duplicate pairs.

Given:
- \`predicted_pairs\`: List of predicted duplicate pairs \`[[e1, e2], ...]\`.
- \`ground_truth_pairs\`: List of true duplicate pairs \`[[e1, e2], ...]\`.

Pairs are undirected (i.e. \`["A", "B"]\` is identical to \`["B", "A"]\`). Self-pairs \`["A", "A"]\` should be ignored.

Compute:
- True Positives ($TP$): Count of predicted pairs that are in ground truth.
- False Positives ($FP$): Count of predicted pairs that are NOT in ground truth.
- False Negatives ($FN$): Count of ground truth pairs that were NOT predicted.
- Precision: $\\frac{TP}{TP + FP}$ (0.0 if $TP + FP = 0$).
- Recall: $\\frac{TP}{TP + FN}$ (0.0 if $TP + FN = 0$).
- F1-Score: $\\frac{2 \\cdot \\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}$ (0.0 if $\\text{Prec} + \\text{Rec} = 0$).

Return a dictionary \`{'precision': float, 'recall': float, 'f1': float}\` with all values rounded to 4 decimal places.`,
    mathematicalExplanation: `Standard pairwise evaluation for entity clustering:
$$\\text{Precision} = \\frac{|P \\cap G|}{|P|}, \\quad \\text{Recall} = \\frac{|P \\cap G|}{|G|}, \\quad F_1 = \\frac{2 |P \\cap G|}{|P| + |G|}$$`,
    chimeraContext: `Benchmark metric used to tune similarity thresholds in Chimera\'s entity extraction module.`,
    examples: [
      {
        input: 'predicted_pairs = [["A", "B"], ["B", "C"]], ground_truth_pairs = [["B", "A"], ["C", "D"]]',
        output: '{"precision": 0.5, "recall": 0.5, "f1": 0.5}',
        explanation: 'TP = {("A", "B")}. FP = {("B", "C")}. FN = {("C", "D")}. Prec = 1/2 = 0.5, Rec = 1/2 = 0.5, F1 = 0.5.'
      }
    ],
    constraints: [
      '0 <= len(predicted_pairs), len(ground_truth_pairs) <= 5000'
    ],
    expectedComplexity: {
      time: 'O(|P| + |G|)',
      space: 'O(|P| + |G|)'
    },
    starterCode: `def evaluate_entity_resolution(predicted_pairs: list[list[str]], ground_truth_pairs: list[list[str]]) -> dict[str, float]:
    """
    Evaluates pairwise Precision, Recall, and F1 for entity resolution.
    
    Args:
        predicted_pairs: List of [e1, e2].
        ground_truth_pairs: List of [e1, e2].
        
    Returns:
        {'precision': float, 'recall': float, 'f1': float}
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def evaluate_entity_resolution(predicted_pairs: list[list[str]], ground_truth_pairs: list[list[str]]) -> dict[str, float]:
    def canon_pair(p):
        a, b = p[0], p[1]
        return (min(a, b), max(a, b))
        
    P_set = set(canon_pair(p) for p in predicted_pairs if p[0] != p[1])
    G_set = set(canon_pair(p) for p in ground_truth_pairs if p[0] != p[1])
    
    tp = len(P_set & G_set)
    fp = len(P_set - G_set)
    fn = len(G_set - P_set)
    
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * prec * rec) / (prec + rec) if (prec + rec) > 0 else 0.0
    
    return {
        'precision': round(prec, 4),
        'recall': round(rec, 4),
        'f1': round(f1, 4)
    }
`,
    editorial: `### Algorithmic Approach

1. Normalize every pair into an ordered tuple $( \\min(u, v), \\max(u, v) )$, ignoring pairs where $u == v$.
2. Form sets $P_{\\text{set}}$ and $G_{\\text{set}}$.
3. $TP = |P \\cap G|$, $FP = |P \\setminus G|$, $FN = |G \\setminus P|$.
4. Calculate Precision, Recall, and F1.`,
    hints: [
      'Order pairs alphabetically: (min(u, v), max(u, v)).',
      'Use Python sets to find intersection & differences.',
      'Check for 0 denominators.'
    ],
    testCases: [
      {
        inputs: [[["A", "B"], ["B", "C"]], [["B", "A"], ["C", "D"]]],
        expected: {"precision": 0.5, "recall": 0.5, "f1": 0.5}
      },
      {
        inputs: [[["X", "Y"]], [["X", "Y"]]],
        expected: {"precision": 1.0, "recall": 1.0, "f1": 1.0}
      }
    ],
    defaultCustomInput: '[["A", "B"], ["B", "C"]], [["B", "A"], ["C", "D"]]',
    suggestedVisualizer: 'graph-editor'
  }
];
