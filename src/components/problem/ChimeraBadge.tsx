import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Network } from 'lucide-react';

interface ChimeraBadgeProps {
  contextText: string;
}

export const ChimeraBadge: React.FC<ChimeraBadgeProps> = ({ contextText }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-4 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 rounded-lg p-3 text-xs text-indigo-200">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-indigo-300">
            Chimera M.Tech Connection
          </span>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Research Context
          </span>
        </div>
        <button className="text-indigo-400 hover:text-indigo-200 transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-2.5 pt-2.5 border-t border-indigo-500/20 text-slate-300 leading-relaxed text-xs">
          <div className="flex items-start space-x-2">
            <Network className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>{contextText}</p>
          </div>
        </div>
      )}
    </div>
  );
};
