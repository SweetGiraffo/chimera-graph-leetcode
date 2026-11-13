import { ModuleInfo } from '../types/problem';

export const MODULES: ModuleInfo[] = [
  {
    id: 'module-1',
    number: 1,
    title: 'Weighted Graphs and Transition Matrices',
    subtitle: 'Graph Foundations & Stochastic Matrix Representations',
    description: 'Learn how directed and weighted knowledge graphs are encoded mathematically into adjacency and row-stochastic transition matrices, handling dangling nodes, reachability, and sparse storage.',
    chimeraRole: 'Foundational representation for Chimera\'s multi-relational entity graph, mapping extracted entities into transition probabilities for propagation.',
    topics: [
      'Directed and weighted graphs',
      'Weighted adjacency matrices',
      'In-degree and out-degree',
      'Row normalization',
      'Stochastic matrices',
      'Sparse matrix representations',
      'Handling dangling/zero-degree nodes',
      'Directed reachability & SCCs'
    ],
    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    iconName: 'Network'
  },
  {
    id: 'module-2',
    number: 2,
    title: 'Markov Chains',
    subtitle: 'Stochastic Walks, Matrix Powers & Stationary Distributions',
    description: 'Master random walks, multi-step transition mechanics, eigenvalues, stationary distributions, irreducibility, and periodicity on graph structures.',
    chimeraRole: 'Underpins probability propagation over entity relationships; explains when and why iterative graph walks converge to stationary distributions.',
    topics: [
      'Markov property',
      'State transition probabilities',
      'Transition matrices & matrix powers',
      'Multi-step transition probabilities',
      'Stationary distributions',
      'Eigenvalues and eigenvectors',
      'Irreducibility & aperiodicity',
      'Empirical vs theoretical distributions'
    ],
    badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    iconName: 'Footprints'
  },
  {
    id: 'module-3',
    number: 3,
    title: 'PageRank from Scratch',
    subtitle: 'The Random Surfer Model, Teleportation & Power Iteration',
    description: 'Implement PageRank from scratch: random surfer model, damping factors, dangling node redistribution, power iteration, L1 convergence, and direct algebraic solutions.',
    chimeraRole: 'Provides global structural importance metrics for knowledge graph entities, identifying hub concepts and central facts across corpora.',
    topics: [
      'Random surfer model',
      'Link-based importance',
      'Weighted PageRank',
      'Damping factor (alpha)',
      'Teleportation & dangling nodes',
      'Power iteration algorithm',
      'L1 norm convergence criteria',
      'Closed-form linear system solution'
    ],
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    iconName: 'Activity'
  },
  {
    id: 'module-4',
    number: 4,
    title: 'Personalized PageRank (PPR)',
    subtitle: 'Query-Dependent Restart Vectors & Reverse-Edge Propagation',
    description: 'The core engine of Chimera graph retrieval: query-dependent restart distributions, multi-seed entity weighting, dead end handling, and reverse-edge decay propagation.',
    chimeraRole: 'Core Graph Retrieval Engine in Chimera: takes user query seed entities and scores all candidate graph nodes based on personalized multi-hop affinity.',
    topics: [
      'Global PageRank vs Personalized PageRank',
      'Personalization vectors',
      'Multi-seed weighted importance',
      'Multi-hop probability propagation',
      'Dead-end handling in directed graphs',
      'Weighted reverse edges (bidirectional PPR)',
      'Disconnected component analysis',
      'Query-dependent candidate generation'
    ],
    badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
    iconName: 'Target'
  },
  {
    id: 'module-5',
    number: 5,
    title: 'Graph Algorithms for Knowledge Graph Retrieval',
    subtitle: 'Neighborhood Expansion, Path Scoring & Subgraph Extraction',
    description: 'Extract multi-hop subgraphs, find most relevant evidence paths, combine relation-type weights, and contrast BFS expansion with PPR ranking.',
    chimeraRole: 'Extracts explanatory subgraphs and multi-hop reasoning chains connecting query entities to ground-truth answers in multimodal contexts.',
    topics: [
      'K-hop neighborhood expansion',
      'Shortest relationship paths',
      'Query-specific subgraph extraction',
      'Candidate entity graph scoring',
      'Relation-type edge weighting',
      'Evidence path ranking',
      'BFS vs PPR retrieval comparison',
      'Provenance tracking'
    ],
    badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    iconName: 'GitFork'
  },
  {
    id: 'module-6',
    number: 6,
    title: 'Entity Extraction and Entity Resolution',
    subtitle: 'Normalization, Cosine Similarity & Type-Aware Disambiguation',
    description: 'Implement entity normalization, fuzzy duplicate detection, cosine similarity with dense embeddings, threshold-based clustering, and type-aware disambiguation.',
    chimeraRole: 'Ingestion pipeline in Chimera: extracts mentions from PDFs, audio, and images, and links them to canonical knowledge base entities without alias contamination.',
    topics: [
      'Entity name normalization',
      'Duplicate mention detection',
      'Cosine similarity implementation',
      'Canonical embedding matching',
      'Threshold-based entity resolution',
      'False positive/negative avoidance',
      'Type-constrained entity resolution',
      'Resolution precision and recall'
    ],
    badgeColor: 'border-pink-500/30 text-pink-400 bg-pink-500/10',
    iconName: 'Fingerprint'
  },
  {
    id: 'module-7',
    number: 7,
    title: 'Knowledge Graph Construction',
    subtitle: 'Triples, Multi-Relational Edges, Co-occurrence & Provenance',
    description: 'Build heterogeneous knowledge graphs from extracted triples, merge duplicate entities, add co-occurrence edges, and track document chunk provenance.',
    chimeraRole: 'Graph storage layer in Chimera: maintains the unified cross-modal graph with metadata pointing directly back to raw chunk IDs and modality sources.',
    topics: [
      'Triple to NetworkX conversion',
      'Duplicate entity merging',
      'Node metadata management',
      'Weighted relationship edges',
      'Co-occurrence edges',
      'Source chunk & document provenance',
      'Incremental graph updates',
      'Graph serialization & persistence'
    ],
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    iconName: 'Boxes'
  },
  {
    id: 'module-8',
    number: 8,
    title: 'Hybrid Graph + Vector Retrieval',
    subtitle: 'Dense Vector Search, PPR Traversal & Reciprocal Rank Fusion',
    description: 'Combine dense vector semantic search (Qdrant style) with Personalized PageRank graph traversal using Reciprocal Rank Fusion (RRF) and score normalization.',
    chimeraRole: 'Chimera Dual-Channel Retriever: fuses semantic similarity from vector embeddings with topological connectivity from knowledge graph PPR.',
    topics: [
      'Cosine similarity vector search',
      'Top-K vector candidates',
      'Graph candidate retrieval via PPR',
      'Entity-to-chunk mapping',
      'Reciprocal Rank Fusion (RRF)',
      'Weighted score fusion vs RRF',
      'Candidate deduplication',
      'End-to-end hybrid retrieval'
    ],
    badgeColor: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
    iconName: 'Layers'
  },
  {
    id: 'module-9',
    number: 9,
    title: 'Corrective RAG and LangGraph',
    subtitle: 'Relevance Grading, Query Rewriting & State Machine Control',
    description: 'Build self-correcting retrieval loops: evaluate context relevance, branch dynamically, rewrite ambiguous queries, and construct LangGraph state machines.',
    chimeraRole: 'Chimera Self-Correcting Controller: grades retrieved context, detects hallucinations or retrieval voids, and triggers corrective retrieval cycles.',
    topics: [
      'Relevance grading logic',
      'Conditional routing & branching',
      'Query rewriting strategies',
      'Fallback retrieval mechanisms',
      'Corrective RAG (CRAG) loop',
      'LangGraph state machine design',
      'Retrieval attempt counters',
      'Infinite loop prevention'
    ],
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    iconName: 'Workflow'
  },
  {
    id: 'module-10',
    number: 10,
    title: 'Retrieval Evaluation and Research',
    subtitle: 'Precision@K, Recall@K, MRR, NDCG & Ablation Studies',
    description: 'Quantify retrieval quality with information retrieval metrics, execute parameter sweeps on damping factors and reverse edges, and design ablation experiments.',
    chimeraRole: 'Evaluation framework for Chimera M.Tech research: validates whether hybrid Graph+Vector+CRAG outperforms standard vector-only baselines.',
    topics: [
      'Precision@K and Recall@K',
      'Mean Reciprocal Rank (MRR)',
      'NDCG@K calculation',
      'Statistical comparison of retrievers',
      'Benchmark runner implementation',
      'Damping factor parameter sweep',
      'Reverse-edge weight sensitivity',
      'Ablation study design'
    ],
    badgeColor: 'border-teal-500/30 text-teal-400 bg-teal-500/10',
    iconName: 'BarChart3'
  },
  {
    id: 'module-chimera-lab',
    number: 11,
    title: 'Chimera Research Lab',
    subtitle: 'End-to-End Cross-Modal Knowledge Graph RAG Pipeline',
    description: 'Cap-stone research challenges integrating multimodal parsing, entity resolution, multi-relational KG construction, reverse-augmented PPR, hybrid RRF, and LangGraph CRAG.',
    chimeraRole: 'The ultimate M.Tech research synthesis: builds the complete, functional Chimera retrieval pipeline step-by-step from raw multimodal data to verified context.',
    topics: [
      'Multimodal ingestion & entity linking',
      'Cross-modal entity resolution',
      'Multi-relational graph with provenance',
      'Query seed extraction & personalization',
      'Reverse-edge augmented PPR',
      'Dual-channel dense + graph retrieval',
      'Reciprocal Rank Fusion chunk aggregation',
      'Self-correcting relevance grader',
      'LangGraph CRAG state machine',
      'End-to-end Chimera pipeline benchmark'
    ],
    badgeColor: 'border-violet-500/30 text-violet-400 bg-violet-500/10',
    iconName: 'FlaskConical'
  }
];
