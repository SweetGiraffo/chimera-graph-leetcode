import React, { useState } from 'react';
import { GraphEditorCanvas } from './GraphEditorCanvas';
import { MarkovWalkSimulator } from './MarkovWalkSimulator';
import { PageRankPowerIteration } from './PageRankPowerIteration';
import { PPRPropagationVisualizer } from './PPRPropagationVisualizer';
import { HybridRetrievalComparator } from './HybridRetrievalComparator';
import { Network, Footprints, Activity, Target, Layers, X } from 'lucide-react';

interface VisualizerHubProps {
  initialVisualizer?: string;
  onClose?: () => void;
}

export const VisualizerHub: React.FC<VisualizerHubProps> = ({
  initialVisualizer = 'graph-editor',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialVisualizer);

  const tabs = [
    { id: 'graph-editor', label: 'Graph Editor & Normalizer', icon: Network },
    { id: 'markov-walk', label: 'Markov Walk Simulator', icon: Footprints },
    { id: 'pagerank-visualizer', label: 'PageRank Iteration (α Slider)', icon: Activity },
    { id: 'ppr-propagator', label: 'PPR Probability Propagation', icon: Target },
    { id: 'hybrid-comparator', label: 'Hybrid Vector vs Graph RRF', icon: Layers },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200">
      {/* Top Visualizer Nav Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-800">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            title="Close Visualizer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Visualizer Body */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'graph-editor' && <GraphEditorCanvas />}
        {activeTab === 'markov-walk' && <MarkovWalkSimulator />}
        {activeTab === 'pagerank-visualizer' && <PageRankPowerIteration />}
        {activeTab === 'ppr-propagator' && <PPRPropagationVisualizer />}
        {activeTab === 'hybrid-comparator' && <HybridRetrievalComparator />}
      </div>
    </div>
  );
};
