import { Problem } from '../../types/problem';

export const MODULE_9_PROBLEMS: Problem[] = [
  {
    id: 'm9-p1',
    moduleId: 'module-9',
    order: 1,
    title: 'Implement a Basic Relevance Grader',
    difficulty: 'Easy',
    tags: ['CRAG', 'Relevance Grader', 'Confidence Score'],
    funcName: 'grade_document_relevance',
    description: `In **Corrective RAG (CRAG)**, retrieved context passages must be independently evaluated for semantic relevance before being passed to the generator.

Given:
- A query string \`query\`.
- A retrieved document chunk text \`chunk_text\`.
- A list of required key entities/keywords \`query_keywords\`.
- Cosine semantic similarity score \`sim_score \\in [0.0, 1.0]\` between query and chunk.

Grading Rules:
1. Compute the **keyword match ratio**: fraction of \`query_keywords\` appearing in \`chunk_text\` (case-insensitive). If \`query_keywords\` is empty, ratio is 1.0.
2. Composite Score: $\\text{score} = 0.6 \\times \\text{sim\\_score} + 0.4 \\times \\text{keyword\\_ratio}$.
3. Grade Classification:
   - If $\\text{score} \\ge 0.70$: \`"CORRECT"\` (relevant).
   - If $0.40 \\le \\text{score} < 0.70$: \`"AMBIGUOUS"\` (needs query refinement or secondary retrieval).
   - If $\\text{score} < 0.40$: \`"INCORRECT"\` (irrelevant).

Return a tuple \`(grade: str, round(score, 4))\`.`,
    mathematicalExplanation: `Relevance grading evaluates posterior sufficiency:
$$\\mathcal{G}(q, d) = \\begin{cases} \\text{CORRECT} & S(q, d) \\ge \\theta_{\\text{high}} \\\\ \\text{AMBIGUOUS} & \\theta_{\\text{low}} \\le S(q, d) < \\theta_{\\text{high}} \\\\ \\text{INCORRECT} & S(q, d) < \\theta_{\\text{low}} \\end{cases}$$`,
    chimeraContext: `The decision gate inside Chimera\'s LangGraph controller preventing hallucinations from irrelevant documents.`,
    examples: [
      {
        input: 'query = "What is CUDA?", chunk_text = "CUDA is a parallel computing platform developed by NVIDIA.", query_keywords = ["cuda", "nvidia"], sim_score = 0.85',
        output: '("CORRECT", 0.91)',
        explanation: 'Both keywords match (1.0). Score = 0.6*0.85 + 0.4*1.0 = 0.51 + 0.40 = 0.91 >= 0.70.'
      }
    ],
    constraints: [
      '0.0 <= sim_score <= 1.0'
    ],
    expectedComplexity: {
      time: 'O(|chunk_text|)',
      space: 'O(1)'
    },
    starterCode: `def grade_document_relevance(query: str, chunk_text: str, query_keywords: list[str], sim_score: float) -> tuple[str, float]:
    """
    Grades chunk relevance into CORRECT, AMBIGUOUS, or INCORRECT.
    
    Args:
        query: Query string.
        chunk_text: Document chunk.
        query_keywords: Key terms to match.
        sim_score: Semantic similarity.
        
    Returns:
        (grade, composite_score)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def grade_document_relevance(query: str, chunk_text: str, query_keywords: list[str], sim_score: float) -> tuple[str, float]:
    text_lower = chunk_text.lower()
    if query_keywords:
        matches = sum(1 for kw in query_keywords if kw.lower() in text_lower)
        kw_ratio = matches / len(query_keywords)
    else:
        kw_ratio = 1.0
        
    score = 0.6 * sim_score + 0.4 * kw_ratio
    if score >= 0.70:
        grade = "CORRECT"
    elif score >= 0.40:
        grade = "AMBIGUOUS"
    else:
        grade = "INCORRECT"
        
    return grade, round(score, 4)
`,
    editorial: `### Algorithmic Approach

1. Lowercase chunk text.
2. Count keyword occurrences and calculate ratio.
3. Compute weighted composite score $0.6 \\times \\text{sim} + 0.4 \\times \\text{ratio}$.
4. Bucket into CORRECT / AMBIGUOUS / INCORRECT.`,
    hints: [
      'Check for lowercase keyword substring matches.',
      'Compute composite score = 0.6 * sim_score + 0.4 * kw_ratio.',
      'Bucket by thresholds 0.70 and 0.40.'
    ],
    testCases: [
      {
        inputs: [
          "What is CUDA?",
          "CUDA is a parallel computing platform developed by NVIDIA.",
          ["cuda", "nvidia"],
          0.85
        ],
        expected: ["CORRECT", 0.91]
      },
      {
        inputs: ["Deep Learning", "Cooking Italian Pasta recipe", ["deep", "learning"], 0.1],
        expected: ["INCORRECT", 0.06]
      }
    ],
    defaultCustomInput: '"What is CUDA?", "CUDA is developed by NVIDIA.", ["cuda", "nvidia"], 0.85',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm9-p2',
    moduleId: 'module-9',
    order: 2,
    title: 'Conditional Branch Routing for Documents',
    difficulty: 'Easy',
    tags: ['Routing', 'LangGraph Edges', 'Control Flow'],
    funcName: 'route_retrieval_action',
    description: `Given a collection of graded documents \`doc_grades = [{'chunk_id': str, 'grade': str}, ...]\`:
Determine the next action for the RAG pipeline controller:
1. If at least $50\\%$ of documents are rated \`"CORRECT"\`: return \`"GENERATE"\` (proceed to answer generation).
2. If the majority of documents are \`"AMBIGUOUS"\` (or equal tie with INCORRECT): return \`"REWRITE_QUERY"\` (rewrite query and retry).
3. If more than $50\\%$ of documents are \`"INCORRECT"\`: return \`"FALLBACK_SEARCH"\` (trigger external web/broad search).
4. If \`doc_grades\` is empty, return \`"FALLBACK_SEARCH"\`.`,
    mathematicalExplanation: `State machine transition condition:
$$\\delta(s_{\\text{graded}}) = \\begin{cases} \\text{GENERATE} & P(\\text{CORRECT}) \\ge 0.5 \\\\ \\text{FALLBACK} & P(\\text{INCORRECT}) > 0.5 \\\\ \\text{REWRITE} & \\text{otherwise} \\end{cases}$$`,
    chimeraContext: `Conditional edge router in Chimera\'s LangGraph workflow graph.`,
    examples: [
      {
        input: 'doc_grades = [{"chunk_id": "c1", "grade": "CORRECT"}, {"chunk_id": "c2", "grade": "CORRECT"}]',
        output: '"GENERATE"',
        explanation: '100% of docs are CORRECT, so proceed to GENERATE.'
      }
    ],
    constraints: [
      '0 <= len(doc_grades) <= 100'
    ],
    expectedComplexity: {
      time: 'O(N)',
      space: 'O(1)'
    },
    starterCode: `def route_retrieval_action(doc_grades: list[dict]) -> str:
    """
    Routes control flow based on document grades distribution.
    
    Args:
        doc_grades: [{'chunk_id', 'grade'}, ...]
        
    Returns:
        One of 'GENERATE', 'REWRITE_QUERY', 'FALLBACK_SEARCH'.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def route_retrieval_action(doc_grades: list[dict]) -> str:
    if not doc_grades:
        return "FALLBACK_SEARCH"
        
    n = len(doc_grades)
    c_count = sum(1 for d in doc_grades if d["grade"] == "CORRECT")
    i_count = sum(1 for d in doc_grades if d["grade"] == "INCORRECT")
    a_count = sum(1 for d in doc_grades if d["grade"] == "AMBIGUOUS")
    
    if c_count / n >= 0.5:
        return "GENERATE"
    if i_count / n > 0.5:
        return "FALLBACK_SEARCH"
    return "REWRITE_QUERY"
`,
    editorial: `### Algorithmic Approach

1. Handle empty input by returning \`"FALLBACK_SEARCH"\`.
2. Count occurrences of CORRECT, INCORRECT, AMBIGUOUS.
3. If CORRECT / n >= 0.5 $\\to$ GENERATE.
4. If INCORRECT / n > 0.5 $\\to$ FALLBACK_SEARCH.
5. Otherwise $\\to$ REWRITE_QUERY.`,
    hints: [
      'Count occurrences of each grade.',
      'Check if correct_count / total >= 0.5.',
      'Check if incorrect_count / total > 0.5.'
    ],
    testCases: [
      {
        inputs: [[{"chunk_id": "c1", "grade": "CORRECT"}, {"chunk_id": "c2", "grade": "CORRECT"}]],
        expected: "GENERATE"
      },
      {
        inputs: [[{"chunk_id": "c1", "grade": "INCORRECT"}, {"chunk_id": "c2", "grade": "INCORRECT"}]],
        expected: "FALLBACK_SEARCH"
      },
      {
        inputs: [[{"chunk_id": "c1", "grade": "AMBIGUOUS"}, {"chunk_id": "c2", "grade": "INCORRECT"}]],
        expected: "REWRITE_QUERY"
      }
    ],
    defaultCustomInput: '[{"chunk_id": "c1", "grade": "CORRECT"}, {"chunk_id": "c2", "grade": "CORRECT"}]',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm9-p3',
    moduleId: 'module-9',
    order: 3,
    title: 'Implement Query Rewriting with Knowledge Graph Entities',
    difficulty: 'Medium',
    tags: ['Query Rewriting', 'Entity Expansion', 'Query Reformulation'],
    funcName: 'rewrite_query_with_entities',
    description: `When retrieval returns ambiguous context, rewriting the query by incorporating related canonical entities expands retrieval coverage.

Given:
- Original query string \`query\`.
- List of related entities extracted from graph \`graph_entities = [str, ...]\`.
- Dictionary of entity synonyms: \`synonyms = {entity: [alias1, alias2], ...}\`.

Rules:
1. Append up to 3 non-duplicate related entities to the query as keyword boosters:
   \`" {entity1} {entity2} ..."\`
2. If any entity has synonyms in \`synonyms\`, add the first synonym in parentheses:
   \`" {entity} ({synonym})"\`
3. Normalize multiple whitespace into single spaces and strip.

Return the rewritten query string.`,
    mathematicalExplanation: `Query reformulation via pseudo-relevance feedback:
$$q' = q \\cup \\text{Top3}(\\mathcal{V}_{PPR}(q)) \\cup \\text{Synonyms}$$`,
    chimeraContext: `Rewrites queries that fail initial vector retrieval in Chimera\'s self-correcting loop.`,
    examples: [
      {
        input: 'query = "How to train LLMs?", graph_entities = ["Transformer", "GPU"], synonyms = {"GPU": ["Graphics Processing Unit"]}',
        output: '"How to train LLMs? Transformer GPU (Graphics Processing Unit)"',
        explanation: 'Expands query with top entities and synonym.'
      }
    ],
    constraints: [
      '1 <= len(query) <= 200'
    ],
    expectedComplexity: {
      time: 'O(|query| + |entities|)',
      space: 'O(1)'
    },
    starterCode: `def rewrite_query_with_entities(query: str, graph_entities: list[str], synonyms: dict[str, list[str]]) -> str:
    """
    Expands query with top graph entities and canonical synonyms.
    
    Args:
        query: Original user query.
        graph_entities: Related entities from graph.
        synonyms: {entity: [synonyms]}
        
    Returns:
        Expanded query string.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def rewrite_query_with_entities(query: str, graph_entities: list[str], synonyms: dict[str, list[str]]) -> str:
    additions = []
    seen = set()
    for e in graph_entities:
        if e.lower() not in seen:
            seen.add(e.lower())
            syn_list = synonyms.get(e, [])
            if syn_list:
                additions.append(f"{e} ({syn_list[0]})")
            else:
                additions.append(e)
            if len(additions) == 3:
                break
                
    parts = [query.strip()] + additions
    return " ".join(" ".join(parts).split())
`,
    editorial: `### Algorithmic Approach

1. Iterate through \`graph_entities\`, keeping up to 3 unique entities.
2. If entity has synonyms, format as \`"{entity} ({syn[0]})"\`.
3. Join with original query and normalize whitespace.`,
    hints: [
      'Track seen entities in lowercase.',
      'Append at most 3 entities.',
      'Use " ".join(text.split()) to collapse whitespace.'
    ],
    testCases: [
      {
        inputs: [
          "How to train LLMs?",
          ["Transformer", "GPU"],
          {"GPU": ["Graphics Processing Unit"]}
        ],
        expected: "How to train LLMs? Transformer GPU (Graphics Processing Unit)"
      }
    ],
    defaultCustomInput: '"How to train LLMs?", ["Transformer", "GPU"], {"GPU": ["Graphics Processing Unit"]}',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm9-p4',
    moduleId: 'module-9',
    order: 4,
    title: 'Build a Retrieval Fallback Mechanism',
    difficulty: 'Easy',
    tags: ['Fallback Search', 'Error Handling', 'CRAG'],
    funcName: 'execute_fallback_retrieval',
    description: `When local vector and graph retrieval fail to find relevant chunks (e.g. out-of-domain query), the system must fallback to global retrieval or web search.

Given:
- \`local_candidates = [{'chunk_id': str, 'score': float}, ...]\`.
- \`fallback_candidates = [{'chunk_id': str, 'score': float}, ...]\`.
- Quality threshold \`min_quality = 0.50\`.

1. If any local candidate has \`score >= min_quality\`:
   Return \`('LOCAL', local_candidates)\`.
2. Otherwise:
   Return \`('FALLBACK', fallback_candidates)\`.`,
    mathematicalExplanation: `Defensive retrieval policy:
$$\\mathcal{R}^*(q) = \\begin{cases} \\mathcal{R}_{\\text{local}}(q) & \\max s(q, d) \\ge \\tau \\\\ \\mathcal{R}_{\\text{fallback}}(q) & \\text{otherwise} \\end{cases}$$`,
    chimeraContext: `Guarantees reliable answers when Chimera encounters questions unaddressed by the uploaded local documents.`,
    examples: [
      {
        input: 'local_candidates = [{"chunk_id": "c1", "score": 0.3}], fallback_candidates = [{"chunk_id": "web1", "score": 0.8}], min_quality = 0.50',
        output: '("FALLBACK", [{"chunk_id": "web1", "score": 0.8}])',
        explanation: 'Local max is 0.3 < 0.50, triggering fallback.'
      }
    ],
    constraints: [
      'min_quality > 0'
    ],
    expectedComplexity: {
      time: 'O(|local|)',
      space: 'O(1)'
    },
    starterCode: `def execute_fallback_retrieval(local_candidates: list[dict], fallback_candidates: list[dict], min_quality: float = 0.50) -> tuple[str, list[dict]]:
    """
    Selects between local and fallback retrieval based on quality threshold.
    
    Args:
        local_candidates: Local retrieval results.
        fallback_candidates: Fallback results.
        min_quality: Threshold.
        
    Returns:
        (source_used, selected_candidates)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def execute_fallback_retrieval(local_candidates: list[dict], fallback_candidates: list[dict], min_quality: float = 0.50) -> tuple[str, list[dict]]:
    has_good_local = any(c.get("score", 0.0) >= min_quality for c in local_candidates)
    if has_good_local:
        return "LOCAL", local_candidates
    return "FALLBACK", fallback_candidates
`,
    editorial: `### Algorithmic Approach

1. Check if \`any(c['score'] >= min_quality for c in local_candidates)\`.
2. If True, return \`("LOCAL", local_candidates)\`.
3. Else return \`("FALLBACK", fallback_candidates)\`.`,
    hints: [
      'Use Python any() function.',
      'Check if maximum local score >= min_quality.'
    ],
    testCases: [
      {
        inputs: [
          [{"chunk_id": "c1", "score": 0.3}],
          [{"chunk_id": "web1", "score": 0.8}],
          0.50
        ],
        expected: ["FALLBACK", [{"chunk_id": "web1", "score": 0.8}]]
      },
      {
        inputs: [
          [{"chunk_id": "c1", "score": 0.9}],
          [{"chunk_id": "web1", "score": 0.8}],
          0.50
        ],
        expected: ["LOCAL", [{"chunk_id": "c1", "score": 0.9}]]
      }
    ],
    defaultCustomInput: '[{"chunk_id": "c1", "score": 0.3}], [{"chunk_id": "web1", "score": 0.8}], 0.5',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm9-p5',
    moduleId: 'module-9',
    order: 5,
    title: 'Implement a Simple Corrective RAG Loop',
    difficulty: 'Medium',
    tags: ['CRAG Loop', 'State Machine', 'Self-Correction'],
    funcName: 'run_crag_loop',
    description: `Implement the full Corrective RAG state loop:
1. Initialize \`attempt = 1\` and \`current_query = initial_query\`.
2. While \`attempt <= max_attempts\`:
   - Run mock retrieval function: \`retrieval_fn(current_query)\` returning \`docs\`.
   - Run grading function: \`grader_fn(docs)\` returning \`grade\` (\`"CORRECT"\`, \`"AMBIGUOUS"\`, or \`"INCORRECT"\`).
   - If \`grade == "CORRECT"\`: return \`{'status': 'SUCCESS', 'final_docs': docs, 'attempts': attempt}\`.
   - If \`grade == "AMBIGUOUS"\`: rewrite query using \`rewriter_fn(current_query)\` and increment \`attempt\`.
   - If \`grade == "INCORRECT"\`: break and fallback.
3. Fallback: run \`fallback_fn(initial_query)\` and return \`{'status': 'FALLBACK', 'final_docs': fallback_docs, 'attempts': attempt}\`.

Write \`run_crag_loop\` orchestrating this loop.`,
    mathematicalExplanation: `Self-correcting feedback controller:
$$S_{t+1} = \\delta(S_t, \\mathcal{G}(\\mathcal{R}(q_t)))$$
bounded by iteration horizon $T_{\\max}$.`,
    chimeraContext: `The core controller loop coordinating retrieval correction in Chimera.`,
    examples: [
      {
        input: 'initial_query = "q", max_attempts = 2',
        output: '{"status": "SUCCESS", "attempts": 1, ...}',
        explanation: 'First attempt succeeds immediately.'
      }
    ],
    constraints: [
      'max_attempts >= 1'
    ],
    expectedComplexity: {
      time: 'O(T \\cdot \\text{retrieval})',
      space: 'O(1)'
    },
    starterCode: `def run_crag_loop(initial_query: str, retrieval_fn, grader_fn, rewriter_fn, fallback_fn, max_attempts: int = 3) -> dict:
    """
    Executes a multi-turn Corrective RAG loop.
    
    Args:
        initial_query: User query.
        retrieval_fn: Callable(query) -> list[str]
        grader_fn: Callable(docs) -> 'CORRECT'|'AMBIGUOUS'|'INCORRECT'
        rewriter_fn: Callable(query) -> str
        fallback_fn: Callable(query) -> list[str]
        max_attempts: Loop limit.
        
    Returns:
        {'status': str, 'final_docs': list[str], 'attempts': int}
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def run_crag_loop(initial_query: str, retrieval_fn, grader_fn, rewriter_fn, fallback_fn, max_attempts: int = 3) -> dict:
    current_query = initial_query
    attempt = 1
    
    while attempt <= max_attempts:
        docs = retrieval_fn(current_query)
        grade = grader_fn(docs)
        
        if grade == "CORRECT":
            return {
                "status": "SUCCESS",
                "final_docs": docs,
                "attempts": attempt
            }
        elif grade == "AMBIGUOUS":
            attempt += 1
            if attempt <= max_attempts:
                current_query = rewriter_fn(current_query)
        else: # INCORRECT
            break
            
    fallback_docs = fallback_fn(initial_query)
    return {
        "status": "FALLBACK",
        "final_docs": fallback_docs,
        "attempts": attempt
    }
`,
    editorial: `### Algorithmic Approach

1. Loop while $attempt \\le max\\_attempts$.
2. Retrieve docs, grade docs.
3. If CORRECT $\\to$ return SUCCESS.
4. If AMBIGUOUS $\\to$ rewrite query and increment attempt.
5. If INCORRECT $\\to$ break to fallback.
6. Return FALLBACK result.`,
    hints: [
      'Check grade == "CORRECT" to return SUCCESS.',
      'Increment attempt and rewrite query on AMBIGUOUS.',
      'Trigger fallback on INCORRECT or attempt exhaustion.'
    ],
    testCases: [
      {
        inputs: [
          "test query",
          "lambda q: ['doc1']",
          "lambda docs: 'CORRECT'",
          "lambda q: q + ' rewritten'",
          "lambda q: ['fallback']",
          3
        ],
        expected: {"status": "SUCCESS", "final_docs": ["doc1"], "attempts": 1}
      }
    ],
    defaultCustomInput: '"test query", lambda q: ["doc1"], lambda docs: "CORRECT", lambda q: q, lambda q: ["fb"], 3',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm9-p6',
    moduleId: 'module-9',
    order: 6,
    title: 'Construct a LangGraph State Machine',
    difficulty: 'Hard',
    tags: ['LangGraph', 'State Machine', 'Workflow Graph'],
    funcName: 'execute_langgraph_workflow',
    description: `**LangGraph** models agentic workflows as directed state graphs:
- **State**: A dictionary holding messages, retrieved documents, query, iteration counter.
- **Nodes**: Functions that accept the current state and return state updates.
- **Conditional Edges**: Decision functions routing execution to the next node.

Implement a state machine execution loop:
1. \`state\`: \`{'query': str, 'docs': list[str], 'grade': str, 'step_count': int, 'final_answer': str}\`.
2. Nodes:
   - \`retrieve_node(state)\`: fetches docs.
   - \`grade_node(state)\`: sets \`state['grade']\`.
   - \`generate_node(state)\`: creates \`final_answer\`.
   - \`rewrite_node(state)\`: modifies \`query\`.
3. Routing:
   - After \`grade_node\`:
     - If grade is \`"CORRECT"\` $\\to$ transition to \`generate_node\`.
     - Else if \`step_count < 3\` $\\to$ transition to \`rewrite_node\` (which then routes to \`retrieve_node\`).
     - Else $\\to$ transition to \`generate_node\` (forced completion).

Return the terminal state dictionary.`,
    mathematicalExplanation: `A workflow graph is a Mealy state automaton $(\\mathcal{S}, \\Sigma, \\delta, \\lambda)$ where nodes apply state updates $\\lambda: \\mathcal{S} \\to \\mathcal{S}$ and conditional edges implement transition function $\\delta: \\mathcal{S} \\to \\mathcal{N}$.`,
    chimeraContext: `The production orchestration framework managing multimodal ingestion, retrieval, and generation cycles in Chimera.`,
    examples: [
      {
        input: 'initial_state = {"query": "Q", "docs": [], "grade": "", "step_count": 0, "final_answer": ""}',
        output: '{"query": "Q", "docs": ["doc_Q"], "grade": "CORRECT", "step_count": 1, "final_answer": "Answer based on doc_Q"}',
        explanation: 'State runs through retrieve -> grade -> generate to completion.'
      }
    ],
    constraints: [
      'step_count bounded <= 10'
    ],
    expectedComplexity: {
      time: 'O(\\text{steps})',
      space: 'O(|state|)'
    },
    starterCode: `def execute_langgraph_workflow(initial_state: dict) -> dict:
    """
    Executes a LangGraph-style workflow state machine.
    
    Args:
        initial_state: State dictionary.
        
    Returns:
        Terminal state dictionary.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def execute_langgraph_workflow(initial_state: dict) -> dict:
    state = dict(initial_state)
    current_node = "retrieve"
    
    while current_node != "END" and state["step_count"] < 10:
        state["step_count"] += 1
        
        if current_node == "retrieve":
            state["docs"] = [f"doc_{state['query']}"]
            current_node = "grade"
            
        elif current_node == "grade":
            # Deterministic rule for mock
            if "bad" in state["query"]:
                state["grade"] = "INCORRECT"
            else:
                state["grade"] = "CORRECT"
                
            # Conditional Edge
            if state["grade"] == "CORRECT":
                current_node = "generate"
            elif state["step_count"] < 3:
                current_node = "rewrite"
            else:
                current_node = "generate"
                
        elif current_node == "rewrite":
            state["query"] = state["query"].replace("bad", "fixed")
            current_node = "retrieve"
            
        elif current_node == "generate":
            state["final_answer"] = f"Answer based on {state['docs'][0]}"
            current_node = "END"
            
    return state
`,
    editorial: `### Algorithmic Approach

1. Maintain \`current_node\` pointer and \`state\` dictionary.
2. Step through nodes: \`retrieve\`, \`grade\`, \`rewrite\`, \`generate\`.
3. In \`grade\`, apply conditional routing logic.
4. Stop when \`current_node == "END"\` and return terminal state.`,
    hints: [
      'Use a while loop with current_node != "END".',
      'Update state["step_count"] += 1 in each cycle.',
      'Check conditions after grade node to decide whether to rewrite or generate.'
    ],
    testCases: [
      {
        inputs: [{"query": "Q", "docs": [], "grade": "", "step_count": 0, "final_answer": ""}],
        expected: {
          "query": "Q",
          "docs": ["doc_Q"],
          "grade": "CORRECT",
          "step_count": 3,
          "final_answer": "Answer based on doc_Q"
        }
      }
    ],
    defaultCustomInput: '{"query": "Q", "docs": [], "grade": "", "step_count": 0, "final_answer": ""}',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm9-p7',
    moduleId: 'module-9',
    order: 7,
    title: 'Track Retrieval Attempts and Revision History',
    difficulty: 'Easy',
    tags: ['Auditing', 'Revision History', 'Observability'],
    funcName: 'track_revision_history',
    description: `For debugging and transparency, Chimera logs every intermediate retrieval attempt:
- Query text tried at attempt $t$.
- Retrieved document IDs.
- Assigned relevance grade.

Given an existing history list:
\`history = [{'attempt': int, 'query': str, 'doc_ids': list[str], 'grade': str}, ...]\`
and a new attempt log:
\`new_log = {'query': str, 'doc_ids': list[str], 'grade': str}\`

Append the new log to \`history\` with \`attempt = len(history) + 1\`.
Return the updated history list.`,
    mathematicalExplanation: `Trajectory logging for multi-agent auditing:
$$\\mathcal{T} = \\{ (t, q_t, \\mathcal{D}_t, g_t) \\}_{t=1}^T$$`,
    chimeraContext: `Provides full observability in LangSmith / LangGraph Studio for Chimera research experiments.`,
    examples: [
      {
        input: 'history = [], new_log = {"query": "q1", "doc_ids": ["c1"], "grade": "AMBIGUOUS"}',
        output: '[{"attempt": 1, "query": "q1", "doc_ids": ["c1"], "grade": "AMBIGUOUS"}]',
        explanation: 'Assigns attempt = 1 to the first log.'
      }
    ],
    constraints: [
      '0 <= len(history) <= 50'
    ],
    expectedComplexity: {
      time: 'O(1)',
      space: 'O(1)'
    },
    starterCode: `def track_revision_history(history: list[dict], new_log: dict) -> list[dict]:
    """
    Appends new retrieval attempt to revision history.
    
    Args:
        history: Existing attempt logs.
        new_log: {'query', 'doc_ids', 'grade'}
        
    Returns:
        Updated history.
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def track_revision_history(history: list[dict], new_log: dict) -> list[dict]:
    updated = list(history)
    entry = {
        "attempt": len(updated) + 1,
        "query": new_log["query"],
        "doc_ids": new_log["doc_ids"],
        "grade": new_log["grade"]
    }
    updated.append(entry)
    return updated
`,
    editorial: `### Algorithmic Approach

1. Create a copy of existing history.
2. Construct new record with \`attempt = len(history) + 1\`.
3. Append and return.`,
    hints: [
      'Set attempt = len(history) + 1.',
      'Append the new dictionary to history and return.'
    ],
    testCases: [
      {
        inputs: [[], {"query": "q1", "doc_ids": ["c1"], "grade": "AMBIGUOUS"}],
        expected: [{"attempt": 1, "query": "q1", "doc_ids": ["c1"], "grade": "AMBIGUOUS"}]
      }
    ],
    defaultCustomInput: '[], {"query": "q1", "doc_ids": ["c1"], "grade": "AMBIGUOUS"}',
    suggestedVisualizer: 'hybrid-comparator'
  },
  {
    id: 'm9-p8',
    moduleId: 'module-9',
    order: 8,
    title: 'Prevent Infinite Corrective Loops with Confidence Gating',
    difficulty: 'Medium',
    tags: ['Infinite Loop Prevention', 'Guardrails', 'LangGraph'],
    funcName: 'evaluate_termination_guard',
    description: `A dangerous bug in agentic RAG is an **infinite loop**: if queries repeatedly receive an \`"AMBIGUOUS"\` grade, the controller rewrites forever.

Given:
- Current attempt count \`current_attempt\`.
- Maximum attempt limit \`max_attempts = 3\`.
- History of confidence scores from each attempt: \`scores_history = [s_1, s_2, ...]\`.
- Stagnation tolerance \`stagnation_threshold = 0.02\`.

Termination Rules:
1. **Max-Attempt Guard:** If \`current_attempt >= max_attempts\`, terminate immediately: return \`("TERMINATE", "MAX_ATTEMPTS_REACHED")\`.
2. **Stagnation Guard:** If there are at least 2 attempts, and the score improvement $\\Delta = s_{\\text{curr}} - s_{\\text{prev}} < \\text{stagnation\\_threshold}$, terminate immediately: return \`("TERMINATE", "SCORE_STAGNATION")\`.
3. **Success Guard:** If $s_{\\text{curr}} \\ge 0.85$, terminate with success: return \`("TERMINATE", "CONFIDENCE_ACHIEVED")\`.
4. Otherwise: continue execution: return \`("CONTINUE", "RETRY_ALLOWED")\`.`,
    mathematicalExplanation: `Stopping criteria for iterative optimization:
$$\\text{Stop} \\iff t \\ge T_{\\max} \\;\\lor\\; s_t \\ge \\tau_{\\text{target}} \\;\\lor\\; (s_t - s_{t-1} < \\epsilon)$$`,
    chimeraContext: `Guarantees that Chimera responds within SLA latency budgets and never hangs on unresolved ambiguities.`,
    examples: [
      {
        input: 'current_attempt = 2, max_attempts = 3, scores_history = [0.45, 0.46], stagnation_threshold = 0.02',
        output: '("TERMINATE", "SCORE_STAGNATION")',
        explanation: 'Improvement is 0.46 - 0.45 = 0.01 < 0.02, triggering stagnation guard.'
      }
    ],
    constraints: [
      'current_attempt >= 1',
      'len(scores_history) >= 1'
    ],
    expectedComplexity: {
      time: 'O(1)',
      space: 'O(1)'
    },
    starterCode: `def evaluate_termination_guard(current_attempt: int, max_attempts: int, scores_history: list[float], stagnation_threshold: float = 0.02) -> tuple[str, str]:
    """
    Evaluates termination guards for self-correcting RAG loops.
    
    Args:
        current_attempt: 1-based attempt counter.
        max_attempts: Hard limit.
        scores_history: List of scores so far.
        stagnation_threshold: Minimum improvement required.
        
    Returns:
        (action, reason)
    """
    # Write your solution here
    pass
`,
    referenceSolution: `def evaluate_termination_guard(current_attempt: int, max_attempts: int, scores_history: list[float], stagnation_threshold: float = 0.02) -> tuple[str, str]:
    curr_score = scores_history[-1]
    
    # 1. Success guard
    if curr_score >= 0.85:
        return "TERMINATE", "CONFIDENCE_ACHIEVED"
        
    # 2. Max attempts guard
    if current_attempt >= max_attempts:
        return "TERMINATE", "MAX_ATTEMPTS_REACHED"
        
    # 3. Stagnation guard
    if len(scores_history) >= 2:
        diff = curr_score - scores_history[-2]
        if diff < stagnation_threshold:
            return "TERMINATE", "SCORE_STAGNATION"
            
    return "CONTINUE", "RETRY_ALLOWED"
`,
    editorial: `### Algorithmic Approach

1. Check if current score $\\ge 0.85$ (CONFIDENCE_ACHIEVED).
2. Check if current attempt $\\ge$ max_attempts (MAX_ATTEMPTS_REACHED).
3. If at least 2 attempts exist, check if improvement $< stagnation\\_threshold$ (SCORE_STAGNATION).
4. Otherwise return CONTINUE.`,
    hints: [
      'Check confidence >= 0.85 first.',
      'Check attempt >= max_attempts.',
      'Compare scores_history[-1] - scores_history[-2] for stagnation.'
    ],
    testCases: [
      {
        inputs: [2, 3, [0.45, 0.46], 0.02],
        expected: ["TERMINATE", "SCORE_STAGNATION"]
      },
      {
        inputs: [1, 3, [0.90], 0.02],
        expected: ["TERMINATE", "CONFIDENCE_ACHIEVED"]
      },
      {
        inputs: [3, 3, [0.5, 0.6], 0.02],
        expected: ["TERMINATE", "MAX_ATTEMPTS_REACHED"]
      },
      {
        inputs: [1, 3, [0.5], 0.02],
        expected: ["CONTINUE", "RETRY_ALLOWED"]
      }
    ],
    defaultCustomInput: '2, 3, [0.45, 0.46], 0.02',
    suggestedVisualizer: 'hybrid-comparator'
  }
];
