import React from 'react';
import { MODULES } from '../../data/modules';
import { ALL_PROBLEMS } from '../../data/problems';
import { UserProgressData } from '../../types/execution';
import { Award, CheckCircle2, Flame, Target, Cpu, RotateCcw, X, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';

interface ProgressDashboardProps {
  userProgress: UserProgressData;
  onClose: () => void;
  onResetProgress: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  userProgress,
  onClose,
  onResetProgress,
}) => {
  const totalProblems = ALL_PROBLEMS.length;
  const solvedCount = Object.values(userProgress.problem_states).filter(s => s.solved > 0).length;
  const totalSubmissions = userProgress.total_submissions || 0;
  const accuracy = userProgress.accuracy || 0;

  // Breakdown by difficulty
  const difficulties = ['Easy', 'Medium', 'Hard'] as const;
  const diffStats = difficulties.map(diff => {
    const total = ALL_PROBLEMS.filter(p => p.difficulty === diff).length;
    const solved = ALL_PROBLEMS.filter(
      p => p.difficulty === diff && (userProgress.problem_states[p.id]?.solved || 0) > 0
    ).length;
    return { diff, total, solved, pct: total > 0 ? Math.round((solved / total) * 100) : 0 };
  });

  // Chimera Readiness Index
  const chimeraProblems = ALL_PROBLEMS.filter(p => p.moduleId === 'module-chimera-lab');
  const chimeraSolved = chimeraProblems.filter(
    p => (userProgress.problem_states[p.id]?.solved || 0) > 0
  ).length;
  const readinessIndex = Math.round((solvedCount / totalProblems) * 100);

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200 p-6 overflow-y-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Learning Analytics & Progress Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              Track mastery of mathematical graph foundations, Markov chains, PPR, and Chimera RAG architecture.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all problem progress?')) {
                onResetProgress();
              }
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Primary Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Solved Card */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Problems Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono">
            {solvedCount} <span className="text-sm font-normal text-slate-500">/ {totalProblems}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${readinessIndex}%` }}
            />
          </div>
        </div>

        {/* Streak Card */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Learning Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {userProgress.streak} <span className="text-sm font-normal text-slate-500">days</span>
          </div>
          <div className="text-[11px] text-slate-400">Consistent daily practice</div>
        </div>

        {/* Accuracy */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Acceptance Rate</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {accuracy}%
          </div>
          <div className="text-[11px] text-slate-400">{totalSubmissions} total submissions</div>
        </div>

        {/* Chimera Readiness Score */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-[#161b22] border border-indigo-500/30 space-y-2">
          <div className="flex items-center justify-between text-indigo-300 text-xs font-semibold">
            <span>Chimera Readiness</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">
            {readinessIndex}%
          </div>
          <div className="text-[11px] text-slate-400">
            {chimeraSolved} / {chimeraProblems.length} Capstone challenges solved
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="p-5 rounded-xl bg-[#161b22] border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <span>Problems Solved by Difficulty</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {diffStats.map(stat => {
            const colors = {
              Easy: { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300' },
              Medium: { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300' },
              Hard: { bar: 'bg-rose-500', text: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-300' },
            }[stat.diff];

            return (
              <div key={stat.diff} className="p-3.5 rounded-lg bg-[#0b0f17] border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${colors.badge}`}>
                    {stat.diff}
                  </span>
                  <span className="font-mono text-slate-300 font-semibold">
                    {stat.solved} / {stat.total} ({stat.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${stat.pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Completion Progress */}
      <div className="p-5 rounded-xl bg-[#161b22] border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span>Curriculum Mastery by Module</span>
        </h2>

        <div className="space-y-3">
          {MODULES.map(m => {
            const mProblems = ALL_PROBLEMS.filter(p => p.moduleId === m.id);
            const mSolved = mProblems.filter(
              p => (userProgress.problem_states[p.id]?.solved || 0) > 0
            ).length;
            const pct = mProblems.length > 0 ? Math.round((mSolved / mProblems.length) * 100) : 0;

            return (
              <div key={m.id} className="p-3 rounded-lg bg-[#0b0f17] border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-mono text-[11px]">
                      Module {m.number}:
                    </span>
                    <span className="font-semibold text-slate-200">{m.title}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    <strong className="text-emerald-400">{mSolved}</strong> / {mProblems.length} ({pct}%)
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
