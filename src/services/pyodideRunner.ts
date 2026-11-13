import { ExecutionResponse } from '../types/execution';
import { TestCase } from '../types/problem';

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
  }
}

export type PyodideStatus = 'unloaded' | 'loading' | 'ready' | 'error';

let pyodideInstance: any = null;
let pyodideInitPromise: Promise<any> | null = null;
let currentStatus: PyodideStatus = 'unloaded';
let statusListeners: ((status: PyodideStatus, message: string) => void)[] = [];

export function subscribePyodideStatus(listener: (status: PyodideStatus, message: string) => void) {
  statusListeners.push(listener);
  listener(currentStatus, currentStatus === 'ready' ? 'WebAssembly Python ready' : '');
  return () => {
    statusListeners = statusListeners.filter(l => l !== listener);
  };
}

function notifyStatus(status: PyodideStatus, message: string) {
  currentStatus = status;
  for (const listener of statusListeners) {
    listener(status, message);
  }
}

export function getPyodideStatus(): PyodideStatus {
  return currentStatus;
}

const PYTHON_HARNESS_CODE = `
import sys
import json
import time
import traceback
from typing import Any

try:
    import tracemalloc
    tracemalloc.start()
    HAS_TRACEMALLOC = True
except Exception:
    HAS_TRACEMALLOC = False

def normalize_val(v: Any) -> Any:
    if hasattr(v, "tolist"):
        return v.tolist()
    if isinstance(v, (list, tuple)):
        return [normalize_val(x) for x in v]
    if isinstance(v, dict):
        return {str(k): normalize_val(val) for k, val in v.items()}
    if isinstance(v, set):
        return sorted([normalize_val(x) for x in v], key=lambda x: str(x))
    return v

def deep_compare(actual: Any, expected: Any, tol: float = 1e-3):
    actual = normalize_val(actual)
    expected = normalize_val(expected)
    if isinstance(expected, bool) or isinstance(actual, bool):
        if type(actual) is not type(expected):
            return False, f"Type mismatch: expected bool, got {type(actual).__name__}"
        if actual != expected:
            return False, f"Expected {expected}, got {actual}"
        return True, ""
    if isinstance(expected, (int, float)) and isinstance(actual, (int, float)):
        diff = abs(actual - expected)
        if diff <= tol:
            return True, ""
        if abs(expected) > 1e-6 and diff / abs(expected) <= tol:
            return True, ""
        return False, f"Expected {expected}, got {round(actual, 5)} (diff: {diff:.5f})"
    if isinstance(expected, (list, tuple)) and isinstance(actual, (list, tuple)):
        if len(actual) != len(expected):
            return False, f"Length mismatch: expected {len(expected)}, got {len(actual)}"
        for idx, (a, e) in enumerate(zip(actual, expected)):
            m, r = deep_compare(a, e, tol)
            if not m:
                return False, f"At index [{idx}]: {r}"
        return True, ""
    if isinstance(expected, dict) and isinstance(actual, dict):
        if set(expected.keys()) != set(actual.keys()):
            return False, f"Key mismatch: expected keys {list(expected.keys())[:3]}, got {list(actual.keys())[:3]}"
        for k in expected:
            m, r = deep_compare(actual[k], expected[k], tol)
            if not m:
                return False, f"At key '{k}': {r}"
        return True, ""
    if actual == expected:
        return True, ""
    return False, f"Expected {expected}, got {actual}"

def execute_code_in_pyodide(user_code: str, func_name: str, test_cases_json: str) -> str:
    test_cases = json.loads(test_cases_json)
    namespace = {}
    stdout_buf = []

    class StdoutCapture:
        def write(self, s):
            stdout_buf.append(s)
        def flush(self):
            pass

    orig_stdout = sys.stdout
    orig_stderr = sys.stderr

    if HAS_TRACEMALLOC:
        try:
            tracemalloc.clear_traces()
        except Exception:
            pass

    start_total_time = time.perf_counter()

    try:
        sys.stdout = StdoutCapture()
        exec(user_code, namespace)
    except Exception as e:
        sys.stdout = orig_stdout
        exc_type, exc_val, exc_tb = sys.exc_info()
        tb_lines = traceback.format_exception(exc_type, exc_val, exc_tb)
        cleaned_tb = [line for line in tb_lines if "execute_code_in_pyodide" not in line and "runner_harness" not in line]
        error_msg = "".join(cleaned_tb)
        return json.dumps({
            "status": "RUNTIME_ERROR",
            "passed_count": 0,
            "total_count": len(test_cases),
            "test_results": [],
            "error_message": error_msg,
            "stdout": "".join(stdout_buf),
            "runtime_ms": 0.0,
            "memory_kb": 0.0
        })

    sys.stdout = orig_stdout
    if func_name not in namespace:
        return json.dumps({
            "status": "FUNCTION_NOT_FOUND",
            "passed_count": 0,
            "total_count": len(test_cases),
            "test_results": [],
            "error_message": f"Could not find function '{func_name}' in your solution. Please do not change the function name.",
            "stdout": "".join(stdout_buf),
            "runtime_ms": 0.0,
            "memory_kb": 0.0
        })

    func = namespace[func_name]
    test_results = []
    all_passed = True
    first_fail_reason = ""

    for i, tc in enumerate(test_cases):
        inputs = tc.get("inputs", [])
        expected = tc.get("expected", None)
        is_hidden = tc.get("hidden", False)
        
        tc_start = time.perf_counter()
        tc_stdout = []
        class TcStdoutCapture:
            def write(self, s):
                tc_stdout.append(s)
                stdout_buf.append(s)
            def flush(self):
                pass
        
        sys.stdout = TcStdoutCapture()
        try:
            actual = func(*inputs)
            sys.stdout = orig_stdout
            tc_time = (time.perf_counter() - tc_start) * 1000.0
            
            if expected is not None:
                matched, reason = deep_compare(actual, expected)
            else:
                matched, reason = True, "Custom execution output"

            if not matched:
                all_passed = False
                if not first_fail_reason:
                    first_fail_reason = f"Test #{i+1} Failed: {reason}"

            norm_actual = normalize_val(actual)
            test_results.append({
                "test_index": i + 1,
                "inputs": "<hidden>" if is_hidden else inputs,
                "expected": "<hidden>" if is_hidden else normalize_val(expected),
                "actual": "<hidden>" if (is_hidden and not matched) else norm_actual,
                "passed": matched,
                "reason": reason if not matched else "Passed",
                "execution_time_ms": round(tc_time, 2),
                "stdout": "".join(tc_stdout),
                "hidden": is_hidden
            })
        except Exception as e:
            sys.stdout = orig_stdout
            tc_time = (time.perf_counter() - tc_start) * 1000.0
            all_passed = False
            exc_lines = traceback.format_exception(*sys.exc_info())
            err_str = "".join([l for l in exc_lines if "execute_code_in_pyodide" not in l and "runner_harness" not in l])
            if not first_fail_reason:
                first_fail_reason = f"Test #{i+1} Runtime Error: {str(e)}"
            test_results.append({
                "test_index": i + 1,
                "inputs": "<hidden>" if is_hidden else inputs,
                "expected": "<hidden>" if is_hidden else normalize_val(expected),
                "actual": None,
                "passed": False,
                "reason": f"Exception: {str(e)}",
                "error": err_str,
                "execution_time_ms": round(tc_time, 2),
                "stdout": "".join(tc_stdout),
                "hidden": is_hidden
            })

    total_time_ms = (time.perf_counter() - start_total_time) * 1000.0
    mem_kb = 0.0
    if HAS_TRACEMALLOC:
        try:
            _, peak_mem = tracemalloc.get_traced_memory()
            mem_kb = round(peak_mem / 1024.0, 1)
        except Exception:
            pass

    passed_count = sum(1 for tr in test_results if tr["passed"])
    status = "ACCEPTED" if all_passed else ("WRONG_ANSWER" if not any("Exception" in tr.get("reason", "") for tr in test_results) else "RUNTIME_ERROR")

    return json.dumps({
        "status": status,
        "passed_count": passed_count,
        "total_count": len(test_cases),
        "test_results": test_results,
        "error_message": first_fail_reason,
        "stdout": "".join(stdout_buf)[:2000],
        "runtime_ms": round(total_time_ms, 2),
        "memory_kb": mem_kb
    })
`;

async function loadScript(src: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.loadPyodide) return;

  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener('load', () => resolve());
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide WebAssembly script from CDN.'));
    document.head.appendChild(script);
  });
}

export async function getPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideInitPromise) return pyodideInitPromise;

  pyodideInitPromise = (async () => {
    try {
      notifyStatus('loading', 'Downloading WebAssembly Python...');
      await loadScript('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

      if (!window.loadPyodide) {
        throw new Error('Pyodide script loaded but window.loadPyodide is not defined.');
      }

      notifyStatus('loading', 'Initializing Python runtime...');
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      });

      notifyStatus('loading', 'Loading NumPy and NetworkX...');
      await pyodide.loadPackage(['numpy', 'networkx']);

      notifyStatus('loading', 'Registering test harness...');
      await pyodide.runPythonAsync(PYTHON_HARNESS_CODE);

      pyodideInstance = pyodide;
      notifyStatus('ready', 'WebAssembly Python ready');
      return pyodide;
    } catch (err: any) {
      notifyStatus('error', err?.message || 'Failed to initialize Pyodide');
      pyodideInitPromise = null;
      throw err;
    }
  })();

  return pyodideInitPromise;
}

export async function executeInPyodide(
  code: string,
  funcName: string,
  testCases: TestCase[]
): Promise<ExecutionResponse> {
  const pyodide = await getPyodide();
  const runner = pyodide.globals.get('execute_code_in_pyodide');
  const jsonResult = runner(code, funcName, JSON.stringify(testCases));
  return JSON.parse(jsonResult) as ExecutionResponse;
}
