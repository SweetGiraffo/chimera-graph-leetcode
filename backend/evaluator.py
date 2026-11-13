import math
from typing import Any, Tuple

def normalize_val(v: Any) -> Any:
    """Normalize numpy arrays, torch tensors, or nested structures to standard Python objects."""
    if hasattr(v, "tolist"):
        return v.tolist()
    if isinstance(v, (list, tuple)):
        return [normalize_val(x) for x in v]
    if isinstance(v, dict):
        return {str(k): normalize_val(val) for k, val in v.items()}
    if isinstance(v, set):
        return sorted([normalize_val(x) for x in v], key=lambda x: str(x))
    return v

def deep_compare(actual: Any, expected: Any, tol: float = 1e-3) -> Tuple[bool, str]:
    """
    Recursively compares actual and expected values.
    Returns (matches: bool, reason: str).
    """
    actual = normalize_val(actual)
    expected = normalize_val(expected)

    # Boolean check first because bool is subclass of int in Python!
    if isinstance(expected, bool) or isinstance(actual, bool):
        if type(actual) is not type(expected):
            return False, f"Type mismatch: expected bool, got {type(actual).__name__}"
        if actual != expected:
            return False, f"Expected {expected}, got {actual}"
        return True, ""

    # Numeric comparison with tolerance
    if isinstance(expected, (int, float)) and isinstance(actual, (int, float)):
        diff = abs(actual - expected)
        if diff <= tol:
            return True, ""
        # Also check relative tolerance for large numbers
        if abs(expected) > 1e-6 and diff / abs(expected) <= tol:
            return True, ""
        return False, f"Numeric mismatch: expected {expected}, got {actual} (diff: {diff:.6f} > tol: {tol})"

    # Sequence comparison
    if isinstance(expected, (list, tuple)) and isinstance(actual, (list, tuple)):
        if len(actual) != len(expected):
            return False, f"Length mismatch: expected {len(expected)} elements, got {len(actual)}"
        for idx, (a_item, e_item) in enumerate(zip(actual, expected)):
            matched, reason = deep_compare(a_item, e_item, tol)
            if not matched:
                return False, f"Mismatch at index [{idx}]: {reason}"
        return True, ""

    # Dictionary comparison
    if isinstance(expected, dict) and isinstance(actual, dict):
        if set(expected.keys()) != set(actual.keys()):
            missing = set(expected.keys()) - set(actual.keys())
            extra = set(actual.keys()) - set(expected.keys())
            msg = []
            if missing:
                msg.append(f"missing keys: {list(missing)[:3]}")
            if extra:
                msg.append(f"extra keys: {list(extra)[:3]}")
            return False, f"Dict key mismatch ({', '.join(msg)})"
        for k in expected:
            matched, reason = deep_compare(actual[k], expected[k], tol)
            if not matched:
                return False, f"Mismatch at key '{k}': {reason}"
        return True, ""

    # Generic equality
    if actual == expected:
        return True, ""

    return False, f"Expected {expected}, got {actual}"
