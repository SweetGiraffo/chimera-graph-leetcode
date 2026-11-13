export interface SingleTestResult {
  test_index: number;
  inputs: any;
  expected: any;
  actual: any;
  passed: boolean;
  reason: string;
  error?: string;
  execution_time_ms: number;
  stdout: string;
  hidden: boolean;
}

export interface ExecutionResponse {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'FUNCTION_NOT_FOUND';
  passed_count: number;
  total_count: number;
  test_results: SingleTestResult[];
  error_message: string;
  stdout: string;
  runtime_ms: number;
  memory_kb: number;
}

export interface ProblemState {
  problem_id: string;
  solved: number;
  attempts: number;
  code: string;
  last_status: string;
  runtime_ms: number;
  memory_kb: number;
  updated_at: string;
}

export interface UserProgressData {
  problem_states: Record<string, ProblemState>;
  streak: number;
  total_submissions: number;
  accepted_submissions: number;
  accuracy: number;
}
