import React, { useState } from 'react';
import { MODULES } from '../../data/modules';
import { ALL_PROBLEMS } from '../../data/problems';
import { Problem, ModuleInfo } from '../../types/problem';
import { UserProgressData } from '../../types/execution';
import { Search, CheckCircle2, ChevronDown, ChevronRight, Filter, BookOpen, Sparkles, X } from 'lucide-react';

interface SidebarProps {
  currentProblemId: string;
  onSelectProblem: (problem: Problem) => void;
  userProgress: UserProgressData;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentProblemId,
  onSelectProblem,
  userProgress,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  const toggleModuleCollapse = (moduleId: string) => {
    setCollapsedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Filter problems based on search, difficulty, and status
  const filteredProblems = ALL_PROBLEMS.filter(p => {
    const matchesSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.funcName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;

    const isSolved = (userProgress.problem_states[p.id]?.solved || 0) > 0;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Solved' && isSolved) ||
      (selectedStatus === 'Unsolved' && !isSolved);

    return matchesSearch && matchesDiff && matchesStatus;
  });

  const difficultyColors = {
    Easy: 'text-emerald-400',
    Medium: 'text-amber-400',
    Hard: 'text-rose-400',
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 md:w-88 h-full bg-[#161b22] border-r border-slate-800 flex flex-col z-30 shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-slate-100 text-sm">Curriculum Roadmap</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 border-b border-slate-800 space-y-2 bg-[#0d1117]/50">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search problems, topics, tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#161b22] border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1">
            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1">
            {['All', 'Solved'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  selectedStatus === st
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modules List Accordion */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {MODULES.map(module => {
          const moduleProblems = filteredProblems.filter(p => p.moduleId === module.id);
          if (searchQuery && moduleProblems.length === 0) return null;

          const totalInModule = ALL_PROBLEMS.filter(p => p.moduleId === module.id).length;
          const solvedInModule = ALL_PROBLEMS.filter(
            p => p.moduleId === module.id && (userProgress.problem_states[p.id]?.solved || 0) > 0
          ).length;
          const pct = totalInModule > 0 ? Math.round((solvedInModule / totalInModule) * 100) : 0;
          const isCollapsed = collapsedModules[module.id];

          return (
            <div
              key={module.id}
              className="rounded-lg bg-[#0d1117] border border-slate-800/80 overflow-hidden"
            >
              {/* Module Header */}
              <div
                onClick={() => toggleModuleCollapse(module.id)}
                className="p-2.5 flex items-start justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Module {module.number}
                    </span>
                    {pct === 100 && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 line-clamp-1 leading-snug">
                    {module.title}
                  </h3>
                  {/* Progress Mini Bar */}
                  <div className="flex items-center space-x-2 mt-1.5">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {solvedInModule}/{totalInModule}
                    </span>
                  </div>
                </div>

                <button className="text-slate-400 pt-1">
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Problems inside module */}
              {!isCollapsed && (
                <div className="border-t border-slate-800/60 divide-y divide-slate-800/40">
                  {moduleProblems.map(problem => {
                    const isSelected = problem.id === currentProblemId;
                    const isSolved = (userProgress.problem_states[problem.id]?.solved || 0) > 0;

                    return (
                      <div
                        key={problem.id}
                        onClick={() => onSelectProblem(problem)}
                        className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? 'bg-indigo-600/25 border-l-2 border-indigo-500 text-white'
                            : 'hover:bg-slate-800/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 overflow-hidden pr-2">
                          {isSolved ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                          )}
                          <span className="truncate">
                            {problem.order}. {problem.title}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-semibold shrink-0 ${
                            difficultyColors[problem.difficulty]
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
