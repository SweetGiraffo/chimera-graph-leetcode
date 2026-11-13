import React from 'react';
import { Problem } from '../../types/problem';
import { UserProgressData } from '../../types/execution';
import { ChevronLeft, ChevronRight, Sparkles, Flame, CheckCircle, BarChart2, Eye, Layout } from 'lucide-react';

interface HeaderProps {
  currentProblem: Problem;
  userProgress: UserProgressData;
  onSelectPrev: () => void;
  onSelectNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onToggleSidebar: () => void;
  onToggleDashboard: () => void;
  onToggleVisualizer: () => void;
  showingVisualizer: boolean;
  showingDashboard: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentProblem,
  userProgress,
  onSelectPrev,
  onSelectNext,
  hasPrev,
  hasNext,
  onToggleSidebar,
  onToggleDashboard,
  onToggleVisualizer,
  showingVisualizer,
  showingDashboard,
}) => {
  const solvedCount = Object.values(userProgress.problem_states).filter(s => s.solved > 0).length;

  return (
    <header className="h-12 bg-[#161b22] border-b border-slate-800 flex items-center justify-between px-3 text-xs select-none z-20">
      {/* Left: Brand & Sidebar toggle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 transition-colors"
          title="Toggle Curriculum Roadmap"
        >
          <Layout className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-black text-xs shadow-md">
            Χ
          </div>
          <span className="font-bold text-slate-100 tracking-tight hidden sm:inline">
            ChimeraGraph
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden md:inline">
            Graph Intelligence Academy
          </span>
        </div>

        {/* Problem Navigation Quick Buttons */}
        <div className="hidden lg:flex items-center space-x-1 pl-2 border-l border-slate-800">
          <button
            onClick={onSelectPrev}
            disabled={!hasPrev}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 transition-colors"
            title="Previous Problem"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-slate-300 px-1 truncate max-w-[200px]">
            {currentProblem.order}. {currentProblem.title}
          </span>
          <button
            onClick={onSelectNext}
            disabled={!hasNext}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 transition-colors"
            title="Next Problem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Progress Stats & View Toggles */}
      <div className="flex items-center space-x-2.5">
        {/* Runtime Badge */}
        <div
          className="hidden xl:flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium"
          title="Python 3.12 WebAssembly client-side execution active with NumPy & NetworkX"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Python WASM (0-Cost Cloud)</span>
        </div>

        {/* Streak */}
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold text-[11px]">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{userProgress.streak}d streak</span>
        </div>

        {/* Solved Count */}
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{solvedCount} solved</span>
        </div>

        {/* Visualizers Button */}
        <button
          onClick={onToggleVisualizer}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            showingVisualizer
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Visualizers</span>
        </button>

        {/* Dashboard Button */}
        <button
          onClick={onToggleDashboard}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
            showingDashboard
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden md:inline">Dashboard</span>
        </button>
      </div>
    </header>
  );
};
