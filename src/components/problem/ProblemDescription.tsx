import React, { useState } from 'react';
import { Problem } from '../../types/problem';
import { MathRenderer } from './MathRenderer';
import { ChimeraBadge } from './ChimeraBadge';
import { HintsAccordion } from './HintsAccordion';
import { BookOpen, Code, Eye, EyeOff, CheckCircle2, Clock, Cpu, Award } from 'lucide-react';

interface ProblemDescriptionProps {
  problem: Problem;
  isSolved: boolean;
  onOpenVisualizer?: () => void;
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  problem,
  isSolved,
  onOpenVisualizer,
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'editorial'>('description');
  const [solutionRevealed, setSolutionRevealed] = useState(false);

  const difficultyColors = {
    Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-r border-slate-800 text-slate-200 overflow-hidden">
      {/* Top Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 bg-[#161b22]">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'description'
                ? 'bg-[#1f293d] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Problem Description</span>
          </button>
          <button
            onClick={() => setActiveTab('editorial')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'editorial'
                ? 'bg-[#1f293d] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>Editorial & Solution</span>
          </button>
        </div>

        {problem.suggestedVisualizer && (
          <button
            onClick={onOpenVisualizer}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 text-[11px] font-medium transition-colors"
          >
            <span>Interactive Visualizer</span>
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'description' ? (
          <>
            {/* Title & Metadata */}
            <div>
              <div className="flex items-center space-x-2.5 flex-wrap gap-y-2 mb-2.5">
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                  {problem.order}. {problem.title}
                </h1>
                {isSolved && (
                  <span className="flex items-center space-x-1 text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="font-medium">Solved</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1.5">
                <span
                  className={`px-2 py-0.5 rounded font-medium border text-[11px] ${
                    difficultyColors[problem.difficulty]
                  }`}
                >
                  {problem.difficulty}
                </span>

                {problem.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-slate-800/70 text-slate-400 border border-slate-700/60 text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Chimera Research Badge */}
            <ChimeraBadge contextText={problem.chimeraContext} />

            {/* Problem Statement */}
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Problem Statement
              </h2>
              <MathRenderer content={problem.description} />
            </div>

            {/* Mathematical Foundations */}
            {problem.mathematicalExplanation && (
              <div className="border border-indigo-900/40 bg-[#0f172a]/60 rounded-lg p-4 space-y-2.5">
                <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Mathematical Foundation</span>
                </div>
                <MathRenderer content={problem.mathematicalExplanation} />
              </div>
            )}

            {/* Input/Output Examples */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Examples
              </h2>
              {problem.examples.map((example, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-[#161b22] border border-slate-800 p-3.5 text-xs font-mono space-y-2"
                >
                  <div className="font-semibold text-slate-300">Example {i + 1}:</div>
                  <div className="bg-[#0b0f17] p-2.5 rounded border border-slate-800/80 text-slate-300 overflow-x-auto">
                    <span className="text-slate-500 font-sans font-medium">Input: </span>
                    <span className="text-emerald-300">{example.input}</span>
                  </div>
                  <div className="bg-[#0b0f17] p-2.5 rounded border border-slate-800/80 text-slate-300 overflow-x-auto">
                    <span className="text-slate-500 font-sans font-medium">Output: </span>
                    <span className="text-cyan-300">{example.output}</span>
                  </div>
                  {example.explanation && (
                    <div className="text-slate-400 text-[11px] font-sans pt-1">
                      <span className="font-semibold text-slate-300">Explanation: </span>
                      {example.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Constraints
              </h2>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-mono pl-1">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Expected Complexity */}
            <div className="flex items-center space-x-6 text-xs text-slate-400 bg-[#161b22] p-3 rounded-md border border-slate-800">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Expected Time: <code className="text-slate-200 font-mono">{problem.expectedComplexity.time}</code>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Expected Space: <code className="text-slate-200 font-mono">{problem.expectedComplexity.space}</code>
                </span>
              </div>
            </div>

            {/* Progressive Hints Accordion */}
            <HintsAccordion hints={problem.hints} />
          </>
        ) : (
          /* Editorial & Solution Tab */
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-100 mb-1">
                Editorial: {problem.title}
              </h2>
              <p className="text-xs text-slate-400">
                Comprehensive algorithmic analysis, mathematical proofs, and reference Python implementation.
              </p>
            </div>

            {/* Editorial Markdown */}
            <MathRenderer content={problem.editorial} />

            {/* Reference Solution Code Gate */}
            <div className="mt-8 border border-slate-800 rounded-lg overflow-hidden bg-[#161b22]">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Python 3 Reference Solution</span>
                </span>

                <button
                  onClick={() => setSolutionRevealed(!solutionRevealed)}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                >
                  {solutionRevealed ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hide Solution</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Reveal Solution</span>
                    </>
                  )}
                </button>
              </div>

              {solutionRevealed ? (
                <div className="p-4 bg-[#090d16] text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  <pre>{problem.referenceSolution}</pre>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <p>Solution is hidden by default to encourage independent problem-solving.</p>
                  <button
                    onClick={() => setSolutionRevealed(true)}
                    className="px-3 py-1.5 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-medium transition-colors"
                  >
                    I have attempted this problem — Show Reference Solution
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
