import React, { useState } from 'react';
import { TestCase } from '../../types/problem';
import { ExecutionResponse } from '../../types/execution';
import { Play, Send, CheckCircle2, XCircle, AlertTriangle, Clock, HardDrive, Terminal } from 'lucide-react';

interface TestConsoleProps {
  testCases: TestCase[];
  defaultCustomInput: string;
  onRunCode: (customInput?: string) => Promise<void>;
  onSubmit: () => Promise<void>;
  isRunning: boolean;
  isSubmitting: boolean;
  executionResult: ExecutionResponse | null;
}

export const TestConsole: React.FC<TestConsoleProps> = ({
  testCases,
  defaultCustomInput,
  onRunCode,
  onSubmit,
  isRunning,
  isSubmitting,
  executionResult,
}) => {
  const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase');
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState(defaultCustomInput);
  const [isCustom, setIsCustom] = useState(false);

  // Switch to result tab automatically when execution completes
  React.useEffect(() => {
    if (executionResult) {
      setActiveTab('result');
    }
  }, [executionResult]);

  // Visible test cases (excluding hidden)
  const visibleCases = testCases.filter(tc => !tc.hidden);

  return (
    <div className="flex flex-col h-full bg-[#161b22] text-slate-200">
      {/* Console Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('testcase')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'testcase'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Testcase
          </button>
          <button
            onClick={() => setActiveTab('result')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeTab === 'result'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Result</span>
            {executionResult && (
              <span
                className={`w-2 h-2 rounded-full ${
                  executionResult.status === 'ACCEPTED' ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
            )}
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRunCode(isCustom ? customInput : undefined)}
            disabled={isRunning || isSubmitting}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 disabled:opacity-50 transition-colors"
          >
            <Play className={`w-3.5 h-3.5 text-emerald-400 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition-colors"
          >
            <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
        {activeTab === 'testcase' ? (
          <div className="space-y-3">
            {/* Case selector pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {visibleCases.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedCaseIndex(i);
                    setIsCustom(false);
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    !isCustom && selectedCaseIndex === i
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-[#0d1117] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Case {i + 1}
                </button>
              ))}

              <button
                onClick={() => setIsCustom(true)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  isCustom
                    ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/50'
                    : 'bg-[#0d1117] text-slate-400 hover:text-slate-200'
                }`}
              >
                + Custom Test
              </button>
            </div>

            {/* Test Case Inputs Display */}
            {isCustom ? (
              <div className="space-y-2">
                <div className="text-slate-400 text-[11px] font-sans">
                  Enter arguments in Python format separated by commas:
                </div>
                <textarea
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  className="w-full h-28 p-3 rounded bg-[#0b0f17] border border-slate-800 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="e.g. 3, [[0, 1, 2.5], [1, 2, 1.0]]"
                />
              </div>
            ) : (
              visibleCases[selectedCaseIndex] && (
                <div className="space-y-3">
                  <div>
                    <div className="text-slate-500 text-[11px] font-sans mb-1">Inputs:</div>
                    <div className="bg-[#0b0f17] p-2.5 rounded border border-slate-800/80 text-emerald-300 overflow-x-auto">
                      {JSON.stringify(visibleCases[selectedCaseIndex].inputs)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[11px] font-sans mb-1">Expected Output:</div>
                    <div className="bg-[#0b0f17] p-2.5 rounded border border-slate-800/80 text-cyan-300 overflow-x-auto">
                      {JSON.stringify(visibleCases[selectedCaseIndex].expected)}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          /* Execution Result View */
          <div>
            {!executionResult ? (
              <div className="text-center py-10 text-slate-500 font-sans text-xs">
                Run or Submit code to inspect execution results.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Result Status Banner */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    {executionResult.status === 'ACCEPTED' ? (
                      <span className="flex items-center space-x-1.5 text-base font-bold text-emerald-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>Accepted</span>
                      </span>
                    ) : executionResult.status === 'WRONG_ANSWER' ? (
                      <span className="flex items-center space-x-1.5 text-base font-bold text-rose-400">
                        <XCircle className="w-5 h-5 text-rose-400" />
                        <span>Wrong Answer</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1.5 text-base font-bold text-amber-400">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <span>{executionResult.status.replace(/_/g, ' ')}</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-400 font-sans">
                      ({executionResult.passed_count} / {executionResult.total_count} test cases passed)
                    </span>
                  </div>

                  {/* Runtime & Memory Pills */}
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-sans">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Runtime: {executionResult.runtime_ms} ms</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Memory: {executionResult.memory_kb} KB</span>
                    </div>
                  </div>
                </div>

                {/* Error message or Failure Reason */}
                {executionResult.error_message && (
                  <div className="p-3 rounded bg-rose-950/30 border border-rose-800/40 text-rose-300 font-mono text-xs whitespace-pre-wrap">
                    {executionResult.error_message}
                  </div>
                )}

                {/* Standard Output Capture */}
                {executionResult.stdout && (
                  <div className="space-y-1">
                    <div className="text-slate-500 font-sans text-[11px] flex items-center space-x-1">
                      <Terminal className="w-3 h-3 text-slate-400" />
                      <span>Stdout:</span>
                    </div>
                    <div className="bg-[#090d16] p-2.5 rounded border border-slate-800 text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {executionResult.stdout}
                    </div>
                  </div>
                )}

                {/* Test Cases Results Detail */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {executionResult.test_results.map((tr, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedCaseIndex(i)}
                        className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors ${
                          selectedCaseIndex === i
                            ? 'bg-slate-700 text-white font-semibold'
                            : 'bg-[#0d1117] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tr.passed ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>Case {i + 1}</span>
                      </button>
                    ))}
                  </div>

                  {executionResult.test_results[selectedCaseIndex] && (
                    <div className="bg-[#0b0f17] p-3 rounded-lg border border-slate-800 space-y-2">
                      <div>
                        <div className="text-slate-500 text-[11px] font-sans">Input:</div>
                        <div className="text-emerald-300 overflow-x-auto pt-0.5">
                          {JSON.stringify(executionResult.test_results[selectedCaseIndex].inputs)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[11px] font-sans">Expected Output:</div>
                        <div className="text-cyan-300 overflow-x-auto pt-0.5">
                          {JSON.stringify(executionResult.test_results[selectedCaseIndex].expected)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 text-[11px] font-sans">Your Output:</div>
                        <div
                          className={`overflow-x-auto pt-0.5 ${
                            executionResult.test_results[selectedCaseIndex].passed
                              ? 'text-emerald-300'
                              : 'text-rose-400 font-semibold'
                          }`}
                        >
                          {JSON.stringify(executionResult.test_results[selectedCaseIndex].actual)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
