import sys
import os
import json
import subprocess
import time
import tempfile
from typing import Dict, Any, List

PYTHON_EXE = sys.executable

RUNNER_HARNESS_TEMPLATE = r'''
import sys
import json
import time
import traceback
import tracemalloc
from typing import Any

# Deep comparison logic in harness
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

def main():
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        meta = json.load(f)

    user_code = meta["code"]
    func_name = meta["func_name"]
    test_cases = meta["test_cases"]

    namespace = {}
    stdout_buf = []

    class StdoutCapture:
        def write(self, s):
            stdout_buf.append(s)
        def flush(self):
            pass

    orig_stdout = sys.stdout
    orig_stderr = sys.stderr

    tracemalloc.start()
    start_total_time = time.perf_counter()

    try:
        # Execute user code
        sys.stdout = StdoutCapture()
        exec(user_code, namespace)
    except Exception as e:
        sys.stdout = orig_stdout
        exc_type, exc_val, exc_tb = sys.exc_info()
        tb_lines = traceback.format_exception(exc_type, exc_val, exc_tb)
        # Filter harness frames
        cleaned_tb = [line for line in tb_lines if "runner_harness" not in line]
        error_msg = "".join(cleaned_tb)
        res = {
            "status": "RUNTIME_ERROR",
            "passed_count": 0,
            "total_count": len(test_cases),
            "test_results": [],
            "error_message": error_msg,
            "stdout": "".join(stdout_buf),
            "runtime_ms": 0.0,
            "memory_kb": 0.0
        }
        sys.stdout.write(json.dumps(res))
        return

    sys.stdout = orig_stdout
    if func_name not in namespace:
        res = {
            "status": "FUNCTION_NOT_FOUND",
            "passed_count": 0,
            "total_count": len(test_cases),
            "test_results": [],
            "error_message": f"Could not find function '{func_name}' in your solution. Please do not change the function name.",
            "stdout": "".join(stdout_buf),
            "runtime_ms": 0.0,
            "memory_kb": 0.0
        }
        sys.stdout.write(json.dumps(res))
        return

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
            err_str = "".join([l for l in exc_lines if "runner_harness" not in l])
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
    current_mem, peak_mem = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    passed_count = sum(1 for tr in test_results if tr["passed"])
    status = "ACCEPTED" if all_passed else ("WRONG_ANSWER" if not any("Exception" in tr.get("reason", "") for tr in test_results) else "RUNTIME_ERROR")

    res = {
        "status": status,
        "passed_count": passed_count,
        "total_count": len(test_cases),
        "test_results": test_results,
        "error_message": first_fail_reason,
        "stdout": "".join(stdout_buf)[:2000], # limit output size
        "runtime_ms": round(total_time_ms, 2),
        "memory_kb": round(peak_mem / 1024.0, 1)
    }
    sys.stdout.write(json.dumps(res))

if __name__ == "__main__":
    main()
'''

def execute_python_code(code: str, func_name: str, test_cases: List[Dict[str, Any]], timeout_sec: float = 6.0) -> Dict[str, Any]:
    """
    Spawns an isolated Python process to execute the code against test cases.
    Returns structured execution result.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        harness_path = os.path.join(tmpdir, "runner_harness.py")
        meta_path = os.path.join(tmpdir, "meta.json")

        with open(harness_path, "w", encoding="utf-8") as f:
            f.write(RUNNER_HARNESS_TEMPLATE)

        meta_data = {
            "code": code,
            "func_name": func_name,
            "test_cases": test_cases
        }
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta_data, f)

        try:
            start_proc = time.perf_counter()
            process = subprocess.Popen(
                [PYTHON_EXE, harness_path, meta_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=tmpdir
            )
            stdout, stderr = process.communicate(timeout=timeout_sec)
            elapsed_ms = (time.perf_counter() - start_proc) * 1000.0

            if process.returncode != 0 and not stdout:
                return {
                    "status": "RUNTIME_ERROR",
                    "passed_count": 0,
                    "total_count": len(test_cases),
                    "test_results": [],
                    "error_message": stderr or "Unknown execution error in Python process.",
                    "stdout": "",
                    "runtime_ms": round(elapsed_ms, 2),
                    "memory_kb": 0.0
                }

            # Parse harness JSON output
            try:
                res = json.loads(stdout.strip())
                return res
            except json.JSONDecodeError:
                return {
                    "status": "RUNTIME_ERROR",
                    "passed_count": 0,
                    "total_count": len(test_cases),
                    "test_results": [],
                    "error_message": stderr or stdout or "Failed to parse runner output.",
                    "stdout": stdout,
                    "runtime_ms": round(elapsed_ms, 2),
                    "memory_kb": 0.0
                }

        except subprocess.TimeoutExpired:
            process.kill()
            return {
                "status": "TIME_LIMIT_EXCEEDED",
                "passed_count": 0,
                "total_count": len(test_cases),
                "test_results": [],
                "error_message": f"Time Limit Exceeded: Code did not finish within {timeout_sec} seconds. Check for infinite loops or non-terminating recursion.",
                "stdout": "",
                "runtime_ms": timeout_sec * 1000.0,
                "memory_kb": 0.0
            }
