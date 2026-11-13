import sys
import os
import socket
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from database import init_db, get_all_progress, save_draft, record_submission, get_submission_history, reset_all_progress
from runner import execute_python_code
from visualizer_calc import (
    compute_transition_matrix,
    simulate_markov_steps,
    compute_pagerank_iterations,
    compute_rrf_fusion
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="ChimeraGraph API", version="1.0.0", lifespan=lifespan)

# Allow CORS for development Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    import numpy
    import networkx
    torch_ver = None
    try:
        import torch
        torch_ver = torch.__version__
    except ImportError:
        pass
    return {
        "status": "healthy",
        "python_version": sys.version,
        "numpy": numpy.__version__,
        "networkx": networkx.__version__,
        "torch": torch_ver,
        "mode": "real_python_execution"
    }

class ExecuteRequest(BaseModel):
    problem_id: str
    code: str
    func_name: str
    test_cases: List[Dict[str, Any]]
    is_submission: bool = False

@app.post("/api/execute")
def execute(req: ExecuteRequest):
    if not req.code or not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")
    
    result = execute_python_code(
        code=req.code,
        func_name=req.func_name,
        test_cases=req.test_cases,
        timeout_sec=6.0
    )

    # If it is a formal submission, persist record
    if req.is_submission:
        record_submission(
            problem_id=req.problem_id,
            code=req.code,
            status=result["status"],
            runtime_ms=result.get("runtime_ms", 0.0),
            memory_kb=result.get("memory_kb", 0.0),
            passed=result.get("passed_count", 0),
            total=result.get("total_count", len(req.test_cases)),
            stdout=result.get("stdout", ""),
            error=result.get("error_message", "")
        )
    else:
        # Save draft on run
        save_draft(req.problem_id, req.code)

    return result

class DraftRequest(BaseModel):
    problem_id: str
    code: str

@app.post("/api/save-draft")
def save_code_draft(req: DraftRequest):
    save_draft(req.problem_id, req.code)
    return {"status": "saved"}

@app.get("/api/progress")
def get_progress():
    return get_all_progress()

@app.get("/api/submissions")
def get_submissions(problem_id: Optional[str] = None):
    return get_submission_history(problem_id)

@app.post("/api/reset-progress")
def reset_progress():
    reset_all_progress()
    return {"status": "reset_successful"}

# Visualizer calculation endpoints
class TransitionMatrixRequest(BaseModel):
    nodes: List[str]
    edges: List[Dict[str, Any]]

@app.post("/api/visualize/transition-matrix")
def api_transition_matrix(req: TransitionMatrixRequest):
    return compute_transition_matrix(req.nodes, req.edges)

class MarkovSimRequest(BaseModel):
    nodes: List[str]
    stochastic_matrix: List[List[float]]
    start_node: str
    steps: int = 25

@app.post("/api/visualize/markov-sim")
def api_markov_sim(req: MarkovSimRequest):
    return simulate_markov_steps(req.nodes, req.stochastic_matrix, req.start_node, req.steps)

class PageRankCalcRequest(BaseModel):
    nodes: List[str]
    stochastic_matrix: List[List[float]]
    alpha: float = 0.85
    max_iters: int = 20
    seed_weights: Optional[Dict[str, float]] = None

@app.post("/api/visualize/pagerank")
def api_pagerank(req: PageRankCalcRequest):
    return compute_pagerank_iterations(req.nodes, req.stochastic_matrix, req.alpha, req.max_iters, req.seed_weights)

class RRFCalcRequest(BaseModel):
    graph_ranks: Dict[str, float]
    vector_ranks: Dict[str, float]
    k_rrf: int = 60

@app.post("/api/visualize/rrf")
def api_rrf(req: RRFCalcRequest):
    return compute_rrf_fusion(req.graph_ranks, req.vector_ranks, req.k_rrf)

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Check if a port is in use or forbidden on the host."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((host, port))
            return False
        except OSError:
            return True

def get_available_port(default_port: int = 8000, max_port: int = 8099, host: str = "127.0.0.1") -> int:
    """Scan and select the first free port starting from default_port."""
    for port in range(default_port, max_port + 1):
        if not is_port_in_use(port, host):
            return port
    raise RuntimeError(f"No available port found in range {default_port}-{max_port}")

def save_active_port(port: int):
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    port_file = os.path.join(root_dir, "backend_port.json")
    try:
        with open(port_file, "w", encoding="utf-8") as f:
            json.dump({"port": port, "url": f"http://127.0.0.1:{port}"}, f, indent=2)
    except Exception:
        pass

if __name__ == "__main__":
    import uvicorn
    selected_port = get_available_port(8000)
    save_active_port(selected_port)
    print("=" * 60)
    print(f"  ChimeraGraph Backend API Starting")
    print(f"  Host: 127.0.0.1 | Active Port: {selected_port}")
    print(f"  API Docs: http://127.0.0.1:{selected_port}/docs")
    print("=" * 60)
    uvicorn.run("main:app", host="127.0.0.1", port=selected_port, reload=True)
