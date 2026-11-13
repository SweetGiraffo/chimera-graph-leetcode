import { ExecutionResponse, UserProgressData } from '../types/execution';
import { TestCase } from '../types/problem';
import { executeInPyodide, getPyodide } from './pyodideRunner';

const CANDIDATE_PORTS = [8000, 8001, 8002, 8003, 8004, 8005];
let activeApiPort = 8000;
let backendAvailable: boolean | null = null;

export function getApiBase(): string {
  return `http://127.0.0.1:${activeApiPort}/api`;
}

export async function detectActivePort(): Promise<number> {
  const portsToTry = [activeApiPort, ...CANDIDATE_PORTS.filter(p => p !== activeApiPort)];
  for (const p of portsToTry) {
    try {
      const res = await fetch(`http://127.0.0.1:${p}/api/health`, {
        signal: AbortSignal.timeout(400),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.mode === 'real_python_execution') {
          activeApiPort = p;
          backendAvailable = true;
          return p;
        }
      }
    } catch {
      // Continue searching
    }
  }
  backendAvailable = false;
  return activeApiPort;
}

export interface HealthStatus {
  status: string;
  python_version: string;
  numpy: string;
  networkx: string;
  torch?: string;
  mode: string;
}

export async function checkBackendHealth(): Promise<HealthStatus | null> {
  await detectActivePort();
  if (backendAvailable) {
    try {
      const res = await fetch(`${getApiBase()}/health`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Fall through to Pyodide
    }
  }

  // Pre-warm Pyodide in background
  getPyodide().catch(() => {});

  return {
    status: 'healthy',
    python_version: '3.12 (Pyodide WebAssembly)',
    numpy: 'Active (WASM)',
    networkx: 'Active (WASM)',
    mode: 'in_browser_wasm',
  };
}

export async function executeCode(
  problemId: string,
  code: string,
  funcName: string,
  testCases: TestCase[],
  isSubmission: boolean = false
): Promise<ExecutionResponse> {
  // 1. Try local backend first if available
  try {
    await detectActivePort();
    if (backendAvailable) {
      const res = await fetch(`${getApiBase()}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: problemId,
          code,
          func_name: funcName,
          test_cases: testCases,
          is_submission: isSubmission,
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data: ExecutionResponse = await res.json();
        saveLocalProblemState(problemId, isSubmission && data.status === 'ACCEPTED', code, data.status);
        return data;
      }
    }
  } catch (err) {
    console.info('Local backend unavailable, executing with Pyodide WebAssembly.');
  }

  // 2. Seamless in-browser execution via Pyodide WebAssembly (Method 2)
  try {
    const data = await executeInPyodide(code, funcName, testCases);
    saveLocalProblemState(problemId, isSubmission && data.status === 'ACCEPTED', code, data.status);
    return data;
  } catch (pyodideErr: any) {
    return {
      status: 'RUNTIME_ERROR',
      passed_count: 0,
      total_count: testCases.length,
      test_results: [],
      error_message: `Pyodide Execution Error: ${pyodideErr?.message || pyodideErr}`,
      stdout: '',
      runtime_ms: 0,
      memory_kb: 0,
    };
  }
}

export async function saveDraftCode(problemId: string, code: string): Promise<void> {
  await detectActivePort();
  try {
    fetch(`${getApiBase()}/save-draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem_id: problemId, code }),
    }).catch(() => {});
  } catch (e) {}

  localStorage.setItem(`chimera_draft_${problemId}`, code);
}

export function getLocalDraft(problemId: string): string | null {
  return localStorage.getItem(`chimera_draft_${problemId}`);
}

export function saveLocalProblemState(problemId: string, solved: boolean, code: string, status: string) {
  const existing = getLocalProgress();
  const current = existing.problem_states[problemId] || {
    problem_id: problemId,
    solved: 0,
    attempts: 0,
    code,
    last_status: status,
    runtime_ms: 0,
    memory_kb: 0,
    updated_at: new Date().toISOString(),
  };

  current.attempts += 1;
  current.code = code;
  current.last_status = status;
  if (solved) {
    current.solved = 1;
  }
  current.updated_at = new Date().toISOString();

  existing.problem_states[problemId] = current;
  existing.total_submissions += 1;
  if (status === 'ACCEPTED') {
    existing.accepted_submissions += 1;
  }
  existing.accuracy = existing.total_submissions > 0
    ? Math.round((existing.accepted_submissions / existing.total_submissions) * 100)
    : 0;

  localStorage.setItem('chimera_user_progress', JSON.stringify(existing));
}

export function getLocalProgress(): UserProgressData {
  try {
    const raw = localStorage.getItem('chimera_user_progress');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return {
    problem_states: {},
    streak: 1,
    total_submissions: 0,
    accepted_submissions: 0,
    accuracy: 0,
  };
}

export async function fetchUserProgress(): Promise<UserProgressData> {
  await detectActivePort();
  try {
    const res = await fetch(`${getApiBase()}/progress`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {}
  return getLocalProgress();
}

export async function resetAllProgress(): Promise<void> {
  await detectActivePort();
  try {
    await fetch(`${getApiBase()}/reset-progress`, { method: 'POST' });
  } catch (e) {}
  localStorage.removeItem('chimera_user_progress');
  const keys = Object.keys(localStorage);
  for (const k of keys) {
    if (k.startsWith('chimera_draft_')) {
      localStorage.removeItem(k);
    }
  }
}
