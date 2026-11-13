import sqlite3
import os
import json
from datetime import datetime, date

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "chimera_progress.db")

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS problem_state (
                problem_id TEXT PRIMARY KEY,
                solved INTEGER DEFAULT 0,
                attempts INTEGER DEFAULT 0,
                code TEXT,
                last_status TEXT,
                runtime_ms REAL,
                memory_kb REAL,
                updated_at TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id TEXT,
                code TEXT,
                status TEXT,
                runtime_ms REAL,
                memory_kb REAL,
                passed_tests INTEGER,
                total_tests INTEGER,
                stdout TEXT,
                error_message TEXT,
                created_at TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_meta (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        """)
    conn.close()

def get_all_progress():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM problem_state")
    states = [dict(row) for row in cursor.fetchall()]
    
    # Calculate streak
    cursor.execute("SELECT DISTINCT date(created_at) as sub_date FROM submissions ORDER BY sub_date DESC")
    dates = [row["sub_date"] for row in cursor.fetchall()]
    streak = 0
    today = date.today().isoformat()
    if dates:
        curr = date.today()
        # if no submission today, check if submitted yesterday
        if dates[0] == today:
            streak = 1
            check_date = curr
        else:
            yesterday = date.fromordinal(curr.toordinal() - 1).isoformat()
            if dates[0] == yesterday:
                streak = 1
                check_date = date.fromordinal(curr.toordinal() - 1)
            else:
                streak = 0
                check_date = None
        
        if check_date:
            for d_str in dates[1:]:
                prev_expected = date.fromordinal(check_date.toordinal() - 1).isoformat()
                if d_str == prev_expected:
                    streak += 1
                    check_date = date.fromordinal(check_date.toordinal() - 1)
                else:
                    break

    cursor.execute("SELECT COUNT(*) as total_sub, SUM(CASE WHEN status='ACCEPTED' THEN 1 ELSE 0 END) as acc_sub FROM submissions")
    sub_stats = cursor.fetchone()
    total_sub = sub_stats["total_sub"] or 0
    acc_sub = sub_stats["acc_sub"] or 0
    accuracy = round((acc_sub / total_sub * 100), 1) if total_sub > 0 else 0.0

    conn.close()
    return {
        "problem_states": {s["problem_id"]: s for s in states},
        "streak": max(streak, 1 if len(states) > 0 else 0),
        "total_submissions": total_sub,
        "accepted_submissions": acc_sub,
        "accuracy": accuracy
    }

def save_draft(problem_id: str, code: str):
    conn = get_connection()
    now = datetime.now().isoformat()
    with conn:
        conn.execute("""
            INSERT INTO problem_state (problem_id, code, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(problem_id) DO UPDATE SET
                code = excluded.code,
                updated_at = excluded.updated_at
        """, (problem_id, code, now))
    conn.close()

def record_submission(problem_id: str, code: str, status: str, runtime_ms: float, memory_kb: float, passed: int, total: int, stdout: str, error: str):
    conn = get_connection()
    now = datetime.now().isoformat()
    is_solved = 1 if status == "ACCEPTED" else 0
    with conn:
        conn.execute("""
            INSERT INTO submissions (problem_id, code, status, runtime_ms, memory_kb, passed_tests, total_tests, stdout, error_message, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (problem_id, code, status, runtime_ms, memory_kb, passed, total, stdout, error, now))
        
        conn.execute("""
            INSERT INTO problem_state (problem_id, solved, attempts, code, last_status, runtime_ms, memory_kb, updated_at)
            VALUES (?, ?, 1, ?, ?, ?, ?, ?)
            ON CONFLICT(problem_id) DO UPDATE SET
                solved = MAX(problem_state.solved, excluded.solved),
                attempts = problem_state.attempts + 1,
                code = excluded.code,
                last_status = excluded.last_status,
                runtime_ms = excluded.runtime_ms,
                memory_kb = excluded.memory_kb,
                updated_at = excluded.updated_at
        """, (problem_id, is_solved, code, status, runtime_ms, memory_kb, now))
    conn.close()

def get_submission_history(problem_id: str = None):
    conn = get_connection()
    cursor = conn.cursor()
    if problem_id:
        cursor.execute("SELECT * FROM submissions WHERE problem_id=? ORDER BY id DESC LIMIT 20", (problem_id,))
    else:
        cursor.execute("SELECT * FROM submissions ORDER BY id DESC LIMIT 50")
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return results

def reset_all_progress():
    conn = get_connection()
    with conn:
        conn.execute("DELETE FROM problem_state")
        conn.execute("DELETE FROM submissions")
    conn.close()
