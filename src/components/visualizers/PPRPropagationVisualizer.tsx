import React, { useState } from 'react';
import { Target, RotateCcw, Shuffle, Sparkles } from 'lucide-react';

export const PPRPropagationVisualizer: React.FC = () => {
  const entities = ['NVIDIA', 'CUDA', 'GPU', 'Transformer', 'Attention'];

  // Knowledge graph directed edges:
  // NVIDIA -> CUDA (w=3.0)
  // NVIDIA -> GPU (w=2.0)
  // CUDA -> GPU (w=4.0)
  // GPU -> Transformer (w=5.0)
  // Attention -> Transformer (w=4.0)
  const rawEdges = [
    [0, 1, 3.0],
    [0, 2, 2.0],
    [1, 2, 4.0],
    [2, 3, 5.0],
    [4, 3, 4.0],
  ];

  const n = entities.length;
  const [selectedSeeds, setSelectedSeeds] = useState<Record<number, number>>({ 0: 1.0 }); // seed: weight
  const [useReverseEdges, setUseReverseEdges] = useState(true);
  const [beta, setBeta] = useState(0.3);
  const [alpha, setAlpha] = useState(0.85);

  // Compute Bidirectional PPR in real time
  const W = Array.from({ length: n }, () => Array(n).fill(0.0));
  for (const [u, v, w] of rawEdges) {
    W[u][v] += w;
  }

  const W_bi = Array.from({ length: n }, () => Array(n).fill(0.0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      W_bi[i][j] = W[i][j] + (useReverseEdges ? beta * W[j][i] : 0.0);
    }
  }

  const rowSums = W_bi.map(r => r.reduce((a, b) => a + b, 0));
  const sinks = rowSums.map((s, i) => (s === 0 ? i : -1)).filter(i => i >= 0);
  const P = W_bi.map((r, i) =>
    rowSums[i] > 0 ? r.map(w => w / rowSums[i]) : Array(n).fill(0.0)
  );

  // Build personalization vector v
  const v = Array(n).fill(0.0);
  let totalW = 0;
  for (const [idxStr, wt] of Object.entries(selectedSeeds)) {
    const idx = Number(idxStr);
    v[idx] = wt;
    totalW += wt;
  }
  const vNorm = totalW > 0 ? v.map(x => x / totalW) : Array(n).fill(1 / n);

  // Power iteration
  let r = [...vNorm];
  for (let iter = 0; iter < 100; iter++) {
    const r_next = Array(n).fill(0.0);
    for (let i = 0; i < n; i++) {
      if (r[i] > 0 && !sinks.includes(i)) {
        for (let j = 0; j < n; j++) {
          r_next[j] += r[i] * P[i][j];
        }
      }
    }
    const sinkMass = sinks.reduce((acc, i) => acc + r[i], 0);
    const teleport = alpha * sinkMass + (1.0 - alpha);
    for (let j = 0; j < n; j++) {
      r_next[j] = alpha * r_next[j] + teleport * vNorm[j];
    }
    r = r_next;
  }

  const handleToggleSeed = (idx: number) => {
    setSelectedSeeds(prev => {
      const next = { ...prev };
      if (next[idx]) {
        delete next[idx];
      } else {
        next[idx] = 1.0;
      }
      return Object.keys(next).length > 0 ? next : { 0: 1.0 };
    });
  };

  // Node display positions
  const coords = [
    { x: 70, y: 150 },
    { x: 190, y: 70 },
    { x: 190, y: 230 },
    { x: 330, y: 150 },
    { x: 330, y: 260 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-slate-200 p-4 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Personalized PageRank (PPR) Probability Propagation</span>
          </h2>
          <p className="text-xs text-slate-400">
            Select seed entities to formulate vector <code className="text-indigo-300">v</code>. Toggle reverse edges to see bidirectional probability flow.
          </p>
        </div>

        <button
          onClick={() => setSelectedSeeds({ 0: 1.0 })}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Seeds</span>
        </button>
      </div>

      {/* Seed Entity Selector Pills */}
      <div className="bg-[#161b22] border border-slate-800 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Select Query Seed Entities:</span>
          <span className="text-[11px] text-slate-500">(Click to toggle seed active/inactive)</span>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {entities.map((name, i) => {
            const isSeed = selectedSeeds[i] !== undefined;
            return (
              <button
                key={name}
                onClick={() => handleToggleSeed(i)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSeed
                    ? 'bg-indigo-600 text-white shadow-md border border-indigo-400/40 ring-2 ring-indigo-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Target className={`w-3.5 h-3.5 ${isSeed ? 'text-white' : 'text-slate-400'}`} />
                <span>{name}</span>
                {isSeed && (
                  <span className="px-1 rounded bg-indigo-900/60 text-[10px] text-indigo-200">
                    Seed
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Reverse Edge Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useReverseEdges}
              onChange={e => setUseReverseEdges(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-slate-300 font-medium">
              Enable Weighted Reverse Edges (β = {beta})
            </span>
          </label>

          <span className="text-[11px] text-slate-400">
            Allows backward propagation from tail to head
          </span>
        </div>
      </div>

      {/* Graph Display & Ranking Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SVG Propagation Visualizer */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col items-center">
          <svg className="w-full h-[280px] bg-[#090d16] rounded-lg border border-slate-800/80">
            {/* Draw edges */}
            {rawEdges.map(([u, v, w], idx) => {
              const nodeU = coords[u];
              const nodeV = coords[v];
              return (
                <g key={idx}>
                  <line
                    x1={nodeU.x}
                    y1={nodeU.y}
                    x2={nodeV.x}
                    y2={nodeV.y}
                    stroke="#4338ca"
                    strokeWidth={2}
                    strokeOpacity={0.7}
                  />
                  {useReverseEdges && (
                    <line
                      x1={nodeV.x + 3}
                      y1={nodeV.y + 3}
                      x2={nodeU.x + 3}
                      y2={nodeU.y + 3}
                      stroke="#06b6d4"
                      strokeWidth={1}
                      strokeDasharray="3 2"
                      strokeOpacity={0.6}
                    />
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {entities.map((name, i) => {
              const isSeed = selectedSeeds[i] !== undefined;
              const score = r[i];
              const radius = 20 + score * 45;

              return (
                <g key={name} className="transition-all duration-300">
                  <circle
                    cx={coords[i].x}
                    cy={coords[i].y}
                    r={radius}
                    fill={isSeed ? '#3730a3' : '#1e293b'}
                    stroke={isSeed ? '#818cf8' : '#64748b'}
                    strokeWidth={isSeed ? 3.5 : 2}
                  />
                  <text
                    x={coords[i].x}
                    y={coords[i].y - 2}
                    fill="#f8fafc"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {name}
                  </text>
                  <text
                    x={coords[i].x}
                    y={coords[i].y + 12}
                    fill="#38bdf8"
                    fontSize={10}
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {score.toFixed(3)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Real-time PPR Rankings */}
        <div className="bg-[#161b22] border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Personalized PageRank Score Allocation
          </h3>

          <div className="space-y-2">
            {entities
              .map((name, i) => ({ name, score: r[i], isSeed: selectedSeeds[i] !== undefined }))
              .sort((a, b) => b.score - a.score)
              .map((item, rank) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2.5 rounded bg-[#0b0f17] border border-slate-800 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-400">
                      {rank + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    {item.isSeed && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] uppercase font-bold">
                        Query Seed
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${item.score * 100 * 2}%` }}
                      />
                    </div>
                    <span className="font-mono text-cyan-300 font-bold w-12 text-right">
                      {item.score.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
