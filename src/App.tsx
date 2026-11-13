import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ALL_PROBLEMS, getProblemById, getNextProblem, getPrevProblem } from './data/problems';
import { Problem } from './types/problem';
import { ExecutionResponse, UserProgressData } from './types/execution';
import {
  executeCode,
  saveDraftCode,
  getLocalDraft,
  fetchUserProgress,
  resetAllProgress,
} from './services/executionService';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ProblemDescription } from './components/problem/ProblemDescription';
import { CodeEditor } from './components/editor/CodeEditor';
import { TestConsole } from './components/editor/TestConsole';
import { VisualizerHub } from './components/visualizers/VisualizerHub';
import { ProgressDashboard } from './components/dashboard/ProgressDashboard';

export function App() {
  const [currentProblem, setCurrentProblem] = useState<Problem>(ALL_PROBLEMS[0]);
  const [code, setCode] = useState<string>(currentProblem.starterCode);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);

  const [userProgress, setUserProgress] = useState<UserProgressData>({
    problem_states: {},
    streak: 1,
    total_submissions: 0,
    accepted_submissions: 0,
    accuracy: 0,
  });

  // Load progress and draft code on startup and problem change
  useEffect(() => {
    fetchUserProgress().then(setUserProgress);
  }, []);

  useEffect(() => {
    const draft = getLocalDraft(currentProblem.id);
    setCode(draft || currentProblem.starterCode);
    setExecutionResult(null);
  }, [currentProblem.id]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveDraftCode(currentProblem.id, newCode);
  };

  const handleResetCode = () => {
    setCode(currentProblem.starterCode);
    saveDraftCode(currentProblem.id, currentProblem.starterCode);
  };

  const handleRunCode = async (customInputStr?: string) => {
    setIsRunning(true);
    try {
      let casesToRun = currentProblem.testCases.filter(tc => !tc.hidden);
      if (customInputStr !== undefined) {
        // Parse custom input
        try {
          // Wrapped as array in json or evaluated
          const parsed = JSON.parse(`[${customInputStr}]`);
          casesToRun = [{ inputs: parsed, expected: null }];
        } catch {
          // Fallback simple string input
          casesToRun = [{ inputs: [customInputStr], expected: null }];
        }
      }

      const res = await executeCode(
        currentProblem.id,
        code,
        currentProblem.funcName,
        casesToRun,
        false
      );
      setExecutionResult(res);
      const updated = await fetchUserProgress();
      setUserProgress(updated);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Run ALL test cases including hidden test cases
      const res = await executeCode(
        currentProblem.id,
        code,
        currentProblem.funcName,
        currentProblem.testCases,
        true
      );
      setExecutionResult(res);
      const updated = await fetchUserProgress();
      setUserProgress(updated);

      if (res.status === 'ACCEPTED') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextProb = getNextProblem(currentProblem.id);
  const prevProb = getPrevProblem(currentProblem.id);
  const isSolved = (userProgress.problem_states[currentProblem.id]?.solved || 0) > 0;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0f17]">
      {/* Top Header */}
      <Header
        currentProblem={currentProblem}
        userProgress={userProgress}
        onSelectPrev={() => prevProb && setCurrentProblem(prevProb)}
        onSelectNext={() => nextProb && setCurrentProblem(nextProb)}
        hasPrev={!!prevProb}
        hasNext={!!nextProb}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onToggleDashboard={() => {
          setShowDashboard(!showDashboard);
          setShowVisualizer(false);
        }}
        onToggleVisualizer={() => {
          setShowVisualizer(!showVisualizer);
          setShowDashboard(false);
        }}
        showingVisualizer={showVisualizer}
        showingDashboard={showDashboard}
      />

      {/* Main Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Roadmap Drawer */}
        <Sidebar
          currentProblemId={currentProblem.id}
          onSelectProblem={p => {
            setCurrentProblem(p);
            setShowDashboard(false);
            setShowVisualizer(false);
          }}
          userProgress={userProgress}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center/Right Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {showDashboard ? (
            <ProgressDashboard
              userProgress={userProgress}
              onClose={() => setShowDashboard(false)}
              onResetProgress={async () => {
                await resetAllProgress();
                const fresh = await fetchUserProgress();
                setUserProgress(fresh);
              }}
            />
          ) : showVisualizer ? (
            <VisualizerHub
              initialVisualizer={currentProblem.suggestedVisualizer || 'graph-editor'}
              onClose={() => setShowVisualizer(false)}
            />
          ) : (
            /* LeetCode Split View: Left = Problem Description, Right = Code & Test Console */
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden divide-x divide-slate-800">
              {/* Left Column: Problem Details & Math */}
              <div className="h-full overflow-hidden">
                <ProblemDescription
                  problem={currentProblem}
                  isSolved={isSolved}
                  onOpenVisualizer={() => setShowVisualizer(true)}
                />
              </div>

              {/* Right Column: Code Editor + Test Console */}
              <div className="h-full flex flex-col overflow-hidden">
                {/* Upper: Monaco Editor */}
                <div className="flex-1 min-h-[50%] overflow-hidden">
                  <CodeEditor
                    code={code}
                    onChange={handleCodeChange}
                    onReset={handleResetCode}
                  />
                </div>

                {/* Lower: Test Console & Runner */}
                <div className="h-64 md:h-72 border-t border-slate-800 overflow-hidden">
                  <TestConsole
                    testCases={currentProblem.testCases}
                    defaultCustomInput={currentProblem.defaultCustomInput}
                    onRunCode={handleRunCode}
                    onSubmit={handleSubmit}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    executionResult={executionResult}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
