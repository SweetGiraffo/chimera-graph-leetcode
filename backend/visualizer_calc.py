import numpy as np
from typing import List, Dict, Any

def compute_transition_matrix(nodes: List[str], edges: List[Dict[str, Any]]):
    """
    Computes weighted adjacency matrix and row-stochastic transition matrix.
    Edges: [{'source': 'A', 'target': 'B', 'weight': 2.0}, ...]
    """
    n = len(nodes)
    node_to_idx = {name: i for i, name in enumerate(nodes)}
    adj = np.zeros((n, n), dtype=float)
    
    for e in edges:
        u = node_to_idx.get(e['source'])
        v = node_to_idx.get(e['target'])
        w = float(e.get('weight', 1.0))
        if u is not None and v is not None:
            adj[u, v] += w
            
    out_degrees = adj.sum(axis=1)
    in_degrees = adj.sum(axis=0)
    
    stochastic = np.zeros((n, n), dtype=float)
    dangling_nodes = []
    
    for i in range(n):
        if out_degrees[i] > 0:
            stochastic[i] = adj[i] / out_degrees[i]
        else:
            dangling_nodes.append(nodes[i])
            stochastic[i] = np.ones(n) / n  # Standard uniform teleportation for dangling nodes

    return {
        "nodes": nodes,
        "adjacency_matrix": adj.tolist(),
        "out_degrees": out_degrees.tolist(),
        "in_degrees": in_degrees.tolist(),
        "stochastic_matrix": stochastic.tolist(),
        "dangling_nodes": dangling_nodes
    }

def simulate_markov_steps(nodes: List[str], stochastic_matrix: List[List[float]], start_node: str, steps: int = 25):
    """Simulates a random walk on the Markov chain and returns the visited path and empirical distribution."""
    n = len(nodes)
    node_to_idx = {name: i for i, name in enumerate(nodes)}
    P = np.array(stochastic_matrix, dtype=float)
    
    curr = node_to_idx.get(start_node, 0)
    path = [nodes[curr]]
    counts = np.zeros(n, dtype=int)
    counts[curr] += 1
    
    np.random.seed(42) # Deterministic preview if needed, can vary
    for _ in range(steps):
        row_probs = P[curr]
        if row_probs.sum() == 0:
            next_idx = np.random.choice(n)
        else:
            row_probs = row_probs / row_probs.sum()
            next_idx = np.random.choice(n, p=row_probs)
        curr = next_idx
        path.append(nodes[curr])
        counts[curr] += 1
        
    empirical_dist = (counts / counts.sum()).tolist()
    return {
        "path": path,
        "empirical_distribution": {nodes[i]: round(empirical_dist[i], 4) for i in range(n)}
    }

def compute_pagerank_iterations(nodes: List[str], stochastic_matrix: List[List[float]], alpha: float = 0.85, max_iters: int = 20, seed_weights: Dict[str, float] = None):
    """
    Computes step-by-step PageRank or PPR distribution history.
    r^(t+1) = alpha * r^(t) * P + (1 - alpha) * v
    """
    n = len(nodes)
    node_to_idx = {name: i for i, name in enumerate(nodes)}
    P = np.array(stochastic_matrix, dtype=float)

    # Build personalization vector v
    v = np.zeros(n, dtype=float)
    if seed_weights:
        for name, wt in seed_weights.items():
            if name in node_to_idx:
                v[node_to_idx[name]] = wt
        total_w = v.sum()
        if total_w > 0:
            v = v / total_w
        else:
            v = np.ones(n) / n
    else:
        v = np.ones(n) / n

    # Initialize r0
    r = v.copy()
    history = [r.tolist()]
    diffs = []

    for it in range(max_iters):
        r_next = alpha * np.dot(r, P) + (1.0 - alpha) * v
        # Normalize sum to 1 to protect against numerical drift
        s = r_next.sum()
        if s > 0:
            r_next = r_next / s
        diff = float(np.sum(np.abs(r_next - r)))
        diffs.append(diff)
        r = r_next
        history.append(r.tolist())
        if diff < 1e-6:
            break

    final_scores = {nodes[i]: round(float(r[i]), 5) for i in range(n)}
    sorted_ranking = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)

    return {
        "iterations_history": history,
        "l1_differences": diffs,
        "final_scores": final_scores,
        "ranking": [{"node": k, "score": v} for k, v in sorted_ranking],
        "converged": len(diffs) < max_iters
    }

def compute_rrf_fusion(graph_ranks: Dict[str, float], vector_ranks: Dict[str, float], k_rrf: int = 60):
    """
    Computes Reciprocal Rank Fusion of graph candidates and vector candidates.
    RRF(d) = sum( 1 / (k + rank(d)) )
    """
    # Sort items to get ranks (1-based)
    sorted_graph = sorted(graph_ranks.items(), key=lambda x: x[1], reverse=True)
    sorted_vec = sorted(vector_ranks.items(), key=lambda x: x[1], reverse=True)
    
    g_rank_map = {item: rank + 1 for rank, (item, _) in enumerate(sorted_graph)}
    v_rank_map = {item: rank + 1 for rank, (item, _) in enumerate(sorted_vec)}
    
    all_candidates = set(g_rank_map.keys()) | set(v_rank_map.keys())
    rrf_scores = {}
    breakdowns = []
    
    for item in all_candidates:
        g_r = g_rank_map.get(item, 999)
        v_r = v_rank_map.get(item, 999)
        
        g_score = (1.0 / (k_rrf + g_r)) if item in g_rank_map else 0.0
        v_score = (1.0 / (k_rrf + v_r)) if item in v_rank_map else 0.0
        total_rrf = g_score + v_score
        
        rrf_scores[item] = round(total_rrf, 6)
        breakdowns.append({
            "candidate": item,
            "graph_rank": g_r if item in g_rank_map else None,
            "vector_rank": v_r if item in v_rank_map else None,
            "graph_component": round(g_score, 6),
            "vector_component": round(v_score, 6),
            "rrf_score": round(total_rrf, 6)
        })
        
    breakdowns.sort(key=lambda x: x["rrf_score"], reverse=True)
    return {
        "k_constant": k_rrf,
        "fused_results": breakdowns
    }
