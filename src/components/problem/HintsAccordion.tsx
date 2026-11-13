import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';

interface HintsAccordionProps {
  hints: string[];
}

export const HintsAccordion: React.FC<HintsAccordionProps> = ({ hints }) => {
  const [openHintIndex, setOpenHintIndex] = useState<number | null>(null);

  if (!hints || hints.length === 0) return null;

  return (
    <div className="mt-6 border-t border-slate-800 pt-5">
      <div className="flex items-center space-x-2 mb-3 text-slate-300 font-medium text-xs uppercase tracking-wider">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
        <span>Progressive Hints</span>
        <span className="text-slate-500 text-[11px] font-normal lowercase">
          (Reveal one by one if stuck)
        </span>
      </div>

      <div className="space-y-2">
        {hints.map((hint, index) => {
          const isOpen = openHintIndex === index;
          return (
            <div
              key={index}
              className="border border-slate-800 rounded-md bg-[#111827]/60 overflow-hidden"
            >
              <button
                onClick={() => setOpenHintIndex(isOpen ? null : index)}
                className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                    Hint {index + 1}
                  </span>
                  <span>{isOpen ? 'Click to hide hint' : `Reveal Hint ${index + 1}`}</span>
                </div>
                {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>

              {isOpen && (
                <div className="px-3.5 py-2.5 bg-[#0d131f] text-slate-300 text-xs border-t border-slate-800 leading-relaxed font-mono">
                  {hint}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
